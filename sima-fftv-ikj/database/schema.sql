-- Tabel Users (Admin, Staff, Mahasiswa, Dosen, Karyawan)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nim_nip VARCHAR(20) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'mahasiswa', 'dosen', 'karyawan')),
  email VARCHAR(100),
  must_change_pin BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Tabel Kategori Aset
CREATE TABLE kategori_aset (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Aset
CREATE TABLE aset (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kode_aset VARCHAR(30) UNIQUE NOT NULL,
  nama_aset VARCHAR(150) NOT NULL,
  kategori_id UUID REFERENCES kategori_aset(id),
  deskripsi TEXT,
  kondisi VARCHAR(20) DEFAULT 'Baik' CHECK (kondisi IN ('Baik', 'Rusak Ringan', 'Rusak Berat')),
  lokasi VARCHAR(100),
  tahun_perolehan INTEGER,
  harga_perolehan BIGINT,
  foto_url TEXT,
  dokumen_url TEXT,
  status VARCHAR(20) DEFAULT 'Tersedia' CHECK (status IN ('Tersedia', 'Dipinjam', 'Dalam Perbaikan', 'Dihapus')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Peminjaman
CREATE TABLE peminjaman (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aset_id UUID REFERENCES aset(id),
  peminjam_id UUID REFERENCES users(id),
  tanggal_pinjam DATE NOT NULL,
  tanggal_kembali DATE,
  status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Dikembalikan', 'Terlambat')),
  catatan TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Log Aktivitas
CREATE TABLE log_aktivitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  aksi VARCHAR(50) NOT NULL,
  detail TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX idx_aset_kode ON aset(kode_aset);
CREATE INDEX idx_aset_kategori ON aset(kategori_id);
CREATE INDEX idx_users_nim ON users(nim_nip);

-- Data awal: Kategori
INSERT INTO kategori_aset (nama, icon) VALUES
  ('Kamera', '📷'),
  ('Lensa', '🔭'),
  ('Lighting', '💡'),
  ('Audio', '🎙️'),
  ('Komputer Editing', '💻'),
  ('Tripod', '📐'),
  ('Drone', '🚁'),
  ('Lainnya', '📦');

-- Data awal: Admin default (PIN: 0000, WAJIB GANTI saat login pertama)
-- PIN hash untuk "0000" dengan bcrypt
INSERT INTO users (nim_nip, nama_lengkap, pin_hash, role, must_change_pin) VALUES
  ('ADMIN001', 'Administrator FFTV', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', true);

-- Aktifkan RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE aset ENABLE ROW LEVEL SECURITY;
ALTER TABLE peminjaman ENABLE ROW LEVEL SECURITY;

-- Policy: Semua user terautentikasi bisa baca aset
CREATE POLICY "Aset dapat dibaca semua user" ON aset
  FOR SELECT USING (true);

-- Policy: Hanya admin/staff yang bisa insert/update/delete aset
CREATE POLICY "Hanya admin/staff kelola aset" ON aset
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = aset.created_by 
      AND users.role IN ('admin', 'staff')
    )
  );