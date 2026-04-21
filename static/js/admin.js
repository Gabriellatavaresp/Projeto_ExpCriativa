/**
 * admin.js — Lógica do painel administrativo Aurora
 * CRUD completo via fetch() para a API REST
 */

const API = '';  // mesmo origin

// ── Estado ───────────────────────────────────
let currentSection = 'dashboard';
let artistas = [];  // cache para selects

// ── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  showSection('dashboard');
  loadDashboard();
});

// ══════════════════════════════════════════════
// NAVEGAÇÃO
// ══════════════════════════════════════════════
function setupNav() {
  document.querySelectorAll('.admin-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const section = btn.dataset.section;
      showSection(section);
    });
  });
}

function showSection(section) {
  currentSection = section;
  const titleMap = {
    dashboard: 'Dashboard geral',
    musicas: 'Gerenciamento de músicas',
    artistas: 'Gestão de artistas',
    playlists: 'Playlists oficiais',
    usuarios: 'Controle de usuários',
  };
  const el = document.getElementById('pageTitle');
  if (el) el.textContent = titleMap[section] || 'Dashboard';

  document.querySelectorAll('[data-section-content], [data-panel]').forEach(s => {
    const match = s.dataset.sectionContent === section || s.dataset.panel === section;
    s.style.display = match ? 'block' : 'none';
  });

  if (section === 'dashboard') loadDashboard();
  if (section === 'musicas') loadMusicas();
  if (section === 'artistas') loadArtistas();
  if (section === 'playlists') loadPlaylists();
  if (section === 'usuarios') loadUsuarios();
}

// ══════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/api/dashboard`);
    const json = await res.json();
    const d = json.data;
    const el = document.getElementById('dashboardStats');
    if (el) {
      el.innerHTML = `
        <div class="stat-card glass-soft">
          <span class="stat-number">${d.musicas}</span>
          <span class="stat-label">Músicas</span>
        </div>
        <div class="stat-card glass-soft">
          <span class="stat-number">${d.artistas}</span>
          <span class="stat-label">Artistas</span>
        </div>
        <div class="stat-card glass-soft">
          <span class="stat-number">${d.playlists}</span>
          <span class="stat-label">Playlists</span>
        </div>
        <div class="stat-card glass-soft">
          <span class="stat-number">${d.usuarios}</span>
          <span class="stat-label">Usuários</span>
        </div>
      `;
    }
  } catch (e) {
    console.error('Erro ao carregar dashboard:', e);
  }
}

// ══════════════════════════════════════════════
// MÚSICAS
// ══════════════════════════════════════════════
async function loadMusicas() {
  const res = await fetch(`${API}/api/musicas`);
  const json = await res.json();
  const tbody = document.querySelector('#musicasTable tbody');
  tbody.innerHTML = json.data.map(m => `
    <tr>
      <td>${esc(m.titulo)}</td>
      <td>${esc(m.nome_artista)}</td>
      <td>${m.duracao || '—'}</td>
      <td>
        <button class="table-btn" onclick="openEditMusica(${m.id_musica})">Editar</button>
        <button class="table-btn" onclick="deleteMusica(${m.id_musica})">Deletar</button>
      </td>
    </tr>
  `).join('');
}

async function openAddMusica() {
  await loadArtistasCache();
  const albuns = await fetchJson('/api/albuns');
  document.getElementById('modalTitle').textContent = 'Adicionar Música';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="">
    <input type="text" id="fTitulo" placeholder="Título" required>
    <input type="text" id="fDuracao" placeholder="Duração (HH:MM:SS)" required>
    <input type="text" id="fGenero" placeholder="Gênero">
    <select id="fArtista">${artistas.map(a => `<option value="${a.id_artista}">${esc(a.nome_artista)}</option>`).join('')}</select>
    <select id="fAlbum">${albuns.map(a => `<option value="${a.id_album}">${esc(a.nome_album)}</option>`).join('')}</select>
  `;
  document.getElementById('formModal').dataset.type = 'musica';
  openModal();
}

async function openEditMusica(id) {
  const m = (await fetchJson(`/api/musicas/${id}`));
  await loadArtistasCache();
  const albuns = await fetchJson('/api/albuns');
  document.getElementById('modalTitle').textContent = 'Editar Música';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="${id}">
    <input type="text" id="fTitulo" placeholder="Título" value="${esc(m.titulo)}" required>
    <input type="text" id="fDuracao" placeholder="Duração (HH:MM:SS)" value="${m.duracao || ''}" required>
    <input type="text" id="fGenero" placeholder="Gênero" value="${esc(m.genero || '')}">
    <select id="fArtista">${artistas.map(a => `<option value="${a.id_artista}" ${a.id_artista===m.id_artista?'selected':''}>${esc(a.nome_artista)}</option>`).join('')}</select>
    <select id="fAlbum">${albuns.map(a => `<option value="${a.id_album}" ${a.id_album===m.id_album?'selected':''}>${esc(a.nome_album)}</option>`).join('')}</select>
  `;
  document.getElementById('formModal').dataset.type = 'musica';
  openModal();
}

