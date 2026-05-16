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
    albuns: 'Gerenciamento de álbuns',
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
  if (section === 'albuns') loadAlbuns();
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
    <div style="margin-bottom:12px">
      <label style="color:#aaa;font-size:.85rem;display:block;margin-bottom:6px">🎵 Buscar no Deezer (auto-preenche campos)</label>
      <div style="display:flex;gap:8px">
        <input type="text" id="deezerQuery" placeholder="Ex: Bohemian Rhapsody Queen" style="flex:1">
        <button type="button" onclick="searchDeezer()" style="padding:0 16px;background:#6b9997;border:none;border-radius:8px;color:#fff;cursor:pointer;font-weight:600">Buscar</button>
      </div>
      <div id="deezerResults" style="margin-top:8px;max-height:180px;overflow-y:auto;border-radius:8px;background:#1a1a2a"></div>
    </div>
    <input type="text" id="fTitulo" placeholder="Título" required>
    <input type="text" id="fDuracao" placeholder="Duração (HH:MM:SS)" required>
    <input type="text" id="fGenero" placeholder="Gênero">
    <select id="fArtista">${artistas.map(a=>`<option value="${a.id_artista}">${esc(a.nome_artista)}</option>`).join('')}</select>
    <select id="fAlbum">${albuns.map(a=>`<option value="${a.id_album}">${esc(a.nome_album)}</option>`).join('')}</select>
    <input type="hidden" id="fPreviewUrl" value="">
    <input type="hidden" id="fDeezerId" value="">
  `;
  document.getElementById('formModal').dataset.type = 'musica';
  openModal();
}

async function openEditMusica(id) {
  const m = await fetchJson(`/api/musicas/${id}`);
  await loadArtistasCache();
  const albuns = await fetchJson('/api/albuns');
  document.getElementById('modalTitle').textContent = 'Editar Música';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="${id}">
    <input type="text" id="fTitulo" placeholder="Título" value="${esc(m.titulo)}" required>
    <input type="text" id="fDuracao" placeholder="Duração (HH:MM:SS)" value="${m.duracao||''}" required>
    <input type="text" id="fGenero" placeholder="Gênero" value="${esc(m.genero||'')}">
    <select id="fArtista">${artistas.map(a=>`<option value="${a.id_artista}" ${a.id_artista===m.id_artista?'selected':''}>${esc(a.nome_artista)}</option>`).join('')}</select>
    <select id="fAlbum">${albuns.map(a=>`<option value="${a.id_album}" ${a.id_album===m.id_album?'selected':''}>${esc(a.nome_album)}</option>`).join('')}</select>
    <input type="hidden" id="fPreviewUrl" value="${m.preview_url||''}">
    <input type="hidden" id="fDeezerId" value="${m.deezer_id||''}">
  `;
  document.getElementById('formModal').dataset.type = 'musica';
  openModal();
}

async function searchDeezer() {
  const q = document.getElementById('deezerQuery')?.value?.trim();
  if (!q) return;
  const resultsEl = document.getElementById('deezerResults');
  resultsEl.innerHTML = '<div style="padding:10px;color:#aaa;font-size:.85rem">Buscando…</div>';
  try {
    const res  = await fetch(`/api/deezer/search?q=${encodeURIComponent(q)}&limit=6`);
    const json = await res.json();
    const tracks = json.data || [];
    if (!tracks.length) { resultsEl.innerHTML = '<div style="padding:10px;color:#aaa;font-size:.85rem">Nenhum resultado.</div>'; return; }
    resultsEl.innerHTML = tracks.map((t,i) => `
      <div onclick="fillFromDeezer(${i})" data-track='${JSON.stringify(t).replace(/'/g,"&#39;")}' style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-radius:6px;transition:.15s" onmouseover="this.style.background='#2a2a3e'" onmouseout="this.style.background='transparent'">
        <img src="${t.capa||''}" alt="" style="width:36px;height:36px;border-radius:4px;object-fit:cover" onerror="this.style.display='none'">
        <div style="flex:1;min-width:0">
          <div style="color:#fff;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.titulo)}</div>
          <div style="color:#aaa;font-size:.75rem">${esc(t.artista)} · ${t.duracao}</div>
        </div>
        ${t.preview_url?'<span style="color:#6b9997;font-size:.75rem">▶ Preview</span>':''}
      </div>`).join('');
    // salvar tracks no data attribute do container
    resultsEl._tracks = tracks;
  } catch(e) { resultsEl.innerHTML = '<div style="padding:10px;color:#f87171;font-size:.85rem">Erro ao buscar.</div>'; }
}

