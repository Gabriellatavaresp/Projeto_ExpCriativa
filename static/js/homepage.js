// bom dia / boa tarde / boa noite
    const h = new Date().getHours();
    const greet = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    document.getElementById('greeting').textContent = greet;

    // revelar ao rolar
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));

    // player
    const tracks = [
      { title:'Bohemian Rhapsody', artist:'Queen', dur:'5:55', total:355 },
      { title:'Stairway to Heaven', artist:'Led Zeppelin', dur:'8:02', total:482 },
      { title:'Hotel California', artist:'Eagles', dur:'6:30', total:390 },
      { title:'Comfortably Numb', artist:'Pink Floyd', dur:'6:22', total:382 },
    ];
    let cur=0, playing=false, elapsed=84, timer=null;

    function setTrack(i) {
      cur = i; elapsed = 0;
      document.getElementById('nowTitle').textContent = tracks[cur].title;
      document.getElementById('nowArtist').textContent = tracks[cur].artist;
      document.getElementById('totalTime').textContent = tracks[cur].dur;
      document.getElementById('progressFill').style.width = '0%';
      document.getElementById('curTime').textContent = '0:00';
    }

    document.getElementById('playBtn').onclick = function() {
      playing = !playing;
      const icon = document.getElementById('playIcon');
      if (playing) {
        icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        timer = setInterval(tick, 1000);
      } else {
        icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        clearInterval(timer);
      }
    };

    function tick() {
      elapsed++;
      const pct = Math.min((elapsed / tracks[cur].total) * 100, 100);
      document.getElementById('progressFill').style.width = pct + '%';
      const m = Math.floor(elapsed/60), s = elapsed%60;
      document.getElementById('curTime').textContent = m+':'+String(s).padStart(2,'0');
      if (elapsed >= tracks[cur].total) { setTrack((cur+1)%tracks.length); }
    }

    document.getElementById('nextBtn').onclick = () => setTrack((cur+1)%tracks.length);
    document.getElementById('prevBtn').onclick = () => setTrack((cur-1+tracks.length)%tracks.length);

    // alternar curtida
    document.getElementById('heartBtn').onclick = function() {
      this.classList.toggle('liked');
    };

    // menu mobile
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    document.getElementById('menuBtn').onclick = () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    };
    overlay.onclick = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    };