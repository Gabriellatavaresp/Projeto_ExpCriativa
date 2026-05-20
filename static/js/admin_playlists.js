async function loadPlaylists() {
  const data = await fetchJson('/api/playlists');
  document.querySelector('#playlistsTable tbody').innerHTML = data.map(p => `
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
    <select id="fUsuarioPlaylist">${usuarios.map(u=>`<option value="${u.id_usuario}">${esc(u.nome)}</option>`).join('')}</select>
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
  await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
  loadPlaylists();
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('editId')?.value;
  const isEdit = !!editId;
  const bodyData = {
    nome: document.getElementById('fNomePlaylist').value,
    publica: document.getElementById('fPublica').checked ? 1 : 0,
  };
  if (!isEdit) bodyData.id_usuario = parseInt(document.getElementById('fUsuarioPlaylist').value);
  const url = isEdit ? `/api/playlists/${editId}` : '/api/playlists';
  const method = isEdit ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(bodyData) });
  const json = await res.json();
  if (!res.ok) { await swalError(json.detail || 'Erro ao salvar'); return; }
  closeModal();
  loadPlaylists();
}

loadPlaylists();