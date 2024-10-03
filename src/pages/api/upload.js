import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';


  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
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
      const { image } = req.body;
      const base64Data = image;
      const text = await digitizeImage(base64Data);

      const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      const markdownContent = `### ${timestamp}\n\n${text}\n\n`;
      const filePath = path.join(process.cwd(), 'digitized.md');
      // Read existing content
      const existingContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
      // Write new content at the top
      fs.writeFileSync(filePath, markdownContent + existingContent);
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Error processing request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

