/**
 * playlist.js — Playlist real do banco + preview Deezer
 */

const COLORS = [
  { label:'Mint',   value:'#6b9997' }, { label:'Sage',   value:'#8a9e7a' },
  { label:'Teal',   value:'#4e7f82' }, { label:'Steel',  value:'#5a7a8a' },
  { label:'Brown',  value:'#7a6050' }, { label:'Slate',  value:'#4a5a6a' },
  { label:'Olive',  value:'#6a7a4a' }, { label:'Plum',   value:'#7a5070' },
];

let activePlId  = null;
let activePl    = null;
let songs       = [];
let allSongs    = [];   // todas as músicas do banco (para o pool)
let myPlaylists = [];   // sidebar
let playingId   = null;
let npPlaying   = false;
let likedIds    = new Set();
let currentUserId = null;
let shuffleOn   = false;
let songFilter  = '';
let poolFilter  = '';
let sortCol     = null;
let sortDir     = 'asc';
let ctxSongId   = null;
let editColor   = '';
let progressPct = 0;
let progressTimer = null;
let audioEl     = null;   // HTMLAudioElement para preview Deezer
let previewMap  = {};     // id_musica → preview_url

function getUrlParam() {
  const p = new URLSearchParams(window.location.search).get('id');
  return p ? parseInt(p) : null;
}

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmt(secs) {
  const m=Math.floor(secs/60), s=secs%60;
  return `${m}:${String(s).padStart(2,'0')}`;
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('pt-BR',{day:'numeric',month:'short',year:'numeric'});
}
function totalDur(arr) {
  const t=arr.reduce((a,s)=>a+(s.dur||0),0);
  const h=Math.floor(t/3600), m=Math.floor((t%3600)/60);
  return h>0?`${h}h ${m}min`:`${m} min`;
}

// ── Carregar dados ──────────────────────────────────────────────────────────
async function init() {
  activePlId = getUrlParam();

  // usuário logado
  const rMe = await fetch('/api/me');
  if (rMe.status===401) { window.location.href='/login'; return; }
  const jMe = await rMe.json();
  currentUserId = jMe.data.id_usuario;

  // curtidas do usuário
  const rLikes = await fetch(`/api/curtidas/${currentUserId}`);
  const jLikes = await rLikes.json();
  likedIds = new Set((jLikes.data||[]).map(c => c.id_musica));

  // playlists do usuário (sidebar)
  const r1 = await fetch('/api/playlists/minhas');
  if (r1.status===401) { window.location.href='/login'; return; }
  const j1 = await r1.json();
  myPlaylists = j1.data || [];
  if (!activePlId && myPlaylists.length>0) activePlId = myPlaylists[0].id_playlist;

  // todas as músicas (pool para adicionar)
  const r2 = await fetch('/api/musicas');
  const j2 = await r2.json();
  allSongs = (j2.data||[]).map(m=>({
    id: m.id_musica, title: m.titulo, artist: m.nome_artista,
    album: m.nome_album, dur: parseDur(m.duracao), img: null,
  }));

  if (activePlId) await loadPlaylist(activePlId);
  else renderAll();
}

function parseDur(str) {
  if (!str) return 0;
  const parts = str.split(':').map(Number);
  if (parts.length===3) return parts[0]*3600+parts[1]*60+parts[2];
  if (parts.length===2) return parts[0]*60+parts[1];
  return 0;
}

async function loadPlaylist(id) {
  activePlId = id;
  history.replaceState(null,'',`/playlist?id=${id}`);
  const r = await fetch(`/api/playlists/${id}`);
  const j = await r.json();
  const pl = j.data;
  activePl = {
    id: pl.id_playlist, name: pl.nome, desc: pl.descricao||'',
    color: pl.cor||'#6b9997', publica: pl.publica,
  };
  songs = (pl.musicas||[]).map(m=>({
    id: m.id_musica, title: m.titulo, artist: m.nome_artista,
    album: m.nome_album, dur: parseDur(m.duracao),
    added: m.data_adicionada||'', img: null,
  }));
  songFilter=''; poolFilter='';
  const sfi = document.getElementById('songFilterInput');
  const rsi = document.getElementById('recSearchInput');
  const ami = document.getElementById('addModalSearch');
  if(sfi) sfi.value='';
  if(rsi) rsi.value='';
  if(ami) ami.value='';
  // buscar previews Deezer para as músicas da playlist
  fetchPreviews(songs);
  renderAll();
}

