import OpenAI from 'openai';
import { put, list, del } from "@vercel/blob";
import fetch from 'node-fetch';


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function deleteAllBlobs() {
  let cursor;
 
  do {
    const listResult = await list({
      cursor,
      limit: 1000,
      prefix: 'snap-notes/'
    });
 
    if (listResult.blobs.length > 0) {
      await del(listResult.blobs.map((blob) => blob.url));
    }
 
    cursor = listResult.cursor;
  } while (cursor);
 
  console.log('All blobs were deleted');
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Adjust the limit as needed
    },
  },
};

async function digitizeImage(imageUrl) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Please digitize this image. Only respond with the text." },
            {
              type: "image_url",
              image_url: {
                "url": imageUrl,
              },
            }
          ],
        },
      ],
    });
    return response['choices'][0]['message']['content'];
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { image, description } = req.body;
      const base64Data = image;
      const text = await digitizeImage(base64Data);

      // Prepare markdown content with a timestamp
      const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      let markdownContent = '';
      if (description) {
        markdownContent = `### ${description}\n\n${text}\n\n`;
      } else {
        markdownContent = `### ${timestamp}\n\n${text}\n\n`;
      }

      // Read existing content from Vercel Blob Storage
      const blobPath = 'snap-notes/digitized.md';
      let existingContent = '';
      try {
        const response = await list({prefix: 'snap-notes/'});
        const listOfBlobs = response.blobs;
        const firstBlob = listOfBlobs[0].downloadUrl;
        const res = await fetch(firstBlob);
        if (res.ok) {
          existingContent = await res.text();
        }
        await deleteAllBlobs();
      } catch (error) {
        console.log(error);
        console.log('No existing content found, creating new file.');
      }

      // Write new content at the top
      await put(blobPath, markdownContent + existingContent, {
        access: 'public', // or 'private' depending on your needs
      });

    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Error processing request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

