const currentTitle = document.getElementById('currentTitle');
const currentArtist = document.getElementById('currentArtist');
const togglePlay = document.getElementById('togglePlay');
const playFeatured = document.getElementById('playFeatured');
const progressFill = document.getElementById('progressFill');

let isPlaying = false;
let progress = 32;
let progressTimer = null;

function setTrack(title, artist) {
  currentTitle.textContent = title;
  currentArtist.textContent = artist;
  progress = 8;
  progressFill.style.width = `${progress}%`;
}

function startPlayback() {
  isPlaying = true;
  togglePlay.textContent = '❚❚';

  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    progress += 0.5;
    if (progress > 100) progress = 0;
    progressFill.style.width = `${progress}%`;
  }, 180);
}

function pausePlayback() {
  isPlaying = false;
  togglePlay.textContent = '▶';
  clearInterval(progressTimer);
}

function togglePlayback() {
  if (isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

togglePlay.addEventListener('click', togglePlayback);
playFeatured.addEventListener('click', () => {
  setTrack('Midnight Echo', 'Aurora Waves');
  startPlayback();
});

document.querySelectorAll('.music-card, .mix-item').forEach((item) => {
  item.addEventListener('click', () => {
    const title = item.dataset.title;
    const artist = item.dataset.artist;
    setTrack(title, artist);
    startPlayback();
  });
});

document.querySelectorAll('.nav-item').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
  });
});