async function fetchPreviews(songList) {
  for (const s of songList) {
    if (previewMap[s.id]) continue;
    try {
      const q = encodeURIComponent(`${s.title} ${s.artist}`);
      const r = await fetch(`/api/deezer/search?q=${q}&limit=1`);
      const j = await r.json();
      if (j.data && j.data[0] && j.data[0].preview_url) {
        previewMap[s.id] = j.data[0].preview_url;
      }
    } catch(_) {}
  }
}

// ── Audio preview ───────────────────────────────────────────────────────────
function playAudioPreview(songId) {
  const url = previewMap[songId];
  if (!url) { toast('Preview não disponível para esta música'); return; }
  if (audioEl) { audioEl.pause(); audioEl = null; }
  audioEl = new Audio(url);
  audioEl.volume = 0.7;
  audioEl.play().catch(()=>{});
  audioEl.addEventListener('ended', ()=>{ npPlaying=false; setMusicPlaying(false); renderNowPlaying(); renderSongs(); });
  setMusicPlaying(true);
}

function stopAudio() {
  if (audioEl) { audioEl.pause(); audioEl=null; }
  setMusicPlaying(false);
}

// ── Render ──────────────────────────────────────────────────────────────────
function renderAll() { renderSidebar(); renderHero(); renderSongs(); renderPool(); renderNowPlaying(); }

function renderSidebar() {
  const list = document.getElementById('sidebarList');
  list.innerHTML = myPlaylists.map(pl=>`
    <button class="pl-item ${pl.id_playlist===activePlId?'active':''}" onclick="loadPlaylist(${pl.id_playlist})">
      <div class="pl-thumb" style="background:linear-gradient(135deg,${pl.cor||'#6b9997'}88,${pl.cor||'#6b9997'}cc)"></div>
      <div class="pl-item-info">
        <div class="pl-item-name">${esc(pl.nome)}</div>
        <div class="pl-item-meta">Playlist · ${pl.total_musicas||0} faixas</div>
      </div>
      <div class="mini-bars"><div class="mbar"></div><div class="mbar"></div><div class="mbar"></div></div>
    </button>
  `).join('');
}

function renderHero() {
  if (!activePl) return;
  const pl=activePl;
  document.title=`Aurora — ${pl.name}`;
  document.getElementById('barTitle').textContent=pl.name;
  document.getElementById('heroType').textContent='Playlist';
  document.getElementById('heroName').textContent=pl.name;
  document.getElementById('heroDesc').textContent=pl.desc||'Clique para adicionar uma descrição…';
  document.getElementById('heroDesc').style.color=pl.desc?'':'var(--text-faint)';
  document.getElementById('heroCover').style.background=`linear-gradient(135deg,${pl.color}99,${pl.color}cc)`;
  document.getElementById('heroCover').src='';
  document.getElementById('heroBg').style.background=`linear-gradient(to bottom,${pl.color}88 0%,var(--bg) 100%)`;
  document.getElementById('heroMeta').innerHTML=`<strong>Você</strong><span class="dot">·</span>${songs.length} músicas<span class="dot">·</span>${totalDur(songs)}`;
  document.getElementById('shuffleBtn').classList.toggle('active',shuffleOn);
}

