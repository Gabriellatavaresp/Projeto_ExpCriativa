/**
 * biblioteca.js — Biblioteca do usuário (playlists do banco via API)
 */

const COLORS = [
  { label: 'Mint',      value: '#8ab8a8' },
  { label: 'Teal',      value: '#6b9997' },
  { label: 'Dark Teal', value: '#54787d' },
  { label: 'Sage',      value: '#c6cca5' },
  { label: 'Brown',     value: '#615145' },
  { label: 'Slate',     value: '#3d4f52' },
];

let playlists     = [];
let activeId      = null;
let activeFilter  = 'all';
let searchQuery   = '';
let selectedColor = COLORS[0].value;
let sortIdx       = 0;
let sortAsc       = true;

// ── Carrega do banco ────────────────────────────────────────────────────────
async function loadPlaylists() {
  try {
    const res  = await fetch('/api/playlists/minhas');
    if (res.status === 401) { window.location.href = '/login'; return; }
    const json = await res.json();
    playlists  = (json.data || []).map(p => ({
      id:     p.id_playlist,
      name:   p.nome,
      tracks: p.total_musicas || 0,
      type:   'playlist',
      color:  p.cor || '#8ab8a8',
    }));
    if (playlists.length > 0) activeId = playlists[0].id;
    document.getElementById('countLabel').textContent =
      playlists.length + (playlists.length === 1 ? ' playlist' : ' playlists');
    render();
  } catch (e) {
    console.error('Erro ao carregar playlists:', e);
  }
}

// ── Filtro ──────────────────────────────────────────────────────────────────
function filtered() {
  return playlists.filter(p => {
    const matchFilter = activeFilter === 'all' || p.type === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
}

// ── Render sidebar ──────────────────────────────────────────────────────────
function renderSidebar() {
  const list  = document.getElementById('sidebarList');
  const empty = document.getElementById('sidebarEmpty');
  const count = document.getElementById('countLabel');
  const items = filtered();

  count.textContent = items.length + (items.length === 1 ? ' playlist' : ' playlists');

  list.innerHTML = items.map(p => `
    <button
      class="playlist-item ${p.id === activeId ? 'active' : ''}"
      onclick="window.location='/playlist?id=${p.id}'"
    >
      <div class="pl-cover-placeholder" style="background:linear-gradient(135deg,${p.color}88,${p.color}cc)">
        <svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      </div>
      <div class="pl-info">
        <div class="pl-name">${escHtml(p.name)}</div>
        <div class="pl-meta">Playlist · ${p.tracks} faixas</div>
      </div>
      <div class="pl-playing">
        <div class="bar"></div><div class="bar"></div><div class="bar"></div>
      </div>
    </button>
  `).join('');

  empty.style.display = items.length === 0 ? 'flex' : 'none';
}

// ── Render grid ─────────────────────────────────────────────────────────────
function renderGrid() {
  const grid  = document.getElementById('mainGrid');
  const empty = document.getElementById('gridEmpty');
  const items = filtered();

  [...grid.querySelectorAll('.card')].forEach(c => c.remove());

  items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img-wrap">
        <div class="card-img-placeholder" style="background:linear-gradient(135deg,${p.color}88,${p.color}cc)">
          <svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <div class="play-overlay">
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
      <div class="card-name">${escHtml(p.name)}</div>
      <div class="card-meta">Playlist · ${p.tracks} faixas</div>
    `;
    card.onclick = () => window.location = '/playlist?id=' + p.id;
    grid.insertBefore(card, empty);
  });

  empty.style.display = items.length === 0 ? 'flex' : 'none';
}

function render() { renderSidebar(); renderGrid(); }

// ── Interações ──────────────────────────────────────────────────────────────
function filterAll() {
  searchQuery = document.getElementById('sidebarSearch').value;
  render();
}

function clearSearch() {
  document.getElementById('sidebarSearch').value = '';
  searchQuery = '';
  render();
}

document.querySelectorAll('.pill').forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

const SORTS = ['Adicionadas recentemente', 'Ordem alfabética'];
function toggleSort() {
  sortIdx = (sortIdx + 1) % SORTS.length;
  document.getElementById('sortLabel').textContent = SORTS[sortIdx];
  if (sortIdx === 1) {
    playlists.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    playlists.sort((a, b) => b.id - a.id);
  }
  render();
}

// ── Criar playlist ──────────────────────────────────────────────────────────
function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('plName').focus();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('plName').value = '';
  resetCoverPreview();
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

async function createPlaylist() {
  const name = document.getElementById('plName').value.trim();
  if (!name) {
    const inp = document.getElementById('plName');
    inp.focus();
    inp.style.borderColor = 'rgba(239,68,68,0.5)';
    setTimeout(() => inp.style.borderColor = '', 1000);
    return;
  }
  try {
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: name, publica: 0, cor: selectedColor })
    });
    if (res.status === 401) { window.location.href = '/login'; return; }
    const json = await res.json();
    if (!res.ok) { showToast('Erro: ' + (json.detail || 'Falha ao criar')); return; }

    playlists.unshift({
      id:     json.data.id_playlist,
      name,
      tracks: 0,
      type:   'playlist',
      color:  selectedColor,
    });
    activeId = json.data.id_playlist;
    closeModal();
    render();
    showToast(`"${name}" criada!`);
  } catch (e) {
    showToast('Erro de conexão');
  }
}

// ── Swatches ────────────────────────────────────────────────────────────────
const swatchContainer = document.getElementById('swatches');
COLORS.forEach((c, i) => {
  const s = document.createElement('div');
  s.className = 'swatch' + (i === 0 ? ' selected' : '');
  s.style.background = c.value;
  s.title = c.label;
  s.onclick = () => {
    selectedColor = c.value;
    document.querySelectorAll('.swatch').forEach(el => el.classList.remove('selected'));
    s.classList.add('selected');
    updateCoverPreview();
  };
  swatchContainer.appendChild(s);
});

function updateCoverPreview() {
  const preview = document.getElementById('coverPreview');
  preview.style.background  = `linear-gradient(135deg, ${selectedColor}33, ${selectedColor}55)`;
  preview.style.borderColor = selectedColor + '88';
}

function resetCoverPreview() {
  const preview = document.getElementById('coverPreview');
  preview.style.background  = '';
  preview.style.borderColor = '';
  selectedColor = COLORS[0].value;
  document.querySelectorAll('.swatch').forEach((el, i) => el.classList.toggle('selected', i === 0));
}

// ── Toast ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Utils ────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

// ── Init ─────────────────────────────────────────────────────────────────────
loadPlaylists();
updateCoverPreview();