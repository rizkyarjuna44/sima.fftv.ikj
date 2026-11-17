import jwt from 'jsonwebtoken';
import { getSupabase, getSupabaseAdmin } from './lib/supabase.js';

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
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ success: false, message: 'Sesi berakhir, silakan login ulang' });

  const supabase = getSupabase();
  const supabaseAdmin = getSupabaseAdmin();

  try {
    // GET - List aset
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('aset')
        .select('*, kategori_aset(nama, icon)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    }

    // POST - Tambah aset (hanya admin/staff)
    if (req.method === 'POST') {
      if (!['admin', 'staff'].includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Hanya admin/staff yang bisa menambah aset' });
      }
      const body = req.body;
      const { data, error } = await supabaseAdmin
        .from('aset')
        .insert([{ ...body, created_by: user.userId }])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json({ success: true, data });
    }

    // PUT - Update aset
    if (req.method === 'PUT') {
      if (!['admin', 'staff'].includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Hanya admin/staff' });
      }
      const { id, ...updates } = req.body;
      updates.updated_at = new Date().toISOString();
      const { data, error } = await supabaseAdmin
        .from('aset')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    // DELETE - Hapus aset
    if (req.method === 'DELETE') {
      if (!['admin', 'staff'].includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Hanya admin/staff' });
      }
      const { id } = req.body;
      const { error } = await supabaseAdmin.from('aset').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}