let artistas = [];

async function loadArtistasCache() {
  if (artistas.length === 0) artistas = await fetchJson('/api/artistas');
}

async function loadAlbuns() {
  const data = await fetchJson('/api/albuns');
  document.querySelector('#albunsTable tbody').innerHTML = data.map(a => `
    <tr>
      <td>${esc(a.nome_album)}</td>
      <td>${esc(a.nome_artista)}</td>
      <td>${a.data_lancamento ? new Date(a.data_lancamento).toLocaleDateString('pt-BR') : '—'}</td>
      <td>${a.total_musicas || 0}</td>
      <td>
        <button class="table-btn" onclick="openEditAlbum(${a.id_album}, '${esc(a.nome_album)}', '${a.data_lancamento||''}', ${a.id_artista})">Editar</button>
        <button class="table-btn" onclick="deleteAlbum(${a.id_album})">Deletar</button>
      </td>
    </tr>
  `).join('');
}

async function openAddAlbum() {
  await loadArtistasCache();
  document.getElementById('modalTitle').textContent = 'Adicionar Álbum';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="">
    <select id="fAlbumArtista" required>
      <option value="">— Selecione o artista —</option>
      ${artistas.map(a=>`<option value="${a.id_artista}">${esc(a.nome_artista)}</option>`).join('')}
    </select>
    <input type="text" id="fNomeAlbum" placeholder="Nome do álbum" required>
    <input type="date" id="fDataLancamento">
  `;
  document.getElementById('formModal').dataset.type = 'album';
  openModal();
}

async function openEditAlbum(id, nome, data, idArtista) {
  await loadArtistasCache();
  document.getElementById('modalTitle').textContent = 'Editar Álbum';
  document.getElementById('formFields').innerHTML = `
    <input type="hidden" id="editId" value="${id}">
    <select id="fAlbumArtista" required>
      <option value="">— Selecione o artista —</option>
      ${artistas.map(a=>`<option value="${a.id_artista}" ${a.id_artista===idArtista?'selected':''}>${esc(a.nome_artista)}</option>`).join('')}
    </select>
    <input type="text" id="fNomeAlbum" placeholder="Nome do álbum" value="${esc(nome)}" required>
    <input type="date" id="fDataLancamento" value="${data ? data.substring(0,10) : ''}">
  `;
  document.getElementById('formModal').dataset.type = 'album';
  openModal();
}

async function deleteAlbum(id) {
  if (!await swalConfirmDelete('este álbum')) return;
  const res = await fetch(`/api/albuns/${id}`, { method: 'DELETE' });
  if (!res.ok) { const json = await res.json(); await swalError(json.detail || 'Erro ao deletar'); return; }
  loadAlbuns();
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('editId')?.value;
  const isEdit = !!editId;
  const bodyData = {
    nome_album: document.getElementById('fNomeAlbum').value,
    id_artista: parseInt(document.getElementById('fAlbumArtista').value),
    data_lancamento: document.getElementById('fDataLancamento').value || null,
  };
  const url = isEdit ? `/api/albuns/${editId}` : '/api/albuns';
  const method = isEdit ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(bodyData) });
  const json = await res.json();
  if (!res.ok) { await swalError(json.detail || 'Erro ao salvar'); return; }
  closeModal();
  loadAlbuns();
}

loadAlbuns();