const navItems = document.querySelectorAll('.admin-nav-item');
const panels = document.querySelectorAll('.section-panel');
const pageTitle = document.getElementById('pageTitle');
const globalSearch = document.getElementById('globalSearch');

const titles = {
  dashboard: 'Dashboard geral',
  musicas: 'Gerenciamento de músicas',
  artistas: 'Gestão de artistas',
  playlists: 'Playlists oficiais',
  usuarios: 'Controle de usuários',
  relatorios: 'Central de relatórios',
  configuracoes: 'Configurações da plataforma'
};

function resetPanels() {
  panels.forEach((panel) => {
    panel.classList.remove('highlighted', 'dimmed');
  });
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((btn) => btn.classList.remove('active'));
    item.classList.add('active');

    const section = item.dataset.section;
    pageTitle.textContent = titles[section] || 'Dashboard geral';

    if (section === 'dashboard') {
      resetPanels();
      return;
    }

    panels.forEach((panel) => {
      const isMatch = panel.dataset.panel === section;
      panel.classList.toggle('highlighted', isMatch);
      panel.classList.toggle('dimmed', !isMatch);
    });
  });
});

globalSearch.addEventListener('input', (event) => {
  const term = event.target.value.toLowerCase().trim();

  if (!term) {
    resetPanels();
    return;
  }

  panels.forEach((panel) => {
    const content = panel.textContent.toLowerCase();
    const match = content.includes(term);
    panel.classList.toggle('highlighted', match);
    panel.classList.toggle('dimmed', !match);
  });
});
