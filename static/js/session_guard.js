/**
 * session_guard.js — Controla timeout de inatividade e heartbeat de sessão.
 * Importar em todas as páginas autenticadas ANTES dos scripts de página.
 *
 * Comportamento:
 *  - Reseta o timer a cada interação (mouse, teclado, scroll, touch)
 *  - Reseta o timer enquanto áudio estiver tocando (chamar resetInactivity())
 *  - Após TIMEOUT_MS sem atividade → redireciona para /logout
 *  - A cada HEARTBEAT_MS de atividade → POST /api/session/heartbeat
 */

const TIMEOUT_MS   = 10000_000;  // 1 minuto de inatividade → logout
const HEARTBEAT_MS = 30_000;  // heartbeat a cada 30s

let _inactivityTimer = null;
let _heartbeatTimer  = null;
let _musicPlaying    = false;

function resetInactivity() {
  clearTimeout(_inactivityTimer);
  _inactivityTimer = setTimeout(_doLogout, TIMEOUT_MS);
}

function setMusicPlaying(isPlaying) {
  _musicPlaying = isPlaying;
  if (isPlaying) resetInactivity();
}

function _doLogout() {
  if (_musicPlaying) {
    // se música tocando, não deslogar — reagendar
    resetInactivity();
    return;
  }
  window.location.href = '/logout';
}

async function _sendHeartbeat() {
  try {
    const res = await fetch('/api/session/heartbeat', { method: 'POST' });
    if (res.status === 401) window.location.href = '/logout';
  } catch (_) { /* offline — ignorar */ }
}

// ── Inicia ─────────────────────────────────────────────────────────────────
(function init() {
  const EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'wheel'];
  EVENTS.forEach(evt => document.addEventListener(evt, resetInactivity, { passive: true }));

  // heartbeat periódico
  _heartbeatTimer = setInterval(_sendHeartbeat, HEARTBEAT_MS);

  // arrancar timer
  resetInactivity();
})();
