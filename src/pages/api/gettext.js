import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const filePath = path.join(process.cwd(), 'digitized.json');
      
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Read the contents of the file
      const data = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(data);

      res.status(200).json(jsonData);
    } catch (error) {
      console.error('Error reading file:', error);
      res.status(500).json({ error: 'Error reading file' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
