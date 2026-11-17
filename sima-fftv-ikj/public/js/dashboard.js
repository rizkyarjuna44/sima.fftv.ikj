const token = localStorage.getItem('sima_token');
const user = JSON.parse(localStorage.getItem('sima_user') || 'null');
const loginTime = parseInt(localStorage.getItem('sima_login_time') || '0');

if (!token || !user) {
  window.location.href = '/index.html';
}

document.getElementById('userName').textContent = user.nama;
document.getElementById('userRole').textContent = user.role.toUpperCase();

// Session Timer (5 menit)
const SESSION_DURATION = 5 * 60 * 1000;
let remaining = SESSION_DURATION - (Date.now() - loginTime);

function updateTimer() {
  remaining -= 1000;
  if (remaining <= 0) {
    alert('Sesi berakhir. Silakan login ulang.');
    localStorage.clear();
    window.location.href = '/index.html';
    return;
  }
  const min = Math.floor(remaining / 60000);
  const sec = Math.floor((remaining % 60000) / 1000);
  document.getElementById('sessionTimer').textContent = `${min}:${sec.toString().padStart(2, '0')}`;
}
setInterval(updateTimer, 1000);

document.getElementById('btnExtend').addEventListener('click', () => {
  localStorage.setItem('sima_login_time', Date.now().toString());
  remaining = SESSION_DURATION;
  alert('Sesi diperpanjang 5 menit');
});

document.getElementById('btnLogout').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  localStorage.clear();
  window.location.href = '/index.html';
});

// Load data aset
async function loadAset() {
  try {
    const res = await fetch('/api/aset', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    
    const list = data.data || [];
    document.getElementById('totalAset').textContent = list.length;
    document.getElementById('totalTersedia').textContent = list.filter(a => a.status === 'Tersedia').length;
    document.getElementById('totalDipinjam').textContent = list.filter(a => a.status === 'Dipinjam').length;
    document.getElementById('totalRusak').textContent = list.filter(a => a.kondisi !== 'Baik').length;

    const listEl = document.getElementById('asetList');
    listEl.innerHTML = list.map(a => `
      <div class="aset-card">
        <img src="${a.foto_url || 'https://via.placeholder.com/100'}" alt="${a.nama_aset}">
        <div class="aset-info">
          <h3>${a.kode_aset} - ${a.nama_aset}</h3>
          <p>${a.kategori_aset?.icon || ''} ${a.kategori_aset?.nama || '-'}</p>
          <p>📍 ${a.lokasi || '-'}</p>
          <span class="badge ${a.status.toLowerCase()}">${a.status}</span>
        </div>
      </div>
    `).join('') || '<p>Belum ada aset.</p>';
  } catch (err) {
    alert('Gagal memuat data: ' + err.message);
  }
}

loadAset();