function renderSongs() {
  let list=[...songs];
  if (songFilter) {
    const q=songFilter.toLowerCase();
    list=list.filter(s=>s.title.toLowerCase().includes(q)||s.artist.toLowerCase().includes(q)||s.album.toLowerCase().includes(q));
  }
  if (sortCol) {
    list.sort((a,b)=>{
      let va,vb;
      if(sortCol==='title'){va=a.title;vb=b.title;}
      else if(sortCol==='album'){va=a.album;vb=b.album;}
      else if(sortCol==='duration'){va=a.dur;vb=b.dur;}
      else{va=songs.indexOf(a);vb=songs.indexOf(b);}
      if(typeof va==='number') return sortDir==='asc'?va-vb:vb-va;
      return sortDir==='asc'?va.localeCompare(vb):vb.localeCompare(va);
    });
  }
  const tbody=document.getElementById('songList');
  const noSongs=document.getElementById('noSongs');
  if(list.length===0){tbody.innerHTML='';noSongs.style.display='block';return;}
  noSongs.style.display='none';
  tbody.innerHTML=list.map((s,i)=>{
    const isPlaying=s.id===playingId;
    const liked=likedIds.has(s.id);
    const hasPreview=!!previewMap[s.id];
    return `
      <tr class="song-row ${isPlaying?'playing':''}" data-id="${s.id}">
        <td class="td-drag"><div class="drag-handle"><svg viewBox="0 0 24 24"><line x1="9" y1="5" x2="9" y2="19"/><line x1="15" y1="5" x2="15" y2="19"/></svg></div></td>
        <td class="td-num">
          <span class="track-num">${i+1}</span>
          <div class="play-icon" onclick="playSong(${s.id})" title="${hasPreview?'Preview 30s':'Sem preview'}">
            <svg viewBox="0 0 24 24">${isPlaying&&npPlaying
              ?'<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
              :'<polygon points="5 3 19 12 5 21 5 3"/>'}</svg>
          </div>
        </td>
        <td class="td-title">
          <div class="song-info">
            <div class="song-art" style="background:linear-gradient(135deg,#3a3a5a,#4a4a7a);display:flex;align-items:center;justify-content:center">
              <svg viewBox="0 0 24 24" style="width:16px;opacity:.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/></svg>
            </div>
            <div class="song-text">
              <div class="song-name ${isPlaying?'playing-text':''}">${esc(s.title)}</div>
              <div class="song-artist">${esc(s.artist)}</div>
            </div>
          </div>
        </td>
        <td class="td-album c-album">${esc(s.album)}</td>
        <td class="td-date c-date">${s.added?fmtDate(s.added):'—'}</td>
        <td class="td-like"><button class="like-btn ${liked?'liked':''}" onclick="toggleLike(${s.id})"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button></td>
        <td class="td-dur">${fmt(s.dur)}</td>
        <td class="td-more"><button class="more-btn" onclick="openCtxMenu(event,${s.id})"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button></td>
      </tr>`;
  }).join('');
  ['num','title','album','date','duration'].forEach(c=>{
    const el=document.getElementById(`sa-${c}`);
    if(el) el.textContent=sortCol===c?(sortDir==='asc'?'↑':'↓'):'';
  });
}

function renderPool() {
  const inPl=new Set(songs.map(s=>s.id));
  const pool=allSongs.filter(s=>!inPl.has(s.id)&&(!poolFilter||s.title.toLowerCase().includes(poolFilter.toLowerCase())||s.artist.toLowerCase().includes(poolFilter.toLowerCase())));
  const list=document.getElementById('poolList');
  if(!pool.length){list.innerHTML=`<div style="padding:20px;color:var(--text-faint);font-size:13px;text-align:center">Nenhuma música para adicionar.</div>`;return;}
  list.innerHTML=pool.map(s=>`
    <div class="add-pool-row">
      <div class="pool-art" style="background:linear-gradient(135deg,#3a3a5a,#4a4a7a)"></div>
      <div class="pool-info"><div class="pool-title">${esc(s.title)}</div><div class="pool-meta">${esc(s.artist)} · ${esc(s.album)}</div></div>
      <button class="pool-add-btn" onclick="addSongFromPool(${s.id},this)">+ Adicionar</button>
    </div>`).join('');
}

