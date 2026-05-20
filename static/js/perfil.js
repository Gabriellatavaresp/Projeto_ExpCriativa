let userId = null;

async function init() {
  const res = await fetch('/api/me').catch(() => null);
  if (!res || res.status === 401) { window.location.href = '/login'; return; }
  const { data: user } = await res.json();
  userId = user.id_usuario;

  document.getElementById('fNome').value     = user.nome || '';
  document.getElementById('fEmail').value    = user.email || '';
  document.getElementById('fUsername').value = user.username || '';
  document.getElementById('fCpf').value      = user.cpf || '';
  document.getElementById('sidebarNome').textContent = user.nome;

  const av = document.getElementById('avatarEl');
  if (user.foto_perfil) {
    av.innerHTML = `<img src="${user.foto_perfil}" alt="">`;
  } else {
    av.textContent = user.nome.split(' ').slice(0,2).map(p => p[0].toUpperCase()).join('');
  }

  // stats
  const [plRes, curtRes, histRes] = await Promise.all([
    fetch('/api/playlists/minhas'),
    fetch(`/api/curtidas/${userId}`),
    fetch(`/api/historico/${userId}`),
  ]);
  const [pl, curt, hist] = await Promise.all([plRes.json(), curtRes.json(), histRes.json()]);
  document.getElementById('statPlaylists').textContent = (pl.data || []).length;
  document.getElementById('statCurtidas').textContent  = (curt.data || []).length;
  document.getElementById('statHistorico').textContent = (hist.data || []).length;
}

async function salvarPerfil() {
  const nome     = document.getElementById('fNome').value.trim();
  const email    = document.getElementById('fEmail').value.trim();
  const username = document.getElementById('fUsername').value.trim();
  const cpf      = document.getElementById('fCpf').value;

  if (!nome || !email) return swalWarning('Nome e e-mail são obrigatórios.');

  const res = await fetch(`/api/usuarios/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, username, cpf, ativo: 1 }),
  });
  if (res.ok) {
    swalSuccess('Perfil atualizado!');
    document.getElementById('sidebarNome').textContent = nome;
  } else {
    const err = await res.json().catch(() => ({}));
    swalError(err.detail || 'Erro ao salvar.');
  }
}

async function alterarSenha() {
  const senha   = document.getElementById('fSenha').value;
  const confirm = document.getElementById('fSenhaConfirm').value;

  if (senha.length < 8)       return swalWarning('A senha deve ter no mínimo 8 caracteres.');
  if (senha !== confirm)      return swalWarning('As senhas não coincidem.');
  if (!/[A-Z]/.test(senha))  return swalWarning('A senha precisa ter ao menos uma letra maiúscula.');
  if (!/[0-9]/.test(senha))  return swalWarning('A senha precisa ter ao menos um número.');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) return swalWarning('A senha precisa ter ao menos um caractere especial.');

  const res = await fetch(`/api/usuarios/${userId}/senha`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senha }),
  });
  if (res.ok) {
    swalSuccess('Senha alterada com sucesso!');
    document.getElementById('fSenha').value = '';
    document.getElementById('fSenhaConfirm').value = '';
  } else {
    swalError('Erro ao alterar a senha.');
  }
}

async function uploadFoto(input) {
  const file = input.files[0];
  if (!file) return;
  const form = new FormData();
  form.append('foto', file);
  const res  = await fetch('/api/me/foto', { method: 'POST', body: form });
  const json = await res.json();
  if (res.ok && json.data?.foto_perfil) {
    document.getElementById('avatarEl').innerHTML = `<img src="${json.data.foto_perfil}" alt="">`;
    swalSuccess('Foto atualizada!');
  }
}

init();