function fillFromDeezer(idx) {
  const el = document.getElementById('deezerResults');
  const t  = el._tracks?.[idx];
  if (!t) return;
  const titulo = document.getElementById('fTitulo');
  const duracao = document.getElementById('fDuracao');
  const previewUrl = document.getElementById('fPreviewUrl');
  const deezerId  = document.getElementById('fDeezerId');
  if(titulo)  titulo.value  = t.titulo;
  if(duracao) duracao.value = t.duracao;
  if(previewUrl) previewUrl.value = t.preview_url||'';
  if(deezerId)   deezerId.value   = t.deezer_id||'';
  el.innerHTML = `<div style="padding:8px 12px;color:#6b9997;font-size:.85rem">✓ Selecionado: ${esc(t.titulo)} — ${esc(t.artista)}</div>`;
}

async function deleteMusica(id) {
  if (!await swalConfirmDelete('esta música')) return;
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
  if (!await swalConfirmDelete('este artista')) return;
  await fetch(`${API}/api/artistas/${id}`, { method: 'DELETE' });
  artistas = []; // invalida cache
  loadArtistas();
}

// ══════════════════════════════════════════════
// ÁLBUNS
// ══════════════════════════════════════════════
async function loadAlbuns() {
  const data = await fetchJson('/api/albuns');
  const tbody = document.querySelector('#albunsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(a => `
    <tr>
      <td>${esc(a.nome_album)}</td>
      <td>${esc(a.nome_artista)}</td>
      <td>${a.data_lancamento ? new Date(a.data_lancamento).toLocaleDateString('pt-BR') : '—'}</td>
      <td>${a.total_musicas || 0}</td>
      <td>
        <button class="table-btn" onclick="openEditAlbum(${a.id_album}, '${esc(a.nome_album)}', '${a.data_lancamento || ''}', ${a.id_artista})">Editar</button>
        <button class="table-btn" onclick="deleteAlbum(${a.id_album})">Deletar</button>
      </td>
    </tr>`).join('');
}

function openAddAlbum() {
  document.getElementById('modalTitle').textContent = 'Adicionar Álbum';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="">
    <select id="fAlbumArtista" required>
      <option value="">Carregando artistas…</option>
    </select>
    <input type="text" id="fNomeAlbum" placeholder="Nome do álbum" required>
    <input type="date" id="fDataLancamento">
  `;
  document.getElementById('formModal').dataset.type = 'album';
  openModal();
  // Preenche o select assim que a fetch retornar
  loadArtistasCache().then(() => {
    const sel = document.getElementById('fAlbumArtista');
    if (sel) {
      sel.innerHTML = `<option value="">— Selecione o artista —</option>` +
        artistas.map(a => `<option value="${a.id_artista}">${esc(a.nome_artista)}</option>`).join('');
    }
  }).catch(e => console.error('Erro ao carregar artistas:', e));
}

function openEditAlbum(id, nome, data, idArtista) {
  document.getElementById('modalTitle').textContent = 'Editar Álbum';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="${id}">
    <select id="fAlbumArtista" required>
      <option value="">Carregando artistas…</option>
    </select>
    <input type="text" id="fNomeAlbum" placeholder="Nome do álbum" value="${esc(nome)}" required>
    <input type="date" id="fDataLancamento" value="${data ? data.substring(0,10) : ''}">
  `;
  document.getElementById('formModal').dataset.type = 'album';
  openModal();
  loadArtistasCache().then(() => {
    const sel = document.getElementById('fAlbumArtista');
    if (sel) {
      sel.innerHTML = `<option value="">— Selecione o artista —</option>` +
        artistas.map(a => `<option value="${a.id_artista}" ${a.id_artista === idArtista ? 'selected' : ''}>${esc(a.nome_artista)}</option>`).join('');
    }
  }).catch(e => console.error('Erro ao carregar artistas:', e));
}

async function deleteAlbum(id) {
  if (!await swalConfirmDelete('este álbum')) return;
  const res = await fetch(`${API}/api/albuns/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const json = await res.json();
    await swalError(json.detail || 'Erro ao deletar álbum');
    return;
  }
  loadAlbuns();
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
  if (!await swalConfirmDelete('esta playlist')) return;
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
    <small id="senhaErro" style="color:red;display:none"></small>
  `;
  document.getElementById('formModal').dataset.type = 'usuario';
  
  document.getElementById('fCpf').addEventListener('input', function () {
    let d = this.value.replace(/\D/g, '').slice(0, 11);
    if (d.length > 9) d = d.slice(0,3)+'.'+d.slice(3,6)+'.'+d.slice(6,9)+'-'+d.slice(9);
    else if (d.length > 6) d = d.slice(0,3)+'.'+d.slice(3,6)+'.'+d.slice(6);
    else if (d.length > 3) d = d.slice(0,3)+'.'+d.slice(3);
    this.value = d;
  });

  openModal();
}


async function openEditUsuario(id) {
  const u = await fetchJson(`/api/usuarios/${id}`);
  document.getElementById('modalTitle').textContent = 'Editar Usuário';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="${id}">
    <input type="text" id="fNome" placeholder="Nome Completo" value="${esc(u.nome)}" required>
    <input type="email" id="fEmail" placeholder="E-mail" value="${esc(u.email)}" required>
    <input type="text" id="fCpf" placeholder="CPF" maxlength="14" value="${esc(u.cpf || '')}" readonly style="opacity:0.5;cursor:not-allowed" title="CPF não pode ser alterado">
    <input type="text" id="fUser" placeholder="Username" value="${esc(u.User || '')}">
    <label style="display:flex;align-items:center;gap:8px;color:#ccc;font-size:.9rem;margin-top:4px">
      <input type="checkbox" id="fAtivo" ${u.ativo ? 'checked' : ''}> Ativo
    </label>
  `;
  document.getElementById('formModal').dataset.type = 'usuario';
  openModal();
}

