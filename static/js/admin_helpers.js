function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

async function fetchJson(path) {
  const res = await fetch(path);
  const json = await res.json();
  return json.data;
}

function openModal() {
  document.getElementById('formModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('formModal').style.display = 'none';
}

window.addEventListener('click', (e) => {
  const modal = document.getElementById('formModal');
  if (e.target === modal) closeModal();
});