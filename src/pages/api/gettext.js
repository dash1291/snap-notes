import fetch from 'node-fetch';
import { list } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let existingContent = '';
      
      const listResponse = await list({prefix: 'snap-notes/'});
      const listOfBlobs = listResponse.blobs;
      const firstBlob = listOfBlobs[0].downloadUrl;
      const fetchResponse = await fetch(firstBlob);
      
      if (fetchResponse.ok) {
        existingContent = await fetchResponse.text();
      }

      res.status(200).send(existingContent)
    } catch (error) {
      console.error('Error reading file:', error);
      res.status(500).json({ error: 'Error reading file' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
