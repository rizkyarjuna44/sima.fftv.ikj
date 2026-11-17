# SIMA v17.8 - FFTV IKJ

Sistem Informasi Manajemen Aset Fakultas Film & Televisi IKJ.

## 🚀 Setup 10 Menit

### 1. Buat Akun Supabase (GRATIS)
1. Buka https://supabase.com → Sign Up
2. Buat Project baru (catat password database)
3. Tunggu project ready (~2 menit)

### 2. Dapatkan API Keys
Di dashboard Supabase → Settings → API, catat:
- **Project URL** (contoh: https://xxxxx.supabase.co)
- **anon public key**
- **service_role key** (RAHASIA!)

### 3. Jalankan SQL Schema
1. Buka menu **SQL Editor** di Supabase
2. Copy semua isi file `database/schema.sql`
3. Klik **Run**

### 4. Buat Storage Bucket
1. Buka menu **Storage** di Supabase
2. Klik **New Bucket**
3. Nama: `aset-files`
4. Centang **Public bucket**
5. Save

### 5. Deploy ke Vercel
1. Push folder ini ke GitHub
2. Buka https://vercel.com → Import GitHub Repository
3. Di **Environment Variables**, tambahkan:
   - `SUPABASE_URL` = URL project Supabase
   - `SUPABASE_ANON_KEY` = anon key
   - `SUPABASE_SERVICE_KEY` = service_role key
   - `JWT_SECRET` = random string 32 karakter (contoh: `sima_fftv_ikj_2026_secret_key_abc123`)
4. Klik **Deploy**

### 6. Login Pertama
- Username: `ADMIN001`
- Password: `0000`
- **WAJIB ganti password setelah login pertama!**

## 🔐 Keamanan
- PIN/Password di-hash dengan bcrypt
- Session JWT expired 5 menit (sesuai UI)
- RLS (Row Level Security) aktif di database
- Service key hanya di server (tidak terekspos ke client)

## 📱 Fitur
- ✅ Login multi-role (Admin, Staff, Mahasiswa, Dosen, Karyawan)
- ✅ Dashboard statistik aset
- ✅ CRUD aset dengan foto
- ✅ Upload file ke cloud storage
- ✅ Session timer 5 menit + perpanjang sesi
- ✅ Responsive design