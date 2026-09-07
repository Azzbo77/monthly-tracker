// ── Initialisation ────────────────────────────────────────────────────────────
// Single entry point for setting up and re-rendering the app.
// Called on first load (main.js) and after data import (export.js).

function init() {
  refresh();
}

function refresh() {
  currentKey = monthKey(monthOffset);
  const w = getOrCreate(currentKey);
  if (normalizeOrders(w)) save();
  // Reset sort badges when switching months — sort state is per-session, not per-month
  COLS.forEach(col => { colSorted[col] = false; });
  document.getElementById('wk-lbl').textContent = getMonthLabel(monthOffset);
  _syncTodayBtn();
  ['done', 'cancelled'].forEach(sec => {
    const body = document.getElementById('body-' + sec);
    const tog = document.getElementById('tog-' + sec);
    if (body) body.style.display = secOpen[sec] ? 'block' : 'none';
    if (tog) tog.innerHTML = secOpen[sec] ? '&#9660;' : '&#9654;';
  });
  checkCarry();
  checkBackupNudge();
  render();
}

function markBackupExported() {
  try { localStorage.setItem(STORAGE_EXPORT, todayISODate()); } catch (e) {}
  const bar = document.getElementById('backup-bar');
  if (bar) bar.style.display = 'none';
}

function dismissBackupNudge() {
  try { localStorage.setItem(STORAGE_BACKUP_DISMISS, todayISODate()); } catch (e) {}
  const bar = document.getElementById('backup-bar');
  if (bar) bar.style.display = 'none';
}

function checkBackupNudge() {
  const bar = document.getElementById('backup-bar');
  if (!bar) return;
  const now = new Date();
  if (now.getDay() !== 5 || now.getHours() < 12) {
    bar.style.display = 'none';
    return;
  }
  const today = todayISODate();
  let last = '', dismissed = '';
  try {
    last = localStorage.getItem(STORAGE_EXPORT) || '';
    dismissed = localStorage.getItem(STORAGE_BACKUP_DISMISS) || '';
  } catch (e) {}
  if (last === today || dismissed === today) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';
}
