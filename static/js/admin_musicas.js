let artistas = [];

async function loadArtistasCache() {
  if (artistas.length === 0) artistas = await fetchJson('/api/artistas');
}

async function loadMusicas() {
  const data = await fetchJson('/api/musicas');
  document.querySelector('#musicasTable tbody').innerHTML = data.map(m => `
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
    <select id="fArtista">${artistas.map(a=>`<option value="${a.id_artista}">${esc(a.nome_artista)}</option>`).join('')}</select>
    <select id="fAlbum">${albuns.map(a=>`<option value="${a.id_album}">${esc(a.nome_album)}</option>`).join('')}</select>
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
  `;
  document.getElementById('formModal').dataset.type = 'musica';
  openModal();
}

async function deleteMusica(id) {
  if (!await swalConfirmDelete('esta música')) return;
  await fetch(`/api/musicas/${id}`, { method: 'DELETE' });
  loadMusicas();
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('editId')?.value;
  const isEdit = !!editId;
  const bodyData = {
    titulo: document.getElementById('fTitulo').value,
    duracao: document.getElementById('fDuracao').value,
    genero: document.getElementById('fGenero').value,
    id_artista: parseInt(document.getElementById('fArtista').value),
    id_album: parseInt(document.getElementById('fAlbum').value),
  };
  const url = isEdit ? `/api/musicas/${editId}` : '/api/musicas';
  const method = isEdit ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(bodyData) });
  const json = await res.json();
  if (!res.ok) { await swalError(json.detail || 'Erro ao salvar'); return; }
  closeModal();
  loadMusicas();
}

loadMusicas();