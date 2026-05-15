// ── Saudação ──────────────────────────────────────────────────────────────
const h = new Date().getHours();
document.getElementById('greeting').textContent =
  h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';

// ── Reveal ao rolar ───────────────────────────────────────────────────────
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));

// ── Player ────────────────────────────────────────────────────────────────
let tracks = [], cur = 0, playing = false, elapsed = 0, timer = null;
let currentAudio = null;

function setTrack(i) {
  cur = i; elapsed = 0;
  const t = tracks[cur];
  if (!t) return;
  document.getElementById('nowTitle').textContent  = t.titulo || t.title;
  document.getElementById('nowArtist').textContent = t.nome_artista || t.artist || '';
  document.getElementById('totalTime').textContent = t.duracao || t.dur || '0:00';
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('curTime').textContent = '0:00';

  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (t.preview_url) {
    currentAudio = new Audio(t.preview_url);
    currentAudio.volume = 0.7;
    if (playing) currentAudio.play().catch(() => {});
    currentAudio.ontimeupdate = () => {
      const pct = (currentAudio.currentTime / (currentAudio.duration || 30)) * 100;
      document.getElementById('progressFill').style.width = pct + '%';
      const s = Math.floor(currentAudio.currentTime);
      document.getElementById('curTime').textContent = Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
    };
    currentAudio.onended = () => setTrack((cur + 1) % tracks.length);
  }
  setMusicPlaying(playing);
}

document.getElementById('playBtn').onclick = function () {
  playing = !playing;
  document.getElementById('playIcon').innerHTML = playing
    ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
    : '<path d="M8 5v14l11-7z"/>';
  if (currentAudio) {
    playing ? currentAudio.play().catch(() => {}) : currentAudio.pause();
  }
  setMusicPlaying(playing);
};

document.getElementById('nextBtn').onclick = () => { playing = true; setTrack((cur + 1) % tracks.length); };
document.getElementById('prevBtn').onclick = () => { playing = true; setTrack((cur - 1 + tracks.length) % tracks.length); };

document.getElementById('heartBtn').onclick = async function () {
  const t = tracks[cur];
  if (!t || !t.id_musica) return;
  const idUsuario = window._userId;
  if (!idUsuario) return;
  this.classList.toggle('liked');
  const liked = this.classList.contains('liked');
  if (liked) {
    await fetch('/api/curtidas', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id_usuario: idUsuario, id_musica: t.id_musica }) });
  } else {
    await fetch(`/api/curtidas/${idUsuario}/${t.id_musica}`, { method: 'DELETE' });
  }
};

// ── Sidebar mobile ────────────────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
document.getElementById('menuBtn').onclick = () => { sidebar.classList.toggle('open'); overlay.classList.toggle('open'); };
overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); };

// ── Utils ─────────────────────────────────────────────────────────────────
const GRADS = ['grad-1','grad-2','grad-3','grad-4','grad-5','grad-6','grad-7','grad-8','grad-9','grad-10'];
function grad(i) { return GRADS[i % GRADS.length]; }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
const playSvg = `<div class="play-overlay"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div>`;

// ── Carregar dados ────────────────────────────────────────────────────────
async function loadSidebarPlaylists(idUsuario) {
  const res = await fetch('/api/playlists/minhas').catch(() => null);
  if (!res || !res.ok) return;
  const { data } = await res.json();
  const list = document.getElementById('sidebarPlaylistList');
  if (!list) return;
  if (!data || data.length === 0) {
    list.innerHTML = '<span style="color:#666;font-size:0.8rem;padding:8px 4px;display:block">Nenhuma playlist criada</span>';
    return;
  }
  list.innerHTML = data.slice(0, 6).map((p, i) => `
    <a href="/playlist" class="playlist-item">
      <div class="playlist-thumb ${grad(i)}" style="background:linear-gradient(135deg,${esc(p.cor||'#6b9997')}88,${esc(p.cor||'#6b9997')}cc)"></div>
      <div class="playlist-info">
        <span class="playlist-name">${esc(p.nome)}</span>
        <span class="playlist-meta">${p.total_musicas||0} músicas</span>
      </div>
    </a>`).join('');
}

async function loadQuickCards() {
  const res = await fetch('/api/playlists/minhas').catch(() => null);
  if (!res || !res.ok) return;
  const { data } = await res.json();
  const grid = document.getElementById('quickGrid');
  if (!grid || !data || data.length === 0) return;
  grid.innerHTML = data.slice(0, 6).map((p, i) => `
    <a href="/playlist" class="quick-card">
      <div class="quick-thumb ${grad(i)}" style="background:linear-gradient(135deg,${esc(p.cor||'#6b9997')}88,${esc(p.cor||'#6b9997')}cc)"></div>
      <span>${esc(p.nome)}</span>
    </a>`).join('');
}

