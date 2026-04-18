const currentTitle = document.getElementById('currentTitle');
const currentArtist = document.getElementById('currentArtist');
const togglePlay = document.getElementById('togglePlay');
const playFeatured = document.getElementById('playFeatured');
const progressFill = document.getElementById('progressFill');
const waveBars = document.querySelectorAll('.waveform span');
const passwordInput = document.getElementById('passwordInput');
const togglePassword = document.getElementById('togglePassword');

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
  const words = document.body.classList.contains('page-login')
    ? ['ritmo', 'mood', 'momento', 'repeat']
    : ['discover', 'collect', 'feel', 'repeat'];
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

if (togglePassword && passwordInput) {
  togglePassword.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePassword.textContent = isHidden ? 'Ocultar' : 'Mostrar';
    togglePassword.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));

// ... (mantenha o código acima igual) ...

const navItems = document.querySelectorAll('.admin-nav-item');
// Seleciona todas as seções que têm o atributo data-section-content OU data-panel
const contentSections = document.querySelectorAll('[data-section-content], [data-panel]');
const pageTitle = document.getElementById('pageTitle');

const titles = {
  dashboard: 'Dashboard geral',
  musicas: 'Gerenciamento de músicas',
  artistas: 'Gestão de artistas',
  playlists: 'Playlists oficiais',
  usuarios: 'Controle de usuários',
};

// ==========================================
// CONTROLE DE ABAS E PESQUISA DO DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  const sections = document.querySelectorAll('[data-section-content], [data-panel]');
  const pageTitle = document.getElementById('pageTitle');

  const titles = {
    dashboard: 'Dashboard geral',
    musicas: 'Gerenciamento de músicas',
    artistas: 'Gestão de artistas',
    playlists: 'Playlists oficiais',
    usuarios: 'Controle de usuários'
  };

  // Função que esconde tudo e mostra só a aba clicada
  function showSection(target) {
    sections.forEach(sec => {
      const isMatch = sec.dataset.sectionContent === target || sec.dataset.panel === target;
      if (isMatch) {
        sec.style.display = 'block';
        // Pequeno atraso para a animação do CSS funcionar sem bugar
        setTimeout(() => { 
          sec.style.opacity = '1'; 
          sec.style.visibility = 'visible'; 
        }, 10);
      } else {
        sec.style.display = 'none';
        sec.style.opacity = '0';
        sec.style.visibility = 'hidden';
      }
    });
  }

  // Adiciona o evento de clique nos botões do menu lateral
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      // Muda a cor do botão selecionado
      navItems.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Descobre qual seção foi clicada, troca o título e a aba
      const target = this.dataset.section;
      if (pageTitle) pageTitle.textContent = titles[target] || 'Dashboard geral';
      showSection(target);
    });
  });

  // Inicializa a tela mostrando o Dashboard logo que entra
  showSection('dashboard');
});


// ==========================================
// CONTROLE DO MODAL DE CADASTRO
// ==========================================

// Função para abrir o Modal
function openAddModal(tipo) {
  const modal = document.getElementById('formModal');
  const modalTitle = document.getElementById('modalTitle');
  
  if (modal) {
    // Muda o display de 'none' para 'flex' (ou 'block') para aparecer na tela
    modal.style.display = 'flex'; 
    
    // Atualiza o título do pop-up automaticamente
    if (modalTitle) {
      // Deixa a primeira letra maiúscula (ex: "usuario" vira "Usuario")
      const tipoFormatado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
      modalTitle.textContent = 'Adicionar ' + tipoFormatado;
    }
  }
}

// Função para fechar o Modal
function closeModal() {
  const modal = document.getElementById('formModal');
  if (modal) {
    modal.style.display = 'none'; // Esconde o modal novamente
  }
}

// Fecha o modal se o usuário clicar na área escura (fora da caixinha)
window.onclick = function(event) {
  const modal = document.getElementById('formModal');
  if (event.target === modal) {
    closeModal();
  }
}

// ==========================================
// CONTROLE DO MODAL DE EDIÇÃO
// ==========================================

// Função que abre o modal já preenchido
function openEditUserModal(id, nome, email, cpf) {
  const modal = document.getElementById('editModal');
  if (modal) {
    // Puxa os elementos do HTML e preenche com os dados do banco
    document.getElementById('edit_id').value = id;
    document.getElementById('edit_nome').value = nome;
    document.getElementById('edit_email').value = email;
    
    // O CPF pode vir como nulo ou "None" do banco, então limpamos se não existir
    document.getElementById('edit_cpf').value = (cpf !== 'None' && cpf !== 'null') ? cpf : '';
    
    modal.style.display = 'flex';
  }
}

// Fechar o modal de edição
function closeEditModal() {
  const modal = document.getElementById('editModal');
  if (modal) modal.style.display = 'none';
}

// Sobrescreve a função de fechar clicando fora para suportar os dois modais
window.onclick = function(event) {
  const formModal = document.getElementById('formModal');
  const editModal = document.getElementById('editModal');
  
  if (event.target === formModal) closeModal();
  if (event.target === editModal) closeEditModal();
}