function renderNowPlaying() {
  const song=songs.find(s=>s.id===playingId)||allSongs.find(s=>s.id===playingId);
  const title=document.getElementById('npTitle');
  const artist=document.getElementById('npArtist');
  const total=document.getElementById('npTotal');
  const heart=document.getElementById('npHeart');
  const pbtn=document.getElementById('npPlayBtn');
  if(song){
    title.textContent=song.title;
    artist.textContent=song.artist;
    total.textContent=fmt(song.dur);
    heart.classList.toggle('liked',likedIds.has(song.id));
  } else {
    title.textContent='—'; artist.textContent='—'; total.textContent='0:00';
    heart.classList.remove('liked');
  }
  const isPlay=npPlaying&&!!song;
  pbtn.innerHTML=isPlay
    ?`<svg viewBox="0 0 24 24" style="margin-left:0"><rect x="6" y="4" width="4" height="16" style="fill:#121212"/><rect x="14" y="4" width="4" height="16" style="fill:#121212"/></svg>`
    :`<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
}

// ── Reprodução ───────────────────────────────────────────────────────────────
function playSong(id) {
  if (playingId===id) {
    npPlaying=!npPlaying;
    if(npPlaying) playAudioPreview(id); else stopAudio();
  } else {
    stopAudio();
    playingId=id; npPlaying=true;
    playAudioPreview(id);
  }
  renderSongs(); renderNowPlaying();
}

function playPlaylist() {
  if(!songs.length) return;
  const first=shuffleOn?songs[Math.floor(Math.random()*songs.length)]:songs[0];
  playSong(first.id);
}

function toggleNpPlay() {
  if(!playingId&&songs.length>0){playPlaylist();return;}
  npPlaying=!npPlaying;
  if(npPlaying&&playingId) playAudioPreview(playingId); else stopAudio();
  renderSongs(); renderNowPlaying();
}

function prevSong() {
  if(!playingId) return;
  const idx=songs.findIndex(s=>s.id===playingId);
  playSong(idx>0?songs[idx-1].id:songs[songs.length-1].id);
}

function nextSong() {
  if(!playingId){playPlaylist();return;}
  const idx=songs.findIndex(s=>s.id===playingId);
  if(shuffleOn) playSong(songs[Math.floor(Math.random()*songs.length)].id);
  else if(idx<songs.length-1) playSong(songs[idx+1].id);
  else playSong(songs[0].id);
}

function toggleShuffle() {
  shuffleOn=!shuffleOn;
  document.getElementById('shuffleBtn').classList.toggle('active',shuffleOn);
  document.getElementById('npShuffle').classList.toggle('active',shuffleOn);
  toast(shuffleOn?'Shuffle ativado':'Shuffle desativado');
}

// ── Likes ────────────────────────────────────────────────────────────────────
async function toggleLike(id) {
  const had = likedIds.has(id);
  if (had) {
    likedIds.delete(id);
    await fetch(`/api/curtidas/${currentUserId}/${id}`, { method: 'DELETE' });
  } else {
    likedIds.add(id);
    await fetch('/api/curtidas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario: currentUserId, id_musica: id }),
    });
  }
  toast(had ? 'Removido das curtidas' : 'Adicionado às curtidas');
  renderSongs(); renderNowPlaying();
}
function toggleLikeCurrentSong() { if(playingId) toggleLike(playingId); }
function toggleLikePlaylist() {
  toast('Playlist salva na biblioteca');
  document.getElementById('likePlaylistBtn').classList.toggle('liked');
}

// ── Filtro/Ordenação ─────────────────────────────────────────────────────────
function sortBy(col) {
  if(sortCol===col) sortDir=sortDir==='asc'?'desc':'asc';
  else{sortCol=col;sortDir='asc';}
  renderSongs();
}
function filterSongs() { songFilter=document.getElementById('songFilterInput').value; renderSongs(); }
function filterPool()  { poolFilter=document.getElementById('recSearchInput').value; renderPool(); }
function filterAddModal() { renderAddModal(); }

// ── Adicionar / Remover músicas ──────────────────────────────────────────────
async function addSongFromPool(id, btn) {
  if(songs.find(s=>s.id===id)) return;
  const res=await fetch(`/api/playlists/${activePlId}/musicas`,{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id_musica:id})
  });
  if(!res.ok){toast('Erro ao adicionar música');return;}
  const s=allSongs.find(s=>s.id===id);
  if(s) songs.push(s);
  btn.textContent='✓ Adicionado'; btn.classList.add('added'); btn.disabled=true;
  toast('Música adicionada à playlist');
  renderHero(); renderSongs();
  fetchPreviews([s]);
}

async function removeSong(id) {
  const res=await fetch(`/api/playlists/${activePlId}/musicas/${id}`,{method:'DELETE'});
  if(!res.ok){toast('Erro ao remover');return;}
  songs=songs.filter(s=>s.id!==id);
  if(playingId===id){playingId=null;npPlaying=false;stopAudio();}
  toast('Removido da playlist');
  renderHero(); renderSongs(); renderPool(); renderNowPlaying();
}

// ── Edição inline ─────────────────────────────────────────────────────────────
function startEditName() {
  const n=document.getElementById('heroName'),inp=document.getElementById('heroNameInput');
  inp.value=activePl.name; n.style.display='none'; inp.style.display='block'; inp.focus(); inp.select();
}
function finishEditName() {
  const n=document.getElementById('heroName'),inp=document.getElementById('heroNameInput');
  const val=inp.value.trim();
  if(val){activePl.name=val; savePlaylistMeta();}
  inp.style.display='none'; n.style.display=''; renderHero(); renderSidebar();
}
function nameKeydown(e){ if(e.key==='Enter'){e.preventDefault();document.getElementById('heroNameInput').blur();} if(e.key==='Escape'){document.getElementById('heroNameInput').value=activePl.name;document.getElementById('heroNameInput').blur();}}

function startEditDesc() {
  const d=document.getElementById('heroDesc'),inp=document.getElementById('heroDescInput');
  inp.value=activePl.desc||''; d.style.display='none'; inp.style.display='block'; inp.focus();
}
function finishEditDesc() {
  const d=document.getElementById('heroDesc'),inp=document.getElementById('heroDescInput');
  activePl.desc=inp.value.trim(); inp.style.display='none'; d.style.display=''; renderHero();
}
function descKeydown(e){ if(e.key==='Escape') document.getElementById('heroDescInput').blur(); }

async function savePlaylistMeta() {
  await fetch(`/api/playlists/${activePlId}`,{
    method:'PUT', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({nome:activePl.name, publica:activePl.publica||0, cor:activePl.color})
  });
}

// ── Modal de edição ────────────────────────────────────────────────────────
function openEditModal() {
  if(!activePl) return;
  document.getElementById('editNameInput').value=activePl.name;
  document.getElementById('editDescInput').value=activePl.desc||'';
  editColor=activePl.color;
  buildSwatches(); updateEditPreview();
  document.getElementById('editModal').classList.add('open');
}
function closeEditModal(){ document.getElementById('editModal').classList.remove('open'); }
function buildSwatches() {
  document.getElementById('editSwatches').innerHTML=COLORS.map(c=>`
    <div class="swatch ${c.value===editColor?'sel':''}" style="background:${c.value}" title="${c.label}" onclick="pickColor('${c.value}')"></div>`).join('');
}
function pickColor(val){ editColor=val; buildSwatches(); updateEditPreview(); }
function updateEditPreview() {
  const prev=document.getElementById('editCoverPreview');
  prev.style.background=`linear-gradient(135deg,${editColor}55,${editColor}88)`;
  prev.innerHTML=`<div class="no-img" style="background:${editColor}33"><svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/></svg></div>`;
}
async function saveEdit() {
  const name=document.getElementById('editNameInput').value.trim();
  if(!name){document.getElementById('editNameInput').focus();return;}
  activePl.name=name; activePl.desc=document.getElementById('editDescInput').value.trim(); activePl.color=editColor;
  await savePlaylistMeta();
  closeEditModal(); toast('Playlist atualizada'); renderHero(); renderSidebar();
}

// ── Modal de adicionar músicas ──────────────────────────────────────────────
function openAddModal(){ document.getElementById('addModalSearch').value=''; renderAddModal(); document.getElementById('addModal').classList.add('open'); }
function closeAddModal(){ document.getElementById('addModal').classList.remove('open'); renderPool(); }
function renderAddModal() {
  const q=document.getElementById('addModalSearch').value.toLowerCase();
  const inPl=new Set(songs.map(s=>s.id));
  const pool=allSongs.filter(s=>!inPl.has(s.id)&&(!q||s.title.toLowerCase().includes(q)||s.artist.toLowerCase().includes(q)||s.album.toLowerCase().includes(q)));
  const list=document.getElementById('addModalList');
  if(!pool.length){list.innerHTML=`<div style="padding:24px;color:var(--text-faint);font-size:13px;text-align:center">Nenhuma música encontrada.</div>`;return;}
  list.innerHTML=pool.map(s=>`
    <div class="add-modal-row">
      <div class="add-modal-art" style="background:linear-gradient(135deg,#3a3a5a,#4a4a7a)"></div>
      <div class="add-modal-info"><div class="add-modal-title">${esc(s.title)}</div><div class="add-modal-meta">${esc(s.artist)} · ${esc(s.album)}</div></div>
      <button class="add-modal-btn" onclick="addSongModal(${s.id},this)">+ Adicionar</button>
    </div>`).join('');
}
async function addSongModal(id,btn) {
  await addSongFromPool(id,btn);
  renderAddModal();
}

// ── Modal exclusão ─────────────────────────────────────────────────────────
function openDeleteModal(){ document.getElementById('delName').textContent=`"${activePl?.name}"`; document.getElementById('deleteModal').classList.add('open'); }
function closeDeleteModal(){ document.getElementById('deleteModal').classList.remove('open'); }
async function confirmDelete() {
  closeDeleteModal();
  await fetch(`/api/playlists/${activePlId}`,{method:'DELETE'});
  toast(`"${activePl?.name}" excluída`);
  setTimeout(()=>window.location.href='/biblioteca',800);
}

// ── Menus de contexto ──────────────────────────────────────────────────────
function openCtxMenu(e,id){ e.stopPropagation(); ctxSongId=id; const m=document.getElementById('ctxMenu'); m.classList.add('open'); m.style.left=Math.min(e.clientX,window.innerWidth-230)+'px'; m.style.top=Math.min(e.clientY,window.innerHeight-200)+'px'; }
function closeCtxMenu(){ document.getElementById('ctxMenu').classList.remove('open'); ctxSongId=null; }
function ctxAction(a){ if(!ctxSongId)return; if(a==='play')playSong(ctxSongId); if(a==='like')toggleLike(ctxSongId); if(a==='remove')removeSong(ctxSongId); if(a==='next')toast('Adicionado à fila'); closeCtxMenu(); }
function openPlaylistCtx(e){ e.stopPropagation(); const m=document.getElementById('plCtxMenu'); m.classList.add('open'); m.style.left=Math.min(e.clientX,window.innerWidth-240)+'px'; m.style.top=Math.min(e.clientY,window.innerHeight-260)+'px'; }
function closePlCtx(){ document.getElementById('plCtxMenu').classList.remove('open'); }
function copyLink(){ navigator.clipboard?.writeText(window.location.href).catch(()=>{}); toast('Link copiado!'); }

// ── Toast ─────────────────────────────────────────────────────────────────
let toastTimer;
function toast(msg){ const t=document.getElementById('toast'); document.getElementById('toastMsg').textContent=msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2600); }

// ── Eventos globais ────────────────────────────────────────────────────────
document.getElementById('scrollArea').addEventListener('scroll',function(){ document.getElementById('backBar').classList.toggle('scrolled',this.scrollTop>160); });
document.addEventListener('click',()=>{ closeCtxMenu(); closePlCtx(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){closeCtxMenu();closePlCtx();closeEditModal();closeAddModal();closeDeleteModal();} });
document.getElementById('editModal').addEventListener('click',function(e){if(e.target===this)closeEditModal();});
document.getElementById('addModal').addEventListener('click',function(e){if(e.target===this)closeAddModal();});
document.getElementById('deleteModal').addEventListener('click',function(e){if(e.target===this)closeDeleteModal();});

// ── Init ──────────────────────────────────────────────────────────────────
init();