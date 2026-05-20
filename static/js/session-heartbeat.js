let ultimaAtividade = Date.now();

document.addEventListener('mousemove', () => ultimaAtividade = Date.now());
document.addEventListener('keydown', () => ultimaAtividade = Date.now());
document.addEventListener('click', () => ultimaAtividade = Date.now());

setInterval(async () => {
  const inativo = Date.now() - ultimaAtividade;
  if (inativo < 3000) {
    // usuário ativo — renova sessão
    const res = await fetch('/api/session/heartbeat', { method: 'POST' });
    if (res.status === 401) window.location.href = '/login';
  }
  // se inativo >= 5000ms, não renova — sessão expira naturalmente
}, 1000);