async function deleteUsuario(id) {
  if (!await swalConfirmDelete('este usuário')) return;
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
      titulo:      document.getElementById('fTitulo').value,
      duracao:     document.getElementById('fDuracao').value,
      genero:      document.getElementById('fGenero').value,
      id_artista:  parseInt(document.getElementById('fArtista').value),
      id_album:    parseInt(document.getElementById('fAlbum').value),
      preview_url: document.getElementById('fPreviewUrl')?.value || null,
      deezer_id:   document.getElementById('fDeezerId')?.value ? parseInt(document.getElementById('fDeezerId').value) : null,
    };
    url = isEdit ? `/api/musicas/${editId}` : '/api/musicas';
    method = isEdit ? 'PUT' : 'POST';
  } else if (type === 'artista') {
    bodyData = { nome_artista: document.getElementById('fNomeArtista').value };
    url = isEdit ? `/api/artistas/${editId}` : '/api/artistas';
    method = isEdit ? 'PUT' : 'POST';
  } else if (type === 'album') {
    bodyData = {
      nome_album:       document.getElementById('fNomeAlbum').value,
      id_artista:       parseInt(document.getElementById('fAlbumArtista').value),
      data_lancamento:  document.getElementById('fDataLancamento').value || null,
    };
    url = isEdit ? `/api/albuns/${editId}` : '/api/albuns';
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
      await swalError(json.detail || 'Erro ao salvar');
      return;
    }
    closeModal();
    // Invalida cache de artistas para que o select reflita imediatamente
    if (type === 'artista') artistas = [];
    showSection(currentSection);
  } catch (err) {
    await swalError('Erro de conexão: ' + err.message);
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

setInterval(async () => {
  console.log('verificando sessão...');
  const res = await fetch('/api/check-session');
  console.log('status:', res.status);
  if (res.status === 401) {
    window.location.href = '/login';
  }
}, 30000);

// Fechar modal clicando fora
window.addEventListener('click', (e) => {
  const modal = document.getElementById('formModal');
  if (e.target === modal) closeModal();
});
