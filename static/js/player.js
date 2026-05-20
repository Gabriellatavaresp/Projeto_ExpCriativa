/**
 * player.js — Player global Aurora
 * Injeta o player bar em qualquer página autenticada.
 * Expõe:  window.playTrack(m)           — toca uma faixa
 *         window.setPlayerQueue(arr, i)  — define fila + índice inicial
 */
(function () {
  'use strict';

  // ── CSS ────────────────────────────────────────────────────────────────────
  const CSS = `
    :root { --player-h: 90px; }

    /* padding-bottom para que o conteúdo não fique atrás do player fixo */
    .scroll-area,
    .main {
      padding-bottom: calc(var(--player-h) + 20px) !important;
    }

    /* ── player bar ── */
    .aurora-player-bar {
      position: fixed;
      bottom: 0;
      left: var(--sidebar-w, 0px);
      right: 0;
      height: var(--player-h);
      padding: 0 24px;
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      align-items: center;
      gap: 16px;
      background: rgba(7, 14, 30, 0.95);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-top: 1px solid rgba(37,99,235,0.15);
      z-index: 50;
      font-family: 'DM Sans', system-ui, sans-serif;
    }

    .aurora-player-bar * { box-sizing: border-box; margin: 0; padding: 0; }
    .aurora-player-bar button { background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }

    /* left */
    .ap-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .ap-thumb {
      width: 52px; height: 52px; border-radius: 8px; flex-shrink: 0;
      background: linear-gradient(135deg, #0f3460, #10B981);
    }
    .ap-info { min-width: 0; flex: 1; }
    .ap-title {
      display: block; font-size: .88rem; font-weight: 600;
      color: #F0F6FF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ap-artist { display: block; font-size: .75rem; color: #546380; margin-top: 2px; }
    .ap-heart {
      color: #546380; transition: color .2s, transform .2s; flex-shrink: 0; padding: 4px;
    }
    .ap-heart:hover { color: #F0F6FF; }
    .ap-heart.liked { color: #10B981; transform: scale(1.15); }
    .ap-heart.liked svg path { fill: #10B981; }

    /* center */
    .ap-center { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .ap-controls { display: flex; align-items: center; gap: 16px; }
    .ap-ctrl {
      width: 32px; height: 32px; border-radius: 50%;
      color: #94A3C0; transition: color .2s, transform .2s;
    }
    .ap-ctrl:hover { color: #F0F6FF; transform: scale(1.1); }
    .ap-ctrl.active { color: #10B981; }
    .aurora-player-bar .ap-play {
      width: 36px; height: 36px; border-radius: 50%;
      background: #003c92 !important; color: #fff;
      transition: transform .2s, box-shadow .2s;
    }
    .aurora-player-bar .ap-play:hover { transform: scale(1.08); box-shadow: 0 0 20px rgba(255,255,255,.25); }

    .ap-progress-row { display: flex; align-items: center; gap: 10px; width: 100%; max-width: 520px; }
    .ap-time { font-size: .7rem; color: #546380; min-width: 32px; text-align: center; }
    .ap-progress-bar {
      flex: 1; height: 4px; border-radius: 100px;
      background: rgba(255,255,255,.1); cursor: pointer; overflow: hidden; position: relative;
      transition: height .15s;
    }
    .ap-progress-bar:hover { height: 6px; }
    .ap-progress-fill {
      height: 100%; border-radius: inherit;
      background: linear-gradient(90deg, #10B981, #2563EB);
      transition: width .3s linear; pointer-events: none;
    }

    /* right */
    .ap-right { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
    .ap-vol-wrap { display: flex; align-items: center; gap: 8px; }
    .ap-vol-bar {
      width: 90px; height: 4px; border-radius: 100px;
      background: rgba(255,255,255,.1); cursor: pointer; overflow: hidden;
    }
    .ap-vol-fill { height: 100%; border-radius: inherit; background: #94A3C0; width: 70%; }

    /* responsive */
    @media (max-width: 960px) {
      .aurora-player-bar { left: 0; }
    }
    @media (max-width: 640px) {
      .aurora-player-bar {
        height: auto; padding: 10px 16px; grid-template-columns: 1fr;
        grid-template-rows: auto auto; gap: 8px;
      }
      .ap-right { display: none; }
      .ap-left { width: 100%; }
      .ap-center { width: 100%; }
    }
  `;

  // ── HTML ───────────────────────────────────────────────────────────────────
  const HTML = `
  <div class="aurora-player-bar" id="auroraPlayerBar">

    <div class="ap-left">
      <div class="ap-thumb" id="apThumb"></div>
      <div class="ap-info">
        <strong class="ap-title" id="apTitle">—</strong>
        <span class="ap-artist" id="apArtist">Selecione uma música</span>
      </div>
      <button class="ap-heart" id="apHeart" title="Curtir">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>

    <div class="ap-center">
      <div class="ap-controls">
        <button class="ap-ctrl" id="apShuffle" title="Aleatório">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
          </svg>
        </button>
        <button class="ap-ctrl" id="apPrev" title="Anterior">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        </button>
        <button class="ap-play" id="apPlay" title="Play/Pause">
          <svg id="apPlayIcon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <button class="ap-ctrl" id="apNext" title="Próxima">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg>
        </button>
        <button class="ap-ctrl" id="apRepeat" title="Repetir">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
        </button>
      </div>
      <div class="ap-progress-row">
        <span class="ap-time" id="apCurTime">0:00</span>
        <div class="ap-progress-bar" id="apProgressBar">
          <div class="ap-progress-fill" id="apProgressFill" style="width:0%"></div>
        </div>
        <span class="ap-time" id="apTotalTime">0:00</span>
      </div>
    </div>

    <div class="ap-right">
      <div class="ap-vol-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity=".6"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        <div class="ap-vol-bar" id="apVolBar">
          <div class="ap-vol-fill" id="apVolFill" style="width:70%"></div>
        </div>
      </div>
    </div>

  </div>`;

  // ── State ──────────────────────────────────────────────────────────────────
  let _tracks   = [];
  let _cur      = 0;
  let _playing  = false;
  let _shuffle  = false;
  let _repeat   = false;
  let _vol      = 0.7;
  let _audio    = null;
  let _likedIds = new Set();
  let _ready    = false;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function _fmt(s) {
    s = Math.max(0, Math.floor(s));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  /** Converte "MM:SS" ou "HH:MM:SS" em segundos */
  function _parseDur(str) {
    if (!str) return 0;
    const parts = str.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  }

  function _el(id) { return document.getElementById(id); }

  function _setPlayIcon(playing) {
    _el('apPlayIcon').innerHTML = playing
      ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
      : '<path d="M8 5v14l11-7z"/>';
  }

  function _updateHeart(liked) {
    const btn = _el('apHeart');
    if (!btn) return;
    btn.classList.toggle('liked', !!liked);
    const path = btn.querySelector('svg path');
    if (path) path.setAttribute('fill', liked ? '#10B981' : 'none');
  }

  function _loadLikedState(idMusica) {
    _updateHeart(_likedIds.has(idMusica));
  }

  // ── Core player ────────────────────────────────────────────────────────────
  function _setTrack(i) {
    _cur = i;
    const t = _tracks[_cur];
    if (!t) return;

    _el('apTitle').textContent  = t.titulo || t.title || '—';
    _el('apArtist').textContent = t.nome_artista || t.artist || '';
    _el('apTotalTime').textContent = t.duracao || t.dur || '0:00';
    _el('apProgressFill').style.width = '0%';
    _el('apCurTime').textContent = '0:00';
    _loadLikedState(t.id_musica || t.id);

    if (_audio) { _audio.pause(); _audio = null; }

    const url = t.preview_url;
    if (url) {
      _audio = new Audio(url);
      _audio.preload = 'auto';
      _audio.volume = _vol;
      if (_playing) _audio.play().catch(() => {});

      // Usa a duração real da música (do banco) como referência para a barra,
      // não o _audio.duration (que é o preview de 30s do Deezer).
      const trackDurSec = _parseDur(t.duracao || t.dur) || _audio.duration || 30;

      _audio.ontimeupdate = () => {
        const pct = (_audio.currentTime / trackDurSec) * 100;
        _el('apProgressFill').style.width = Math.min(pct, 100) + '%';
        _el('apCurTime').textContent = _fmt(_audio.currentTime);
      };

      _audio.onended = () => {
        if (_repeat) {
          _audio.currentTime = 0;
          _audio.play().catch(() => {});
        } else {
          _playNext();
        }
      };
    }

    _setPlayIcon(_playing);
    if (typeof setMusicPlaying === 'function') setMusicPlaying(_playing);

    // Registra no histórico de reprodução
    if (_playing && (t.id_musica || t.id) && window._userId) {
      fetch('/api/historico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: window._userId, id_musica: t.id_musica || t.id }),
      }).catch(() => {});
    }

    // notify page-level callbacks
    if (typeof window.onPlayerTrackChange === 'function') {
      window.onPlayerTrackChange(t, _cur);
    }
  }

  function _playNext() {
    if (!_tracks.length) return;
    let next;
    if (_shuffle) {
      next = Math.floor(Math.random() * _tracks.length);
    } else {
      next = (_cur + 1) % _tracks.length;
    }
    _playing = true;
    _setTrack(next);
  }

  function _playPrev() {
    if (!_tracks.length) return;
    const prev = (_cur - 1 + _tracks.length) % _tracks.length;
    _playing = true;
    _setTrack(prev);
  }

  function _togglePlay() {
    _playing = !_playing;
    _setPlayIcon(_playing);
    if (_audio) {
      _playing ? _audio.play().catch(() => {}) : _audio.pause();
    }
    if (typeof setMusicPlaying === 'function') setMusicPlaying(_playing);
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  /**
   * Reproduz uma faixa imediatamente.
   * @param {Object} m  track object — deve ter: { id_musica, titulo, nome_artista, duracao, preview_url }
   */
  window.playTrack = function (m) {
    if (!_ready) return;
    // se já está na fila, só muda o índice
    const existing = _tracks.findIndex(t => (t.id_musica || t.id) === (m.id_musica || m.id));
    if (existing === -1) _tracks.push(m);
    const idx = existing === -1 ? _tracks.length - 1 : existing;
    _playing = true;
    _setTrack(idx);
  };

  /**
   * Define a fila completa e começa do índice fornecido.
   * @param {Array}  arr    lista de tracks
   * @param {number} start  índice inicial (default 0)
   */
  window.setPlayerQueue = function (arr, start) {
    _tracks = arr.slice();
    _playing = true;
    _setTrack(start || 0);
  };

  /**
   * Informa ao player quais IDs o usuário já curtiu (para o ícone de coração).
   * @param {Array|Set} ids  lista de id_musica
   */
  window.setPlayerLikedIds = function (ids) {
    _likedIds = ids instanceof Set ? ids : new Set(ids);
    const t = _tracks[_cur];
    if (t) _loadLikedState(t.id_musica || t.id);
  };

  // ── Bind events ────────────────────────────────────────────────────────────
  function _bindEvents() {
    // play / pause
    _el('apPlay').onclick = _togglePlay;

    // next / prev
    _el('apNext').onclick = () => { _playing = true; _playNext(); };
    _el('apPrev').onclick = () => { _playing = true; _playPrev(); };

    // shuffle
    _el('apShuffle').onclick = function () {
      _shuffle = !_shuffle;
      this.classList.toggle('active', _shuffle);
    };

    // repeat
    _el('apRepeat').onclick = function () {
      _repeat = !_repeat;
      this.classList.toggle('active', _repeat);
    };

    // progress bar — click to seek
    _el('apProgressBar').onclick = function (e) {
      if (!_audio) return;
      const t = _tracks[_cur];
      const seekDur = _parseDur(t && (t.duracao || t.dur)) || _audio.duration || 30;
      const rect = this.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      // Limita ao tempo real do áudio (preview pode ser menor que a duração real)
      _audio.currentTime = Math.min(pct * seekDur, _audio.duration);
    };

    // volume bar — click to set
    _el('apVolBar').onclick = function (e) {
      const rect = this.getBoundingClientRect();
      _vol = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      _el('apVolFill').style.width = (_vol * 100) + '%';
      if (_audio) _audio.volume = _vol;
    };

    // heart / curtir
    _el('apHeart').onclick = async function () {
      const t = _tracks[_cur];
      if (!t) return;
      const id = t.id_musica || t.id;
      const userId = window._userId;
      if (!userId) return;

      const wasLiked = _likedIds.has(id);
      if (wasLiked) {
        _likedIds.delete(id);
        await fetch(`/api/curtidas/${userId}/${id}`, { method: 'DELETE' }).catch(() => {});
      } else {
        _likedIds.add(id);
        await fetch('/api/curtidas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_usuario: userId, id_musica: id }),
        }).catch(() => {});
      }
      _updateHeart(!wasLiked);

      // notificar a página (ex: curtidas.js pode atualizar a tabela)
      if (typeof window.onPlayerLikeChange === 'function') {
        window.onPlayerLikeChange(id, !wasLiked);
      }
    };
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function _init() {
    // inject CSS
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // inject HTML
    document.body.insertAdjacentHTML('beforeend', HTML);

    _bindEvents();
    _ready = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();