async function deleteMusica(id) {
  if (!confirm('Excluir esta música?')) return;
  await fetch(`${API}/api/musicas/${id}`, { method: 'DELETE' });
  loadMusicas();
}

// ══════════════════════════════════════════════
// ARTISTAS
// ══════════════════════════════════════════════
async function loadArtistas() {
  const res = await fetch(`${API}/api/artistas`);
  const json = await res.json();
  const tbody = document.querySelector('#artistasTable tbody');
  tbody.innerHTML = json.data.map(a => `
    <tr>
      <td>${esc(a.nome_artista)}</td>
      <td>${a.total_musicas}</td>
      <td>${a.total_albuns}</td>
      <td>
        <button class="table-btn" onclick="openEditArtista(${a.id_artista}, '${esc(a.nome_artista)}')">Editar</button>
        <button class="table-btn" onclick="deleteArtista(${a.id_artista})">Deletar</button>
      </td>
    </tr>
  `).join('');
}

function openAddArtista() {
  document.getElementById('modalTitle').textContent = 'Adicionar Artista';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="">
    <input type="text" id="fNomeArtista" placeholder="Nome do Artista" required>
  `;
  document.getElementById('formModal').dataset.type = 'artista';
  openModal();
}

function openEditArtista(id, nome) {
  document.getElementById('modalTitle').textContent = 'Editar Artista';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="${id}">
    <input type="text" id="fNomeArtista" placeholder="Nome do Artista" value="${nome}" required>
  `;
  document.getElementById('formModal').dataset.type = 'artista';
  openModal();
}

async function deleteArtista(id) {
  if (!confirm('Excluir este artista?')) return;
  await fetch(`${API}/api/artistas/${id}`, { method: 'DELETE' });
  loadArtistas();
}

// ══════════════════════════════════════════════
// PLAYLISTS
// ══════════════════════════════════════════════
async function loadPlaylists() {
  const res = await fetch(`${API}/api/playlists`);
  const json = await res.json();
  const tbody = document.querySelector('#playlistsTable tbody');
  tbody.innerHTML = json.data.map(p => `
    <tr>
      <td>${esc(p.nome)}</td>
      <td>${esc(p.nome_usuario)}</td>
      <td>${p.total_musicas}</td>
      <td>
        <button class="table-btn" onclick="openEditPlaylist(${p.id_playlist})">Editar</button>
        <button class="table-btn" onclick="deletePlaylist(${p.id_playlist})">Deletar</button>
      </td>
    </tr>
  `).join('');
}

async function openAddPlaylist() {
  const usuarios = await fetchJson('/api/usuarios');
  document.getElementById('modalTitle').textContent = 'Adicionar Playlist';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="">
    <input type="text" id="fNomePlaylist" placeholder="Nome da Playlist" required>
    <select id="fUsuarioPlaylist">${usuarios.map(u => `<option value="${u.id_usuario}">${esc(u.nome)}</option>`).join('')}</select>
    <label style="display:flex;align-items:center;gap:8px;color:#ccc;font-size:.9rem;margin-top:4px">
      <input type="checkbox" id="fPublica"> Pública
    </label>
  `;
  document.getElementById('formModal').dataset.type = 'playlist';
  openModal();
}

async function openEditPlaylist(id) {
  const p = await fetchJson(`/api/playlists/${id}`);
  document.getElementById('modalTitle').textContent = 'Editar Playlist';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="${id}">
    <input type="text" id="fNomePlaylist" placeholder="Nome da Playlist" value="${esc(p.nome)}" required>
    <label style="display:flex;align-items:center;gap:8px;color:#ccc;font-size:.9rem;margin-top:4px">
      <input type="checkbox" id="fPublica" ${p.publica ? 'checked' : ''}> Pública
    </label>
  `;
  document.getElementById('formModal').dataset.type = 'playlist';
  openModal();
}

async function deletePlaylist(id) {
  if (!confirm('Excluir esta playlist?')) return;
  await fetch(`${API}/api/playlists/${id}`, { method: 'DELETE' });
  loadPlaylists();
}

// ══════════════════════════════════════════════
// USUÁRIOS
// ══════════════════════════════════════════════
async function loadUsuarios() {
  const res = await fetch(`${API}/api/usuarios`);
  const json = await res.json();
  const tbody = document.querySelector('#usuariosTable tbody');
  tbody.innerHTML = json.data.map(u => `
    <tr>
      <td>${esc(u.nome)}</td>
      <td>${esc(u.email)}</td>
      <td>${u.ativo ? '<span style="color:#4ade80;font-weight:bold">Ativo</span>' : '<span style="color:#f87171;font-weight:bold">Inativo</span>'}</td>
      <td>
        <button class="table-btn" onclick="openEditUsuario(${u.id_usuario})">Editar</button>
        <button class="table-btn" onclick="deleteUsuario(${u.id_usuario})">Deletar</button>
      </td>
    </tr>
  `).join('');
}

