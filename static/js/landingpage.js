// revelar ao rolar
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 120);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

    // logica do player
    const tracks = [
      { title: 'Bohemian Rhapsody', artist: 'Queen · 1975',            dur: '5:55', pct: 24 },
      { title: 'Stairway to Heaven', artist: 'Led Zeppelin · 1971',    dur: '8:02', pct: 0  },
      { title: 'Hotel California',   artist: 'Eagles · 1976',           dur: '6:30', pct: 0  },
      { title: 'Comfortably Numb',   artist: 'Pink Floyd · 1979',       dur: '6:22', pct: 0  },
    ];
    let cur = 0, playing = false, elapsed = 0, timer = null;

    function setTrack(i) {
      cur = i;
      const t = tracks[cur];
      document.getElementById('pTitle').textContent  = t.title;
      document.getElementById('pArtist').textContent = t.artist;
      document.getElementById('pFill').style.width   = t.pct + '%';
      elapsed = 0;
    }

    function togglePlay() {
      playing = !playing;
      const icon = document.getElementById('playIcon');
      const vinyl = document.getElementById('vinyl');
      const wf    = document.getElementById('waveform');
      if (playing) {
        icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        vinyl.classList.add('playing');
        wf.classList.remove('paused');
        timer = setInterval(tick, 1000);
      } else {
        icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        vinyl.classList.remove('playing');
        wf.classList.add('paused');
        clearInterval(timer);
      }
    }

    function tick() {
      elapsed++;
      const total = [355, 482, 390, 382][cur];
      const pct   = Math.min((elapsed / total) * 100, 100);
      document.getElementById('pFill').style.width = pct + '%';
      const m = Math.floor(elapsed / 60), s = elapsed % 60;
      document.getElementById('pCur').textContent = m + ':' + String(s).padStart(2,'0');
      if (elapsed >= total) nextTrack();
    }

    function nextTrack() {
      if (playing) togglePlay();
      setTrack((cur + 1) % tracks.length);
      if (!playing) togglePlay();
    }

    function prevTrack() {
      if (playing) togglePlay();
      setTrack((cur - 1 + tracks.length) % tracks.length);
      if (!playing) togglePlay();
    }

    // partículas
    function spawnParticle() {
      const p = document.createElement('div');
      p.className = 'particle';
      const isGreen = Math.random() > .5;
      p.style.cssText = `
        left: ${Math.random() * 100}vw;
        width: ${Math.random() * 3 + 2}px;
        height: ${Math.random() * 3 + 2}px;
        animation-duration: ${Math.random() * 4 + 5}s;
        background: ${isGreen ? 'rgba(16,185,129,.6)' : 'rgba(59,130,246,.6)'};
        box-shadow: 0 0 6px ${isGreen ? '#10B981' : '#3B82F6'};
        opacity: ${Math.random() * .5 + .3};
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 9000);
    }
    setInterval(spawnParticle, 250);