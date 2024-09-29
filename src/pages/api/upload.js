import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';


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
            { type: "text", text: "Please digitize this image. Just give me the text." },
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
    console.log(response.choices[0]);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { image } = req.body;
      const base64Data = image;
      //const filePath = path.join(process.cwd(), `${Date.now()}.png`);

      /*fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
          console.error('Error saving image:', err);
          return res.status(500).json({ error: 'Error saving image' });
        }
        res.status(200).json({ message: 'Image uploaded successfully', filePath });
      });*/
      await digitizeImage(base64Data);
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Error processing request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}