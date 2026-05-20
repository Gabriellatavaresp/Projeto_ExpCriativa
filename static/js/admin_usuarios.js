async function loadUsuarios() {
  const data = await fetchJson('/api/usuarios');
  document.querySelector('#usuariosTable tbody').innerHTML = data.map(u => `
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
    <input type="text" id="fCpf" placeholder="CPF" maxlength="14" value="${esc(u.cpf||'')}" readonly style="opacity:0.5;cursor:not-allowed">
    <input type="text" id="fUser" placeholder="Username" value="${esc(u.User||'')}">
    <label style="display:flex;align-items:center;gap:8px;color:#ccc;font-size:.9rem;margin-top:4px">
      <input type="checkbox" id="fAtivo" ${u.ativo ? 'checked' : ''}> Ativo
    </label>
  `;
  document.getElementById('formModal').dataset.type = 'usuario';
  openModal();
}

async function deleteUsuario(id) {
  if (!await swalConfirmDelete('este usuário')) return;
  await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
  loadUsuarios();
}

function isValidCPF(cpf) {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let first = (sum * 10) % 11;
  if (first === 10 || first === 11) first = 0;
  if (first !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  let second = (sum * 10) % 11;
  if (second === 10 || second === 11) second = 0;
  return second === parseInt(cpf[10]);
}

function isStrongPassword(password) {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('editId')?.value;
  const isEdit = !!editId;
  const nome = document.getElementById('fNome').value.trim();
  const email = document.getElementById('fEmail').value.trim();
  const cpf = (document.getElementById('fCpf')?.value || '').replace(/\D/g, '');
  const user = document.getElementById('fUser')?.value.trim() || '';
  const erroEl = document.getElementById('senhaErro');

  let bodyData;
  if (!isEdit) {
    const senha = document.getElementById('fSenha').value;
    if (!nome) { alert('Nome é obrigatório'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('E-mail inválido'); return; }
    if (!isValidCPF(cpf)) { alert('CPF inválido'); return; }
    if (user.length < 3) { alert('Username deve ter pelo menos 3 caracteres'); return; }
    if (!isStrongPassword(senha)) {
      if (erroEl) { erroEl.textContent = 'A senha deve ter 8+ caracteres, maiúscula, minúscula, número e símbolo'; erroEl.style.display = 'block'; }
      return;
    }
    bodyData = { nome, email, cpf: document.getElementById('fCpf').value, User: user, senha };
  } else {
    bodyData = { nome, email, cpf: document.getElementById('fCpf')?.value || null, User: user, ativo: document.getElementById('fAtivo')?.checked ? 1 : 0 };
  }

  const url = isEdit ? `/api/usuarios/${editId}` : '/api/usuarios';
  const method = isEdit ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(bodyData) });
  const json = await res.json();
  if (!res.ok) { await swalError(json.detail || 'Erro ao salvar'); return; }
  closeModal();
  loadUsuarios();
}

loadUsuarios();