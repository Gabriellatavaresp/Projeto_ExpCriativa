/**
 * aurora_swal.js — SweetAlert2 com tema Aurora (dark + teal)
 * Importar APÓS sweetalert2.min.js em todos os templates.
 */

const AuroraSwal = Swal.mixin({
  background: '#12121e',
  color: '#e8e8f0',
  confirmButtonColor: '#6b9997',
  cancelButtonColor: '#2a2a3e',
  customClass: {
    popup:          'aurora-swal-popup',
    title:          'aurora-swal-title',
    confirmButton:  'aurora-swal-confirm',
    cancelButton:   'aurora-swal-cancel',
    icon:           'aurora-swal-icon',
  },
  buttonsStyling: false,
});

/* Erro */
function swalError(msg) {
  return AuroraSwal.fire({
    icon: 'error',
    title: 'Ops!',
    text: msg,
    confirmButtonText: 'OK',
  });
}

/* Sucesso */
function swalSuccess(msg, title = 'Pronto!') {
  return AuroraSwal.fire({
    icon: 'success',
    title,
    text: msg,
    confirmButtonText: 'OK',
    timer: 2500,
    timerProgressBar: true,
  });
}

/* Aviso */
function swalWarning(msg) {
  return AuroraSwal.fire({
    icon: 'warning',
    title: 'Atenção',
    text: msg,
    confirmButtonText: 'OK',
  });
}

/* Confirmação destrutiva (substitui confirm()) — retorna true/false */
async function swalConfirmDelete(name = 'este item') {
  const result = await AuroraSwal.fire({
    icon: 'warning',
    title: 'Excluir?',
    html: `Você está prestes a excluir <strong>${name}</strong>.<br>Esta ação não pode ser desfeita.`,
    showCancelButton: true,
    confirmButtonText: '🗑 Sim, excluir',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
  });
  return result.isConfirmed;
}

/* Estilos injetados dinamicamente */
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .aurora-swal-popup {
      border-radius: 18px !important;
      border: 1px solid rgba(107,153,151,0.25) !important;
      backdrop-filter: blur(20px) !important;
      box-shadow: 0 24px 64px rgba(0,0,0,0.6) !important;
      font-family: 'DM Sans', sans-serif !important;
    }
    .aurora-swal-title {
      font-family: 'Syne', sans-serif !important;
      font-size: 1.3rem !important;
      color: #e8e8f0 !important;
    }
    .aurora-swal-confirm {
      background: linear-gradient(135deg, #6b9997, #4e7f82) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 10px !important;
      padding: 10px 24px !important;
      font-weight: 600 !important;
      font-family: 'DM Sans', sans-serif !important;
      cursor: pointer !important;
      transition: opacity .2s !important;
    }
    .aurora-swal-confirm:hover { opacity: .88 !important; }
    .aurora-swal-cancel {
      background: #1e1e2e !important;
      color: #aaa !important;
      border: 1px solid #333 !important;
      border-radius: 10px !important;
      padding: 10px 24px !important;
      font-weight: 500 !important;
      font-family: 'DM Sans', sans-serif !important;
      cursor: pointer !important;
      transition: background .2s !important;
    }
    .aurora-swal-cancel:hover { background: #2a2a3e !important; }
    .swal2-timer-progress-bar { background: #6b9997 !important; }
    .swal2-icon.swal2-error { border-color: #f87171 !important; color: #f87171 !important; }
    .swal2-icon.swal2-success { border-color: #6b9997 !important; }
    .swal2-icon.swal2-success [class^='swal2-success-line'] { background: #6b9997 !important; }
    .swal2-icon.swal2-success .swal2-success-ring { border-color: #6b999740 !important; }
    .swal2-icon.swal2-warning { border-color: #fbbf24 !important; color: #fbbf24 !important; }
  `;
  document.head.appendChild(style);
})();
