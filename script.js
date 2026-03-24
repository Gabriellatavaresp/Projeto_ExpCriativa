const currentTitle = document.getElementById('currentTitle');
const currentArtist = document.getElementById('currentArtist');
const togglePlay = document.getElementById('togglePlay');
const playFeatured = document.getElementById('playFeatured');
const progressFill = document.getElementById('progressFill');
const waveBars = document.querySelectorAll('.waveform span');

let isPlaying = false;
let progress = 24;
let progressTimer = null;

function setTrack(title, artist) {
  if (currentTitle) currentTitle.textContent = title;
  if (currentArtist) currentArtist.textContent = artist;
  progress = 8;
  if (progressFill) progressFill.style.width = `${progress}%`;
}

function startPlayback() {
  isPlaying = true;
  if (togglePlay) {
    togglePlay.classList.add('playing');
    togglePlay.setAttribute('aria-label', 'Pausar');
  }

  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    progress += 0.45;
    if (progress > 100) progress = 0;
    if (progressFill) progressFill.style.width = `${progress}%`;
  }, 180);
}

function pausePlayback() {
  isPlaying = false;
  if (togglePlay) {
    togglePlay.classList.remove('playing');
    togglePlay.setAttribute('aria-label', 'Reproduzir');
  }
  clearInterval(progressTimer);
}

function togglePlayback() {
  isPlaying ? pausePlayback() : startPlayback();
}

if (togglePlay) togglePlay.addEventListener('click', togglePlayback);
if (playFeatured) {
  playFeatured.addEventListener('click', () => {
    setTrack('Midnight Echo', 'Aurora Waves');
    startPlayback();
  });
}

document.querySelectorAll('[data-title][data-artist]').forEach((item) => {
  item.addEventListener('click', () => {
    setTrack(item.dataset.title, item.dataset.artist);
    startPlayback();
  });
});

document.querySelectorAll('.nav-item').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

const typeTarget = document.querySelector('[data-typewriter]');
if (typeTarget) {
  const words = ['discover', 'collect', 'feel', 'repeat'];
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const typeLoop = () => {
    const word = words[wordIndex];
    typeTarget.textContent = deleting
      ? word.slice(0, charIndex--)
      : word.slice(0, charIndex++);

    let timeout = deleting ? 55 : 85;

    if (!deleting && charIndex === word.length + 1) {
      deleting = true;
      timeout = 1200;
    }

    if (deleting && charIndex < 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      charIndex = 0;
      timeout = 250;
    }

    setTimeout(typeLoop, timeout);
  };

  typeLoop();
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));

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
  panels.forEach((panel) => panel.classList.remove('highlighted', 'dimmed'));
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((btn) => btn.classList.remove('active'));
    item.classList.add('active');
    const section = item.dataset.section;
    if (pageTitle) pageTitle.textContent = titles[section] || 'Dashboard geral';

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

if (globalSearch) {
  globalSearch.addEventListener('input', (event) => {
    const term = event.target.value.toLowerCase().trim();
    if (!term) {
      resetPanels();
      return;
    }

    panels.forEach((panel) => {
      const match = panel.textContent.toLowerCase().includes(term);
      panel.classList.toggle('highlighted', match);
      panel.classList.toggle('dimmed', !match);
    });
  });
}
