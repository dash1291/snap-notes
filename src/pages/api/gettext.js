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

      res.setHeader('Access-Control-Allow-Credentials', true)
      res.setHeader('Access-Control-Allow-Origin', '*')
      // another common pattern
      // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
      )
      res.status(200).send(existingContent)
    } catch (error) {
      console.error('Error reading file:', error);
      res.status(500).json({ error: 'Error reading file' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
