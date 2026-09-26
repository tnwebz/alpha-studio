import crypto from 'node:crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicId } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    if (!publicId || typeof publicId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid publicId parameter' });
    }

    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'ddu0tdvh';
    const apiKey = process.env.VITE_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY || '514419284843772';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      return res.status(500).json({ error: 'Server configuration error: missing Cloudinary API secret' });
    }

    const timestamp = Math.round(Date.now() / 1000);
    // Cloudinary signature convention: parameters in alphabetical order
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[API delete-cloudinary] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
