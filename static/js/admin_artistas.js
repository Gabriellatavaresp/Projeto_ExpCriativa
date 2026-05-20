async function loadArtistas() {
  const data = await fetchJson('/api/artistas');
  document.querySelector('#artistasTable tbody').innerHTML = data.map(a => `
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
  await fetch(`/api/artistas/${id}`, { method: 'DELETE' });
  loadArtistas();
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('editId')?.value;
  const isEdit = !!editId;
  const bodyData = { nome_artista: document.getElementById('fNomeArtista').value };
  const url = isEdit ? `/api/artistas/${editId}` : '/api/artistas';
  const method = isEdit ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(bodyData) });
  const json = await res.json();
  if (!res.ok) { await swalError(json.detail || 'Erro ao salvar'); return; }
  closeModal();
  loadArtistas();
}

loadArtistas();