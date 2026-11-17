import formidable from 'formidable';
import jwt from 'jsonwebtoken';
import { getSupabaseAdmin } from './lib/supabase.js';

export const config = { api: { bodyParser: false } };

function verifyToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const cookie = req.headers.cookie || '';
  const cookieToken = cookie.split('sima_token=').pop()?.split(';')[0];
  const finalToken = token || cookieToken;
  if (!finalToken) return null;
  try {
    return jwt.verify(finalToken, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 }); // 10MB
  const supabase = getSupabaseAdmin();

  try {
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];
    if (!file) return res.status(400).json({ success: false, message: 'File kosong' });

    const fs = await import('fs');
    const buffer = fs.readFileSync(file.filepath);
    const ext = file.originalFilename.split('.').pop();
    const fileName = `${user.userId}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('aset-files')
      .upload(fileName, buffer, { contentType: file.mimetype, upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from('aset-files').getPublicUrl(data.path);

    return res.status(200).json({ success: true, url: urlData.publicUrl, path: data.path });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}