function openAddUsuario() {
  document.getElementById('modalTitle').textContent = 'Adicionar Usuário';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="">
    <input type="text" id="fNome" placeholder="Nome Completo" required>
    <input type="email" id="fEmail" placeholder="E-mail" required>
    <input type="password" id="fSenha" placeholder="Senha" required>
    <input type="text" id="fCpf" placeholder="CPF" maxlength="14">
    <input type="text" id="fUser" placeholder="Username">
  `;
  document.getElementById('formModal').dataset.type = 'usuario';
  openModal();
}

async function openEditUsuario(id) {
  const u = await fetchJson(`/api/usuarios/${id}`);
  document.getElementById('modalTitle').textContent = 'Editar Usuário';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="${id}">
    <input type="text" id="fNome" placeholder="Nome Completo" value="${esc(u.nome)}" required>
    <input type="email" id="fEmail" placeholder="E-mail" value="${esc(u.email)}" required>
    <input type="text" id="fCpf" placeholder="CPF" maxlength="14" value="${esc(u.cpf || '')}">
    <input type="text" id="fUser" placeholder="Username" value="${esc(u.User || '')}">
    <label style="display:flex;align-items:center;gap:8px;color:#ccc;font-size:.9rem;margin-top:4px">
      <input type="checkbox" id="fAtivo" ${u.ativo ? 'checked' : ''}> Ativo
    </label>
  `;
  document.getElementById('formModal').dataset.type = 'usuario';
  openModal();
}

async function deleteUsuario(id) {
  if (!confirm('Excluir este usuário?')) return;
  await fetch(`${API}/api/usuarios/${id}`, { method: 'DELETE' });
  loadUsuarios();
}

// ══════════════════════════════════════════════
// MODAL & FORM SUBMIT
// ══════════════════════════════════════════════
function openModal() {
  document.getElementById('formModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('formModal').style.display = 'none';
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const type = document.getElementById('formModal').dataset.type;
  const editId = document.getElementById('editId')?.value;
  const isEdit = !!editId;

  let url, method, bodyData;

  if (type === 'musica') {
    bodyData = {
      titulo: document.getElementById('fTitulo').value,
      duracao: document.getElementById('fDuracao').value,
      genero: document.getElementById('fGenero').value,
      id_artista: parseInt(document.getElementById('fArtista').value),
      id_album: parseInt(document.getElementById('fAlbum').value),
    };
    url = isEdit ? `/api/musicas/${editId}` : '/api/musicas';
    method = isEdit ? 'PUT' : 'POST';
  } else if (type === 'artista') {
    bodyData = { nome_artista: document.getElementById('fNomeArtista').value };
    url = isEdit ? `/api/artistas/${editId}` : '/api/artistas';
    method = isEdit ? 'PUT' : 'POST';
  } else if (type === 'playlist') {
    bodyData = {
      nome: document.getElementById('fNomePlaylist').value,
      publica: document.getElementById('fPublica').checked ? 1 : 0,
    };
    if (!isEdit) bodyData.id_usuario = parseInt(document.getElementById('fUsuarioPlaylist').value);
    url = isEdit ? `/api/playlists/${editId}` : '/api/playlists';
    method = isEdit ? 'PUT' : 'POST';
  } else if (type === 'usuario') {
    bodyData = {
      nome: document.getElementById('fNome').value,
      email: document.getElementById('fEmail').value,
      cpf: document.getElementById('fCpf')?.value || null,
      User: document.getElementById('fUser')?.value || null,
    };
    if (!isEdit) bodyData.senha = document.getElementById('fSenha').value;
    if (isEdit) bodyData.ativo = document.getElementById('fAtivo')?.checked ? 1 : 0;
    url = isEdit ? `/api/usuarios/${editId}` : '/api/usuarios';
    method = isEdit ? 'PUT' : 'POST';
  }

  try {
    const res = await fetch(API + url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });
    const json = await res.json();
    if (!res.ok) {
      alert(json.detail || 'Erro ao salvar');
      return;
    }
    closeModal();
    showSection(currentSection);
  } catch (err) {
    alert('Erro de conexão: ' + err.message);
  }
}

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

async function fetchJson(path) {
  const res = await fetch(API + path);
  const json = await res.json();
  return json.data;
}

async function loadArtistasCache() {
  if (artistas.length === 0) {
    artistas = await fetchJson('/api/artistas');
  }
}

// Fechar modal clicando fora
window.addEventListener('click', (e) => {
  const modal = document.getElementById('formModal');
  if (e.target === modal) closeModal();
});
