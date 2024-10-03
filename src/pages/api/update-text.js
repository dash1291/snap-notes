import { put, list, del} from '@vercel/blob';

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

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { markdownContent } = req.body;

      if (!markdownContent) {
        return res.status(400).json({ error: 'Markdown content is required' });
      }

      // Define the blob path
      const blobPath = 'snap-notes/digitized.md';
      await deleteAllBlobs();
      // Write the markdown content to Vercel Blob Storage
      const response = await put(blobPath, markdownContent, {
        access: 'public', // or 'private' depending on your needs
      });

      res.status(200).json({ message: 'Markdown content saved successfully', url: response.url });
    } catch (error) {
      console.error('Error writing to blob storage:', error);
      res.status(500).json({ error: 'Error writing to blob storage' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}