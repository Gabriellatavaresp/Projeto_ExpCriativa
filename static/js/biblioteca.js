const PLAYLISTS = [
  {
    id: 1,
    name: 'Late Night Drives',
    tracks: 24,
    type: 'playlist',
    active: true,
    img: 'https://images.unsplash.com/photo-1693642872628-75069317e1c8?w=300&q=80'
  },
  {
    id: 2,
    name: 'Deep Focus',
    tracks: 38,
    type: 'playlist',
    active: false,
    img: 'https://images.unsplash.com/photo-1771301455501-694654813e1a?w=300&q=80'
  },
  {
    id: 3,
    name: 'Synthwave Nights',
    tracks: 17,
    type: 'playlist',
    active: false,
    img: 'https://images.unsplash.com/photo-1579353174740-9e4e39428d6f?w=300&q=80'
  },
  {
    id: 4,
    name: 'Forest Ambient',
    tracks: 12,
    type: 'album',
    active: false,
    img: 'https://images.unsplash.com/photo-1716017052766-e9bea115aa2b?w=300&q=80'
  },
  {
    id: 5,
    name: 'Jazz & Vinyl',
    tracks: 31,
    type: 'playlist',
    active: false,
    img: 'https://images.unsplash.com/photo-1706636879563-8ee9bbf720ec?w=300&q=80'
  },
  {
    id: 6,
    name: 'Electric Dreams',
    tracks: 20,
    type: 'album',
    active: false,
    img: 'https://images.unsplash.com/photo-1721004065734-2514c93ba77a?w=300&q=80'
  },
  {
    id: 7,
    name: 'Acoustic Sessions',
    tracks: 9,
    type: 'playlist',
    active: false,
    img: 'https://images.unsplash.com/photo-1670270837762-9b6bae6a9761?w=300&q=80'
  },
  {
    id: 8,
    name: 'Geometric Vibes',
    tracks: 15,
    type: 'playlist',
    active: false,
    img: 'https://images.unsplash.com/photo-1748186673798-5385404fbb14?w=300&q=80'
  },
];

const COLORS = [
  { label: 'Mint',      value: '#8ab8a8' },
  { label: 'Teal',      value: '#6b9997' },
  { label: 'Dark Teal', value: '#54787d' },
  { label: 'Sage',      value: '#c6cca5' },
  { label: 'Brown',     value: '#615145' },
  { label: 'Slate',     value: '#3d4f52' },
];

let playlists     = [...PLAYLISTS];
let activeId      = 1;
let activeFilter  = 'all';
let searchQuery   = '';
let selectedColor = COLORS[0].value;
let sortIdx       = 0;

function filtered() {
  return playlists.filter(p => {
    const matchFilter = activeFilter === 'all' || p.type === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
}

function renderSidebar() {
  const list  = document.getElementById('sidebarList');
  const empty = document.getElementById('sidebarEmpty');
  const count = document.getElementById('countLabel');
  const items = filtered();

  count.textContent = items.length + (items.length === 1 ? ' playlist' : ' playlists');

  list.innerHTML = items.map(p => `
    <button
      class="playlist-item ${p.id === activeId ? 'active' : ''}"
      onclick="window.location='playlist.html?id=${p.id}'"
    >
      ${p.img
        ? `<img class="pl-cover" src="${p.img}&w=80" alt="${p.name}" loading="lazy" />`
        : `<div class="pl-cover-placeholder">
              <svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
             </div>`
      }
      <div class="pl-info">
        <div class="pl-name">${escHtml(p.name)}</div>
        <div class="pl-meta">${capitalize(p.type)} · ${p.tracks} tracks</div>
      </div>
      <div class="pl-playing">
        <div class="bar"></div><div class="bar"></div><div class="bar"></div>
      </div>
    </button>
  `).join('');

  empty.style.display = items.length === 0 ? 'flex' : 'none';
}

function renderGrid() {
  const grid  = document.getElementById('mainGrid');
  const empty = document.getElementById('gridEmpty');
  const items = filtered();

  // remove cards antigos
  [...grid.querySelectorAll('.card')].forEach(c => c.remove());

  items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img-wrap">
        ${p.img
          ? `<img class="card-img" src="${p.img}&w=400" alt="${escHtml(p.name)}" loading="lazy" />`
          : `<div class="card-img-placeholder">
                <svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
               </div>`
        }
        <div class="play-overlay">
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
      <div class="card-name">${escHtml(p.name)}</div>
      <div class="card-meta">${capitalize(p.type)} · ${p.tracks} tracks</div>
    `;
    card.onclick = () => window.location = 'playlist.html?id=' + p.id;
    grid.insertBefore(card, empty);
  });

  empty.style.display = items.length === 0 ? 'flex' : 'none';
}

function render() {
  renderSidebar();
  renderGrid();
}

// interaçoes
function setActive(id) {
  activeId = id;
  render();
}

function filterAll() {
  searchQuery = document.getElementById('sidebarSearch').value;
  render();
}

function clearSearch() {
  document.getElementById('sidebarSearch').value = '';
  searchQuery = '';
  render();
}

// filtro de itens
document.querySelectorAll('.pill').forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

//filtro de ordenaçao
const SORTS = ['Adicionadas recentemente', 'Ordem alfabética', 'Tocadas recentemente'];

function toggleSort() {
  sortIdx = (sortIdx + 1) % SORTS.length;
  document.getElementById('sortLabel').textContent = SORTS[sortIdx];
  if (sortIdx === 1) {
    playlists.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    playlists = [...PLAYLISTS, ...playlists.filter(p => !PLAYLISTS.find(o => o.id === p.id))];
  }
  render();
}

//criar playlist
function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('plName').focus();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('plName').value = '';
  document.getElementById('plDesc').value = '';
  resetCoverPreview();
}

// sair com click no fundo
document.getElementById('modalOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// sair no esc
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function createPlaylist() {
  const name = document.getElementById('plName').value.trim();
  if (!name) {
    document.getElementById('plName').focus();
    document.getElementById('plName').style.borderColor = 'rgba(239,68,68,0.5)';
    setTimeout(() => document.getElementById('plName').style.borderColor = '', 1000);
    return;
  }
  const newPl = {
    id: Date.now(),
    name,
    tracks: 0,
    type: 'playlist',
    active: false,
    img: null,
    color: selectedColor
  };
  playlists.unshift(newPl);
  activeId = newPl.id;
  closeModal();
  render();
  showToast(`"${name}" created!`);
}

//troca de cores
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
  preview.style.background    = `linear-gradient(135deg, ${selectedColor}33, ${selectedColor}55)`;
  preview.style.borderColor   = selectedColor + '88';
}

function resetCoverPreview() {
  const preview = document.getElementById('coverPreview');
  preview.style.background  = '';
  preview.style.borderColor = '';
  selectedColor = COLORS[0].value;
  document.querySelectorAll('.swatch').forEach((el, i) => {
    el.classList.toggle('selected', i === 0);
  });
}

//aviso de playlist criada
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

//utilitarios 
function escHtml(str) {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// inicializaçao
render();
updateCoverPreview();