// URLs das imagens
  const IMG = {
    neon:     'https://images.unsplash.com/photo-1530394167726-8b410f899685?w=120&q=80',
    synth:    'https://images.unsplash.com/photo-1648229168049-5525383e80dc?w=120&q=80',
    musician: 'https://images.unsplash.com/photo-1719353128335-725362ed1c55?w=120&q=80',
    fluid:    'https://images.unsplash.com/photo-1771814579034-4c947c51594d?w=120&q=80',
    city:     'https://images.unsplash.com/photo-1613493950854-220cf69ab69b?w=120&q=80',
    desert:   'https://images.unsplash.com/photo-1600914831426-e5d1ea237920?w=120&q=80',
    ambient:  'https://images.unsplash.com/photo-1699129071512-fd528d98cd82?w=120&q=80',
    mic:      'https://images.unsplash.com/photo-1552174588-6733961c358e?w=120&q=80',
    pink:     'https://images.unsplash.com/photo-1774677784169-4adcb5e8035f?w=120&q=80',
    teal:     'https://images.unsplash.com/photo-1566744883035-6efa5404571f?w=120&q=80',
    abstract: 'https://images.unsplash.com/photo-1771301455501-694654813e1a?w=120&q=80',
    synth2:   'https://images.unsplash.com/photo-1579353174740-9e4e39428d6f?w=120&q=80',
    forest:   'https://images.unsplash.com/photo-1716017052766-e9bea115aa2b?w=120&q=80',
    jazz:     'https://images.unsplash.com/photo-1706636879563-8ee9bbf720ec?w=120&q=80',
    electric: 'https://images.unsplash.com/photo-1721004065734-2514c93ba77a?w=120&q=80',
    acoustic: 'https://images.unsplash.com/photo-1670270837762-9b6bae6a9761?w=120&q=80',
    geo:      'https://images.unsplash.com/photo-1748186673798-5385404fbb14?w=120&q=80',
    lofi:     'https://images.unsplash.com/photo-1693642872628-75069317e1c8?w=120&q=80',
  };

  // Cores do tema
  const COLORS = [
    { label:'Mint',      value:'#6b9997' },
    { label:'Sage',      value:'#8a9e7a' },
    { label:'Teal',      value:'#4e7f82' },
    { label:'Steel',     value:'#5a7a8a' },
    { label:'Brown',     value:'#7a6050' },
    { label:'Slate',     value:'#4a5a6a' },
    { label:'Olive',     value:'#6a7a4a' },
    { label:'Plum',      value:'#7a5070' },
  ];

  // Dados — todas as músicas
  const ALL_SONGS = [
    { id:1,  title:'Neon Pulse',     artist:'Midnight Echo',   album:'Neon Pulse EP',   img:IMG.neon,     dur:222, added:'2025-11-03' },
    { id:2,  title:'Glass City',     artist:'Dusk Protocol',   album:'Frequencies',     img:IMG.fluid,    dur:255, added:'2025-11-03' },
    { id:3,  title:'Retrograde',     artist:'Solar Winds',     album:'Retrograde',      img:IMG.synth,    dur:238, added:'2025-11-05' },
    { id:4,  title:'After Rain',     artist:'Luna Park',       album:'Soft Reset',      img:IMG.city,     dur:302, added:'2025-11-08' },
    { id:5,  title:'Chrome Waves',   artist:'Dusk Protocol',   album:'Frequencies',     img:IMG.ambient,  dur:207, added:'2025-11-10' },
    { id:6,  title:'Mirage Drive',   artist:'Kai Solen',       album:'Mirage Drive',    img:IMG.desert,   dur:284, added:'2025-11-12' },
    { id:7,  title:'City Breath',    artist:'Luna Park',       album:'Soft Reset',      img:IMG.city,     dur:211, added:'2025-11-15' },
    { id:8,  title:'Signal Lost',    artist:'Midnight Echo',   album:'Neon Pulse EP',   img:IMG.neon,     dur:248, added:'2025-11-18' },
    { id:9,  title:'Quiet Hours',    artist:'Velvex',          album:'Tessellate',      img:IMG.teal,     dur:377, added:'2025-11-20' },
    { id:10, title:'Asphalt Dream',  artist:'Kai Solen',       album:'Mirage Drive',    img:IMG.pink,     dur:235, added:'2025-11-22' },
    { id:11, title:'Satellite',      artist:'Solar Winds',     album:'Retrograde',      img:IMG.synth2,   dur:262, added:'2025-11-25' },
    { id:12, title:'Fade Out Lane',  artist:'Velvex',          album:'Tessellate',      img:IMG.mic,      dur:340, added:'2025-11-28' },
    { id:13, title:'Morning Haze',   artist:'Aura Collective', album:'Dawn EP',         img:IMG.abstract, dur:195, added:'2025-12-01' },
    { id:14, title:'Ember',          artist:'Sol & Dust',      album:'Warm Static',     img:IMG.musician, dur:290, added:'2025-12-05' },
    { id:15, title:'Polygon',        artist:'Circuit Bloom',   album:'Forms',           img:IMG.fluid,    dur:213, added:'2025-12-07' },
    { id:16, title:'Periphery',      artist:'Midnight Echo',   album:'Neon Pulse EP',   img:IMG.neon,     dur:245, added:'2025-12-10' },
    { id:17, title:'Hollow Coast',   artist:'Luna Park',       album:'Soft Reset',      img:IMG.teal,     dur:312, added:'2025-12-12' },
    { id:18, title:'Silver Thread',  artist:'Kai Solen',       album:'Mirage Drive',    img:IMG.desert,   dur:228, added:'2025-12-15' },
    { id:19, title:'Undertow',       artist:'Velvex',          album:'Tessellate',      img:IMG.mic,      dur:267, added:'2025-12-18' },
    { id:20, title:'Parallel',       artist:'Solar Winds',     album:'Retrograde',      img:IMG.synth2,   dur:235, added:'2025-12-20' },
  ];

  // Dados — playlists
  const PLAYLISTS = [
    { id:1, name:'Late Night Drives', desc:'For those long drives under city lights.', cover:IMG.lofi,    color:'#5a8884', type:'playlist', songIds:[1,2,3,4,5,6,7,8,9,10,11,12] },
    { id:2, name:'Deep Focus',        desc:'Concentration and clarity.',               cover:IMG.abstract, color:'#4a5a6a', type:'playlist', songIds:[3,5,9,11,13,15,20] },
    { id:3, name:'Synthwave Nights',  desc:'Retro-futuristic vibes.',                  cover:IMG.synth2,   color:'#5a4878', type:'playlist', songIds:[1,3,8,11,16] },
    { id:4, name:'Forest Ambient',    desc:'Sounds of nature and calm.',               cover:IMG.forest,   color:'#4a7050', type:'album',    songIds:[4,7,9,13,17] },
    { id:5, name:'Jazz & Vinyl',      desc:'Classic jazz and vinyl warmth.',           cover:IMG.jazz,     color:'#7a6050', type:'playlist', songIds:[2,6,10,14,18] },
    { id:6, name:'Electric Dreams',   desc:'Electronic textures and beats.',           cover:IMG.electric, color:'#4e6090', type:'album',    songIds:[1,5,12,15,19] },
    { id:7, name:'Acoustic Sessions', desc:'Unplugged and intimate.',                  cover:IMG.acoustic, color:'#6a5040', type:'playlist', songIds:[4,7,10,14,18] },
    { id:8, name:'Geometric Vibes',   desc:'Angular sounds and patterns.',             cover:IMG.geo,      color:'#507060', type:'playlist', songIds:[2,6,9,11,15,20] },
  ];

  // Estado
  let activePlId  = getUrlParam() || 1;
  let activePl    = null;
  let songs       = []; // músicas da playlist atual (ordenadas)
  let playingId   = null;
  let npPlaying   = false;
  let likedIds    = new Set([2,5,8,11]);
  let likedPls    = new Set();
  let shuffleOn   = false;
  let songFilter  = '';
  let poolFilter  = '';
  let sortCol     = null;
  let sortDir     = 'asc';
  let draggedIdx  = null;
  let ctxSongId   = null;
  let editColor   = '';
  let progressPct = 0.35;
  let progressTimer= null;

  function getUrlParam() {
    const p = new URLSearchParams(window.location.search).get('id');
    return p ? parseInt(p) : null;
  }

  // Auxiliares
  function fmt(secs) {
    const m = Math.floor(secs/60), s = secs%60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  }
  function fmtDate(d) {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  }
  function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function totalDur(arr) {
    const t = arr.reduce((a,s)=>a+s.dur,0);
    const h = Math.floor(t/3600), m = Math.floor((t%3600)/60);
    return h>0 ? `${h} hr ${m} min` : `${m} min`;
  }
  function poolFor(pl) {
    return ALL_SONGS.filter(s => !pl.songIds.includes(s.id));
  }

  // Carregar playlist
  function loadPlaylist(id) {
    activePlId = id;
    activePl   = JSON.parse(JSON.stringify(PLAYLISTS.find(p=>p.id===id) || PLAYLISTS[0]));
    songs      = activePl.songIds.map(sid=>ALL_SONGS.find(s=>s.id===sid)).filter(Boolean);
    sortCol    = null; sortDir='asc';
    songFilter = '';
    document.getElementById('songFilterInput').value = '';
    document.getElementById('recSearchInput').value  = '';
    document.getElementById('addModalSearch').value  = '';
    poolFilter = '';
    history.replaceState(null,'',`?id=${activePl.id}`);
    renderAll();
  }

  // Renderizar tudo
  function renderAll() {
    renderSidebar();
    renderHero();
    renderSongs();
    renderPool();
    renderNowPlaying();
  }

  // Sidebar
  function renderSidebar() {
    const list = document.getElementById('sidebarList');
    list.innerHTML = PLAYLISTS.map(pl=>`
      <button class="pl-item ${pl.id===activePlId?'active':''}" onclick="loadPlaylist(${pl.id})">
        <img class="pl-thumb" src="${pl.cover}" alt="${esc(pl.name)}" loading="lazy" onerror="this.style.display='none'" />
        <div class="pl-item-info">
          <div class="pl-item-name">${esc(pl.name)}</div>
          <div class="pl-item-meta">${pl.type==='album'?'Album':'Playlist'} · ${pl.songIds.length} songs</div>
        </div>
        <div class="mini-bars"><div class="mbar"></div><div class="mbar"></div><div class="mbar"></div></div>
      </button>
    `).join('');
  }

  // Hero
  function renderHero() {
    const pl = activePl;
    document.title = `Aurora — ${pl.name}`;
    document.getElementById('barTitle').textContent    = pl.name;
    document.getElementById('heroType').textContent    = pl.type==='album'?'Album':'Playlist';
    document.getElementById('heroName').textContent    = pl.name;
    document.getElementById('heroDesc').textContent    = pl.desc || 'Click to add a description…';
    document.getElementById('heroDesc').style.color    = pl.desc ? '' : 'var(--text-faint)';
    document.getElementById('heroCover').src           = pl.cover;

    const s = songs;
    const totalTracks = s.length;
    const dur = totalDur(s);
    document.getElementById('heroMeta').innerHTML =
      `<strong>You</strong><span class="dot">·</span>${totalTracks} song${totalTracks!==1?'s':''}<span class="dot">·</span>${dur}`;

    // Gradiente do hero
    document.getElementById('heroBg').style.background =
      `linear-gradient(to bottom, ${pl.color}88 0%, var(--bg) 100%)`;

    // Botão de curtir
    const lb = document.getElementById('likePlaylistBtn');
    lb.classList.toggle('liked', likedPls.has(pl.id));

    // Shuffle
    document.getElementById('shuffleBtn').classList.toggle('active', shuffleOn);
  }

  // Tabela de músicas
  function renderSongs() {
    let list = [...songs];

    // Filtro
    if (songFilter) {
      const q = songFilter.toLowerCase();
      list = list.filter(s=>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
      );
    }

    // Ordenação
    if (sortCol) {
      list.sort((a,b)=>{
        let va,vb;
        if (sortCol==='title')    { va=a.title;    vb=b.title;  }
        if (sortCol==='album')    { va=a.album;    vb=b.album;  }
        if (sortCol==='date')     { va=a.added;    vb=b.added;  }
        if (sortCol==='duration') { va=a.dur;      vb=b.dur;    }
        if (sortCol==='num')      { va=songs.indexOf(a); vb=songs.indexOf(b); }
        if (typeof va==='number') return sortDir==='asc' ? va-vb : vb-va;
        return sortDir==='asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }

    const tbody = document.getElementById('songList');
    const noSongs = document.getElementById('noSongs');

    if (list.length===0) {
      tbody.innerHTML = '';
      noSongs.style.display = 'block';
    } else {
      noSongs.style.display = 'none';
      tbody.innerHTML = list.map((s,i)=>{
        const isPlaying = s.id===playingId;
        const liked = likedIds.has(s.id);
        const origIdx = songs.indexOf(s);
        return `
          <tr class="song-row ${isPlaying?'playing':''}"
              draggable="true"
              data-idx="${origIdx}"
              data-id="${s.id}"
              ondragstart="dragStart(event,${origIdx})"
              ondragover="dragOver(event)"
              ondragleave="dragLeave(event)"
              ondrop="dragDrop(event,${origIdx})"
              ondragend="dragEnd(event)">
            <td class="td-drag">
              <div class="drag-handle">
                <svg viewBox="0 0 24 24"><line x1="9" y1="5" x2="9" y2="19"/><line x1="15" y1="5" x2="15" y2="19"/></svg>
              </div>
            </td>
            <td class="td-num">
              <span class="track-num">${i+1}</span>
              <div class="wave-bars"><div class="wbar"></div><div class="wbar"></div><div class="wbar"></div></div>
              <div class="play-icon" onclick="playSong(${s.id})">
                <svg viewBox="0 0 24 24">
                  ${isPlaying && npPlaying
                    ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
                    : '<polygon points="5 3 19 12 5 21 5 3"/>'
                  }
                </svg>
              </div>
            </td>
            <td class="td-title">
              <div class="song-info">
                <img class="song-art" src="${s.img}" alt="${esc(s.title)}" loading="lazy" />
                <div class="song-text">
                  <div class="song-name">${esc(s.title)}</div>
                  <div class="song-artist"><a onclick="void(0)">${esc(s.artist)}</a></div>
                </div>
              </div>
            </td>
            <td class="td-album c-album"><a onclick="void(0)">${esc(s.album)}</a></td>
            <td class="td-date c-date">${fmtDate(s.added)}</td>
            <td class="td-like">
              <button class="like-btn ${liked?'liked':''}" onclick="toggleLike(${s.id})" title="${liked?'Remove from liked':'Save to Liked Songs'}">
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </td>
            <td class="td-dur">${fmt(s.dur)}</td>
            <td class="td-more">
              <button class="more-btn" onclick="openCtxMenu(event,${s.id})" title="More options">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Setas de ordenação
    ['num','title','album','date','duration'].forEach(c=>{
      const el = document.getElementById(`sa-${c}`);
      if (el) el.textContent = sortCol===c ? (sortDir==='asc'?'↑':'↓') : '';
    });
    document.querySelectorAll('.t-head th').forEach(th=>{
      th.classList.remove('sorted');
    });
    if (sortCol) {
      const map = {num:'c-num',title:'c-title',album:'c-album',date:'c-date',duration:'c-dur'};
      document.querySelector(`.${map[sortCol]}`)?.classList.add('sorted');
    }
  }

  // Área de adicionar músicas
  function renderPool() {
    const pool = poolFor(activePl).filter(s=>{
      if (!poolFilter) return true;
      const q = poolFilter.toLowerCase();
      return s.title.toLowerCase().includes(q)||s.artist.toLowerCase().includes(q);
    });
    const list = document.getElementById('poolList');
    if (pool.length===0) {
      list.innerHTML = `<div style="padding:20px;color:var(--text-faint);font-size:13px;text-align:center">Nenhuma música para adicionar.</div>`;
      return;
    }
    list.innerHTML = pool.map(s=>`
      <div class="add-pool-row">
        <img class="pool-art" src="${s.img}" alt="${esc(s.title)}" loading="lazy" />
        <div class="pool-info">
          <div class="pool-title">${esc(s.title)}</div>
          <div class="pool-meta">${esc(s.artist)} · ${esc(s.album)}</div>
        </div>
        <button class="pool-add-btn" onclick="addSongFromPool(${s.id},this)">+ Adicionar</button>
      </div>
    `).join('');
  }

  // Barra de reprodução
  function renderNowPlaying() {
    const song = ALL_SONGS.find(s=>s.id===playingId);
    const art    = document.getElementById('npArt');
    const title  = document.getElementById('npTitle');
    const artist = document.getElementById('npArtist');
    const total  = document.getElementById('npTotal');
    const heart  = document.getElementById('npHeart');
    const pbtn   = document.getElementById('npPlayBtn');

    if (song) {
      art.src        = song.img;
      title.textContent  = song.title;
      artist.textContent = song.artist;
      total.textContent  = fmt(song.dur);
      heart.classList.toggle('liked', likedIds.has(song.id));
    } else {
      art.src        = '';
      title.textContent  = '—';
      artist.textContent = '—';
      total.textContent  = '0:00';
      heart.classList.remove('liked');
    }

    const isPlay = npPlaying && !!song;
    pbtn.classList.toggle('paused', !isPlay);
    pbtn.innerHTML = isPlay
      ? `<svg viewBox="0 0 24 24" style="margin-left:0"><rect x="6" y="4" width="4" height="16" style="stroke:#121212;fill:#121212"/><rect x="14" y="4" width="4" height="16" style="stroke:#121212;fill:#121212"/></svg>`
      : `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;

    updateProgress();
  }

  function updateProgress() {
    const fill  = document.getElementById('progressFill');
    const thumb = document.getElementById('progressThumb');
    const cur   = document.getElementById('npCur');
    const song  = ALL_SONGS.find(s=>s.id===playingId);
    const pct   = Math.min(Math.max(progressPct,0),1);
    fill.style.width  = (pct*100)+'%';
    thumb.style.left  = (pct*100)+'%';
    if (song) {
      cur.textContent = fmt(Math.round(song.dur*pct));
    } else {
      cur.textContent = '0:00';
    }
  }

  // Reprodução
  function playSong(id) {
    if (playingId===id) {
      npPlaying = !npPlaying;
    } else {
      playingId  = id;
      npPlaying  = true;
      progressPct= 0;
      startProgressTimer();
    }
    renderSongs();
    renderNowPlaying();
  }

  function playPlaylist() {
    if (songs.length===0) return;
    const first = shuffleOn ? songs[Math.floor(Math.random()*songs.length)] : songs[0];
    playSong(first.id);
  }

  function toggleNpPlay() {
    if (!playingId && songs.length>0) { playPlaylist(); return; }
    npPlaying = !npPlaying;
    if (npPlaying) startProgressTimer(); else stopProgressTimer();
    renderSongs();
    renderNowPlaying();
  }

  function prevSong() {
    if (!playingId) return;
    const idx = songs.findIndex(s=>s.id===playingId);
    if (idx>0) playSong(songs[idx-1].id);
    else playSong(songs[songs.length-1].id);
  }

  function nextSong() {
    if (!playingId) { playPlaylist(); return; }
    const idx = songs.findIndex(s=>s.id===playingId);
    if (shuffleOn) {
      const next = songs[Math.floor(Math.random()*songs.length)];
      playSong(next.id);
    } else if (idx<songs.length-1) {
      playSong(songs[idx+1].id);
    } else {
      playSong(songs[0].id);
    }
  }

  function startProgressTimer() {
    stopProgressTimer();
    const song = ALL_SONGS.find(s=>s.id===playingId);
    if (!song) return;
    const step = 0.5/song.dur;
    progressTimer = setInterval(()=>{
      progressPct += step;
      if (progressPct>=1) { progressPct=0; nextSong(); }
      updateProgress();
    },500);
  }

  function stopProgressTimer() {
    if (progressTimer) { clearInterval(progressTimer); progressTimer=null; }
  }

  function seekProgress(e) {
    const track = document.getElementById('progressTrack');
    const rect = track.getBoundingClientRect();
    progressPct = Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
    updateProgress();
    if (npPlaying) startProgressTimer();
  }

  function toggleShuffle() {
    shuffleOn = !shuffleOn;
    document.getElementById('shuffleBtn').classList.toggle('active',shuffleOn);
    document.getElementById('npShuffle').classList.toggle('active',shuffleOn);
    toast(shuffleOn?'Shuffle ativado':'Shuffle desativado');
  }

  function toggleLikeCurrentSong() {
    if (!playingId) return;
    toggleLike(playingId);
  }

  // Curtidas
  function toggleLike(id) {
    const had = likedIds.has(id);
    had ? likedIds.delete(id) : likedIds.add(id);
    toast(had?'Removido das músicas curtidas':'Adicionado às músicas curtidas');
    renderSongs();
    renderNowPlaying();
  }

  function toggleLikePlaylist() {
    const had = likedPls.has(activePl.id);
    had ? likedPls.delete(activePl.id) : likedPls.add(activePl.id);
    document.getElementById('likePlaylistBtn').classList.toggle('liked',!had);
    toast(had?'Removido da biblioteca':'Salvo na biblioteca');
  }

  // Ordenação e filtro
  function sortBy(col) {
    if (sortCol===col) sortDir = sortDir==='asc'?'desc':'asc';
    else { sortCol=col; sortDir='asc'; }
    renderSongs();
  }

  function filterSongs() {
    songFilter = document.getElementById('songFilterInput').value;
    renderSongs();
  }

  function filterPool() {
    poolFilter = document.getElementById('recSearchInput').value;
    renderPool();
  }

  function filterAddModal() {
    renderAddModal();
  }

  // Adicionar e remover músicas
  function addSongFromPool(id, btn) {
    if (activePl.songIds.includes(id)) return;
    const pl = PLAYLISTS.find(p=>p.id===activePl.id);
    if (pl) pl.songIds.push(id);
    activePl.songIds.push(id);
    songs.push(ALL_SONGS.find(s=>s.id===id));
    btn.textContent = '✓ Adicionado';
    btn.classList.add('added');
    btn.disabled = true;
    toast('Música adicionada à playlist');
    renderHero();
    renderSongs();
  }

  function removeSong(id) {
    const pl = PLAYLISTS.find(p=>p.id===activePl.id);
    if (pl) pl.songIds = pl.songIds.filter(sid=>sid!==id);
    activePl.songIds = activePl.songIds.filter(sid=>sid!==id);
    songs = songs.filter(s=>s.id!==id);
    if (playingId===id) { playingId=null; npPlaying=false; stopProgressTimer(); }
    toast('Removido da playlist');
    renderHero();
    renderSongs();
    renderPool();
    renderNowPlaying();
  }

  // Edição inline (nome e descrição no hero)
  function startEditName() {
    const n = document.getElementById('heroName');
    const inp = document.getElementById('heroNameInput');
    inp.value = activePl.name;
    n.style.display='none';
    inp.style.display='block';
    inp.focus(); inp.select();
  }

  function finishEditName() {
    const n = document.getElementById('heroName');
    const inp = document.getElementById('heroNameInput');
    const val = inp.value.trim();
    if (val) {
      activePl.name = val;
      const pl = PLAYLISTS.find(p=>p.id===activePl.id);
      if (pl) pl.name=val;
      toast('Nome da playlist atualizado');
    }
    inp.style.display='none';
    n.style.display='';
    renderHero();
    renderSidebar();
  }

  function nameKeydown(e) {
    if (e.key==='Enter') { e.preventDefault(); document.getElementById('heroNameInput').blur(); }
    if (e.key==='Escape') {
      document.getElementById('heroNameInput').value = activePl.name;
      document.getElementById('heroNameInput').blur();
    }
  }

  function startEditDesc() {
    const d = document.getElementById('heroDesc');
    const inp = document.getElementById('heroDescInput');
    inp.value = activePl.desc || '';
    d.style.display='none';
    inp.style.display='block';
    inp.focus();
  }

  function finishEditDesc() {
    const d = document.getElementById('heroDesc');
    const inp = document.getElementById('heroDescInput');
    activePl.desc = inp.value.trim();
    const pl = PLAYLISTS.find(p=>p.id===activePl.id);
    if (pl) pl.desc=activePl.desc;
    inp.style.display='none';
    d.style.display='';
    renderHero();
  }

  function descKeydown(e) {
    if (e.key==='Escape') document.getElementById('heroDescInput').blur();
  }

  // Arrastar e soltar para reordenar
  function dragStart(e,idx) {
    draggedIdx=idx;
    e.dataTransfer.effectAllowed='move';
    setTimeout(()=>e.target.classList.add('drag-ghost'),0);
  }

  function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect='move';
    document.querySelectorAll('.song-row').forEach(r=>r.classList.remove('drag-over'));
    e.currentTarget.classList.add('drag-over');
  }

  function dragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  function dragDrop(e,targetIdx) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (draggedIdx===null||draggedIdx===targetIdx) return;
    const moved = songs.splice(draggedIdx,1)[0];
    songs.splice(targetIdx,0,moved);
    activePl.songIds = songs.map(s=>s.id);
    const pl=PLAYLISTS.find(p=>p.id===activePl.id);
    if(pl) pl.songIds=[...activePl.songIds];
    draggedIdx=null;
    renderSongs();
  }

  function dragEnd(e) {
    document.querySelectorAll('.song-row').forEach(r=>{
      r.classList.remove('drag-ghost','drag-over');
    });
    draggedIdx=null;
  }

  // Menu de contexto (música)
  function openCtxMenu(e,id) {
    e.stopPropagation();
    ctxSongId=id;
    const menu=document.getElementById('ctxMenu');
    menu.classList.add('open');
    const x=Math.min(e.clientX, window.innerWidth-230);
    const y=Math.min(e.clientY, window.innerHeight-200);
    menu.style.left=x+'px';
    menu.style.top =y+'px';
  }

  function closeCtxMenu() {
    document.getElementById('ctxMenu').classList.remove('open');
    ctxSongId=null;
  }

  function ctxAction(action) {
    if (!ctxSongId) return;
    if (action==='play')   playSong(ctxSongId);
    if (action==='like')   toggleLike(ctxSongId);
    if (action==='remove') removeSong(ctxSongId);
    if (action==='next')   toast('Adicionado à fila');
    closeCtxMenu();
  }

  // Menu de contexto da playlist
  function openPlaylistCtx(e) {
    e.stopPropagation();
    const menu=document.getElementById('plCtxMenu');
    menu.classList.add('open');
    const x=Math.min(e.clientX, window.innerWidth-240);
    const y=Math.min(e.clientY, window.innerHeight-260);
    menu.style.left=x+'px';
    menu.style.top =y+'px';
  }

  function closePlCtx() {
    document.getElementById('plCtxMenu').classList.remove('open');
  }

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href).catch(()=>{});
    toast('Link copiado!');
  }

  // Modal de edição
  function openEditModal() {
    document.getElementById('editNameInput').value = activePl.name;
    document.getElementById('editDescInput').value = activePl.desc||'';
    editColor = activePl.color;
    buildSwatches();
    updateEditPreview();
    document.getElementById('editModal').classList.add('open');
  }

  function closeEditModal() {
    document.getElementById('editModal').classList.remove('open');
  }

  function buildSwatches() {
    const wrap = document.getElementById('editSwatches');
    wrap.innerHTML = COLORS.map(c=>`
      <div class="swatch ${c.value===editColor?'sel':''}"
           style="background:${c.value}"
           title="${c.label}"
           onclick="pickColor('${c.value}')"></div>
    `).join('');
  }

  function pickColor(val) {
    editColor=val;
    document.querySelectorAll('#editSwatches .swatch').forEach(s=>{
      s.classList.toggle('sel', s.style.background===val || rgbMatch(s.style.background,val));
    });
    updateEditPreview();
  }

  function rgbMatch(rgb,hex) {
    return rgb===hex;
  }

  function updateEditPreview() {
    const prev=document.getElementById('editCoverPreview');
    prev.style.background=`linear-gradient(135deg,${editColor}55,${editColor}88)`;
    prev.innerHTML=`<img src="${activePl.cover}" alt="capa" style="width:100%;height:100%;object-fit:cover;border-radius:10px" onerror="this.style.display='none'" />`;
  }

  function saveEdit() {
    const name = document.getElementById('editNameInput').value.trim();
    const desc = document.getElementById('editDescInput').value.trim();
    if (!name) { document.getElementById('editNameInput').focus(); return; }
    activePl.name  = name;
    activePl.desc  = desc;
    activePl.color = editColor;
    const pl=PLAYLISTS.find(p=>p.id===activePl.id);
    if(pl){pl.name=name;pl.desc=desc;pl.color=editColor;}
    closeEditModal();
    toast('Playlist atualizada');
    renderHero();
    renderSidebar();
  }

  // Modal de adicionar músicas
  function openAddModal() {
    document.getElementById('addModalSearch').value='';
    renderAddModal();
    document.getElementById('addModal').classList.add('open');
  }

  function closeAddModal() {
    document.getElementById('addModal').classList.remove('open');
    renderPool();
  }

  function renderAddModal() {
    const q = document.getElementById('addModalSearch').value.toLowerCase();
    const pool = poolFor(activePl).filter(s=>
      !q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q)
    );
    const list = document.getElementById('addModalList');
    if (pool.length===0) {
      list.innerHTML=`<div style="padding:24px;color:var(--text-faint);font-size:13px;text-align:center">Nenhuma música encontrada.</div>`;
      return;
    }
    list.innerHTML=pool.map(s=>`
      <div class="add-modal-row">
        <img class="add-modal-art" src="${s.img}" alt="${esc(s.title)}" loading="lazy" />
        <div class="add-modal-info">
          <div class="add-modal-title">${esc(s.title)}</div>
          <div class="add-modal-meta">${esc(s.artist)} · ${esc(s.album)}</div>
        </div>
        <button class="add-modal-btn" onclick="addSongModal(${s.id},this)">+ Adicionar</button>
      </div>
    `).join('');
  }

  function addSongModal(id,btn) {
    if (activePl.songIds.includes(id)) return;
    const pl=PLAYLISTS.find(p=>p.id===activePl.id);
    if(pl) pl.songIds.push(id);
    activePl.songIds.push(id);
    songs.push(ALL_SONGS.find(s=>s.id===id));
    btn.textContent='✓ Adicionado';
    btn.classList.add('added');
    btn.disabled=true;
    toast('Música adicionada');
    renderHero();
    renderSongs();
  }

  // Modal de exclusão
  function openDeleteModal() {
    document.getElementById('delName').textContent=`"${activePl.name}"`;
    document.getElementById('deleteModal').classList.add('open');
  }

  function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('open');
  }

  function confirmDelete() {
    closeDeleteModal();
    toast(`"${activePl.name}" excluída`);
    setTimeout(()=>window.location.href='biblioteca.html',800);
  }

  // Toast
  let toastTimer2;
  function toast(msg) {
    const t=document.getElementById('toast');
    document.getElementById('toastMsg').textContent=msg;
    t.classList.add('show');
    clearTimeout(toastTimer2);
    toastTimer2=setTimeout(()=>t.classList.remove('show'),2600);
  }

  // Scroll — barra superior
  document.getElementById('scrollArea').addEventListener('scroll',function(){
    const bar=document.getElementById('backBar');
    bar.classList.toggle('scrolled',this.scrollTop>160);
  });

  // Clique global — fechar menus
  document.addEventListener('click',()=>{ closeCtxMenu(); closePlCtx(); });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      closeCtxMenu(); closePlCtx();
      closeEditModal(); closeAddModal(); closeDeleteModal();
    }
  });
  document.getElementById('editModal').addEventListener('click',function(e){if(e.target===this)closeEditModal();});
  document.getElementById('addModal').addEventListener('click',function(e){if(e.target===this)closeAddModal();});
  document.getElementById('deleteModal').addEventListener('click',function(e){if(e.target===this)closeDeleteModal();});

  // Inicialização
  loadPlaylist(activePlId);