async function loadPlaylists() {
  const res = await fetch('/api/playlists/minhas').catch(() => null);
  if (!res || !res.ok) return;
  const { data } = await res.json();
  const row = document.getElementById('playlistsRow');
  if (!row) return;
  if (!data || data.length === 0) {
    row.innerHTML = '<p style="color:#666;font-size:0.9rem">Nenhuma playlist ainda. <a href="/biblioteca" style="color:#6b9997">Criar uma</a></p>';
    return;
  }
  row.innerHTML = data.slice(0, 5).map((p, i) => `
    <a href="/playlist" class="music-card">
      <div class="card-cover ${grad(i)}" style="background:linear-gradient(135deg,${esc(p.cor||'#6b9997')}88,${esc(p.cor||'#6b9997')}cc)">${playSvg}</div>
      <h4>${esc(p.nome)}</h4>
      <p>${p.total_musicas||0} músicas</p>
    </a>`).join('');
}

async function loadRecentlyPlayed(idUsuario) {
  const res = await fetch(`/api/historico/${idUsuario}`).catch(() => null);
  if (!res || !res.ok) return;
  const { data } = await res.json();
  const row = document.getElementById('recentRow');
  if (!row) return;
  if (!data || data.length === 0) {
    row.innerHTML = '<p style="color:#666;font-size:0.9rem">Nenhuma música tocada ainda.</p>';
    return;
  }
  // Remove duplicatas pelo id_musica
  const seen = new Set();
  const unique = data.filter(m => { if (seen.has(m.id_musica)) return false; seen.add(m.id_musica); return true; });
  row.innerHTML = unique.slice(0, 5).map((m, i) => `
    <div class="music-card" style="cursor:pointer" onclick="playTrack(${JSON.stringify(m).replace(/"/g,'&quot;')})">
      <div class="card-cover ${grad(i)}">${playSvg}</div>
      <h4>${esc(m.titulo)}</h4>
      <p>${esc(m.nome_artista)}</p>
    </div>`).join('');
}

async function loadArtists() {
  const res = await fetch('/api/artistas').catch(() => null);
  if (!res || !res.ok) return;
  const { data } = await res.json();
  const row = document.getElementById('artistsRow');
  if (!row || !data) return;
  row.innerHTML = data.slice(0, 5).map((a, i) => `
    <div class="artist-card">
      <div class="artist-avatar-home ${grad(i)}"></div>
      <h4>${esc(a.nome_artista)}</h4>
      <p>Artista · ${a.total_musicas||0} músicas</p>
    </div>`).join('');
}

function playTrack(m) {
  if (!tracks.find(t => t.id_musica === m.id_musica)) tracks.push(m);
  const idx = tracks.findIndex(t => t.id_musica === m.id_musica);
  playing = true;
  document.getElementById('playIcon').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  setTrack(idx);
}

// ── Avatar / Perfil ───────────────────────────────────────────────────────
async function loadUserProfile() {
  const res = await fetch('/api/me').catch(() => null);
  if (!res) return;
  if (res.status === 401) { window.location.href = '/login'; return; }
  const { data: user } = await res.json();
  window._userId = user.id_usuario;

  const avatarEl = document.getElementById('userAvatar');
  if (user.foto_perfil) {
    avatarEl.innerHTML = `<img src="${user.foto_perfil}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    avatarEl.style.padding = '0';
  } else {
    avatarEl.textContent = user.nome.split(' ').slice(0,2).map(p=>p[0].toUpperCase()).join('');
  }
  document.getElementById('menuNomeUsuario').textContent = user.nome;
  if (!user.is_admin) {
    const al = document.getElementById('adminLink');
    if (al) al.style.display = 'none';
  }

  // upload de foto
  const menu = document.getElementById('avatarMenu');
  if (menu && !document.getElementById('fotoUploadBtn')) {
    const lbl = document.createElement('label');
    lbl.id = 'fotoUploadBtn';
    lbl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px 12px;color:#fff;border-radius:8px;font-size:0.9rem;cursor:pointer;';
    lbl.innerHTML = '📷 Alterar foto';
    lbl.onmouseover = () => lbl.style.background = '#2a2a3e';
    lbl.onmouseout  = () => lbl.style.background = 'transparent';
    const fi = document.createElement('input');
    fi.type = 'file'; fi.accept = 'image/*'; fi.style.display = 'none';
    fi.onchange = uploadFoto;
    lbl.appendChild(fi);
    lbl.onclick = () => fi.click();
    const sair = menu.querySelector('a[href="/logout"]');
    sair ? menu.insertBefore(lbl, sair) : menu.appendChild(lbl);
  }

  // carregar seções que dependem do usuário
  loadSidebarPlaylists();
  loadQuickCards();
  loadPlaylists();
  loadRecentlyPlayed(user.id_usuario);
  loadArtists();
}

async function uploadFoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const form = new FormData();
  form.append('foto', file);
  const res  = await fetch('/api/me/foto', { method: 'POST', body: form }).catch(() => null);
  if (!res) return;
  const json = await res.json();
  if (res.ok && json.data?.foto_perfil) {
    const el = document.getElementById('userAvatar');
    el.innerHTML = `<img src="${json.data.foto_perfil}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    el.style.padding = '0';
  }
  document.getElementById('avatarMenu').style.display = 'none';
}

