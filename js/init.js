// ── Initialisation ────────────────────────────────────────────────────────────
// Single entry point for setting up and re-rendering the app.
// Called on first load (main.js) and after data import (export.js).

function init() {
  refresh();
}

function refresh() {
  currentKey = monthKey(monthOffset);
  const w = getOrCreate(currentKey);
  normalizeOrders(w);
  document.getElementById('wk-lbl').textContent = getMonthLabel(monthOffset);
  _syncTodayBtn();
  ['done', 'cancelled'].forEach(sec => {
    const body = document.getElementById('body-' + sec);
    const tog = document.getElementById('tog-' + sec);
    if (body) body.style.display = secOpen[sec] ? 'block' : 'none';
    if (tog) tog.innerHTML = secOpen[sec] ? '&#9660;' : '&#9654;';
  });
  checkCarry();
  render();
}
