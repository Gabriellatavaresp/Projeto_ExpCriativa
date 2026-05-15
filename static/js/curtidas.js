let allCurtidas = [];
let userId = null;

function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('pt-BR');
}

function renderTable(list) {
  const tbody = document.getElementById('curtidasBody');
  const empty = document.getElementById('emptyMsg');
  const table = document.getElementById('curtidasTable');
  if (list.length === 0) {
    table.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  table.style.display = '';
  empty.style.display = 'none';
  tbody.innerHTML = list.map((m, i) => `
    <tr style="border-bottom:1px solid #1e1e2e;transition:background .15s" onmouseover="this.style.background='#1a1a2e'" onmouseout="this.style.background='transparent'">
      <td style="padding:12px 8px;color:#666">${i + 1}</td>
      <td style="padding:12px 8px;color:#e8e8f0;font-weight:500">${esc(m.titulo)}</td>
      <td style="padding:12px 8px;color:#aaa">${esc(m.nome_artista)}</td>
      <td style="padding:12px 8px;color:#aaa">${esc(m.duracao||'—')}</td>
      <td style="padding:12px 8px;color:#666">${formatDate(m.data_curtida)}</td>
      <td style="padding:12px 8px">
        <button onclick="descurtir(${m.id_musica}, this)"
          style="background:none;border:none;cursor:pointer;color:#f87171;font-size:1.1rem"
          title="Remover curtida">♥</button>
      </td>
    </tr>`).join('');
}

function filterMusicas() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  renderTable(allCurtidas.filter(m =>
    m.titulo.toLowerCase().includes(q) || m.nome_artista.toLowerCase().includes(q)
  ));
}

async function descurtir(idMusica, btn) {
  const ok = await swalConfirmDelete('esta curtida');
  if (!ok) return;
  const res = await fetch(`/api/curtidas/${userId}/${idMusica}`, { method: 'DELETE' });
  if (res.ok) {
    allCurtidas = allCurtidas.filter(m => m.id_musica !== idMusica);
    document.getElementById('totalCurtidas').textContent = `${allCurtidas.length} música${allCurtidas.length !== 1 ? 's' : ''}`;
    filterMusicas();
    swalSuccess('Curtida removida.');
  }
}

async function init() {
  const meRes = await fetch('/api/me').catch(() => null);
  if (!meRes || meRes.status === 401) { window.location.href = '/login'; return; }
  const { data: user } = await meRes.json();
  userId = user.id_usuario;

  const res = await fetch(`/api/curtidas/${userId}`).catch(() => null);
  if (!res || !res.ok) return;
  const { data } = await res.json();
  allCurtidas = data || [];
  document.getElementById('totalCurtidas').textContent = `${allCurtidas.length} música${allCurtidas.length !== 1 ? 's' : ''}`;
  renderTable(allCurtidas);
}

init();