function toggleAvatarMenu() {
  const menu = document.getElementById('avatarMenu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.avatar-wrap'))
    document.getElementById('avatarMenu').style.display = 'none';
});

// ── Busca ─────────────────────────────────────────────────────────────────
let _searchTimer = null;
const searchInput    = document.getElementById('searchInput');
const searchDropdown = document.getElementById('searchDropdown');

searchInput.addEventListener('input', () => {
  clearTimeout(_searchTimer);
  const q = searchInput.value.trim();
  if (!q) { searchDropdown.style.display = 'none'; return; }
  _searchTimer = setTimeout(() => runSearch(q), 350);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrap')) searchDropdown.style.display = 'none';
});

async function runSearch(q) {
  searchDropdown.style.display = 'block';
  searchDropdown.innerHTML = '<p style="padding:16px;color:#666;font-size:.85rem">Buscando…</p>';

  const [musicRes, playlistRes] = await Promise.all([
    fetch(`/api/deezer/search?q=${encodeURIComponent(q)}&limit=5`).catch(() => null),
    fetch('/api/playlists').catch(() => null),
  ]);

  const musicas   = musicRes?.ok   ? (await musicRes.json()).data   || [] : [];
  const playlists = playlistRes?.ok ? (await playlistRes.json()).data || [] : [];

  const filteredPl = playlists
    .filter(p => p.nome.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 4);

  if (!musicas.length && !filteredPl.length) {
    searchDropdown.innerHTML = '<p style="padding:16px;color:#666;font-size:.85rem">Nenhum resultado encontrado.</p>';
    return;
  }

  let html = '';

  if (musicas.length) {
    html += `<div style="padding:10px 16px 4px;font-size:.75rem;color:#888;text-transform:uppercase;letter-spacing:.06em">Músicas</div>`;
    html += musicas.map(m => `
      <div onclick="playFromSearch(${JSON.stringify(m).replace(/"/g,'&quot;')})"
        style="display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;transition:background .15s"
        onmouseover="this.style.background='#2a2a3e'" onmouseout="this.style.background='transparent'">
        <img src="${esc(m.capa||'')}" alt="" style="width:38px;height:38px;border-radius:6px;object-fit:cover;background:#2a2a3e" onerror="this.style.display='none'">
        <div style="overflow:hidden">
          <div style="color:#e8e8f0;font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(m.titulo)}</div>
          <div style="color:#888;font-size:.8rem">${esc(m.artista)}</div>
        </div>
      </div>`).join('');
  }

  if (filteredPl.length) {
    html += `<div style="padding:10px 16px 4px;font-size:.75rem;color:#888;text-transform:uppercase;letter-spacing:.06em;border-top:1px solid #2a2a3e;margin-top:4px">Playlists</div>`;
    html += filteredPl.map((p, i) => `
      <a href="/playlist" style="display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;text-decoration:none;transition:background .15s"
        onmouseover="this.style.background='#2a2a3e'" onmouseout="this.style.background='transparent'">
        <div style="width:38px;height:38px;border-radius:6px;background:linear-gradient(135deg,${esc(p.cor||'#6b9997')}99,${esc(p.cor||'#4e7f82')}cc);flex-shrink:0"></div>
        <div>
          <div style="color:#e8e8f0;font-size:.9rem">${esc(p.nome)}</div>
          <div style="color:#888;font-size:.8rem">${p.total_musicas||0} músicas · ${esc(p.nome_usuario||'')}</div>
        </div>
      </a>`).join('');
  }

  searchDropdown.innerHTML = html;
}

function playFromSearch(m) {
  searchDropdown.style.display = 'none';
  searchInput.value = '';
  const track = {
    id_musica: m.deezer_id,
    titulo: m.titulo,
    nome_artista: m.artista,
    duracao: m.duracao,
    preview_url: m.preview_url,
  };
  tracks.push(track);
  playing = true;
  document.getElementById('playIcon').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  setTrack(tracks.length - 1);
}

// ── Init ─────────────────────────────────────────────────────────────────
loadUserProfile();
