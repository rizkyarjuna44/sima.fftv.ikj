import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabaseAdmin } from './lib/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { mode, username, password, pin } = req.body;
    const supabase = getSupabaseAdmin();

    // Mode Admin
    if (mode === 'admin') {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('nim_nip', username)
        .in('role', ['admin', 'staff'])
        .single();

      if (error || !user) {
        return res.status(401).json({ success: false, message: 'Username atau password salah' });
      }

      const valid = await bcrypt.compare(password, user.pin_hash);
      if (!valid) return res.status(401).json({ success: false, message: 'Password salah' });

      return createSession(res, user);
    }

    // Mode Mahasiswa/Dosen/Karyawan (pakai PIN)
    if (mode === 'user') {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('nim_nip', username)
        .in('role', ['mahasiswa', 'dosen', 'karyawan'])
        .single();

      if (error || !user) {
        return res.status(401).json({ success: false, message: 'NIM/NIP atau PIN salah' });
      }

      const valid = await bcrypt.compare(pin, user.pin_hash);
      if (!valid) return res.status(401).json({ success: false, message: 'PIN salah' });

      return createSession(res, user);
    }

    return res.status(400).json({ success: false, message: 'Mode tidak valid' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
}

function createSession(res, user) {
  const token = jwt.sign(
    {
      userId: user.id,
      nimNip: user.nim_nip,
      nama: user.nama_lengkap,
      role: user.role,
      mustChangePin: user.must_change_pin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 5 * 60 // 5 menit
    },
    process.env.JWT_SECRET
  );

  res.setHeader('Set-Cookie', `sima_token=${token}; HttpOnly; Path=/; Max-Age=300; SameSite=Lax`);
  return res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      nimNip: user.nim_nip,
      nama: user.nama_lengkap,
      role: user.role,
      mustChangePin: user.must_change_pin
    }
  });
}