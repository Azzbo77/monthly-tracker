function save() {
  try {
    const toSave = {};
    Object.keys(weeks).forEach(k => {
      const w = weeks[k];
      if (w.doing.length + w.planned.length + w.blocked.length + w.done.length + w.cancelled.length > 0) {
        toSave[k] = w;
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ months: toSave, monthOffset }));
  } catch (e) {
    console.warn('Failed to save data to localStorage', e);
    showToast('Could not save — storage may be full. Export your data to avoid losing it.', 'error', null, null, 8000);
  }
}

function load() {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    if (!r) return;
    const d = JSON.parse(r);

    if (d.months && typeof d.months === 'object') Object.assign(weeks, d.months);

    if (typeof d.monthOffset === 'number') monthOffset = d.monthOffset;
  } catch (e) {
    console.warn('Failed to load data from localStorage', e);
  }
}

function toggleTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', dark ? '' : 'dark');
  try {
    // Store explicit choice — this prevents the OS prefers-color-scheme listener
    // from overriding the user's manual preference.
    localStorage.setItem(STORAGE_THEME, dark ? 'light' : 'dark');
  } catch (e) {}
}

(function () {
  try {
    const saved = localStorage.getItem(STORAGE_THEME);
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // No manual preference stored — respect the OS setting on first visit
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    const savedSec = localStorage.getItem(STORAGE_SEC);
    if (savedSec) Object.assign(secOpen, JSON.parse(savedSec));
  } catch (e) {}

  // Keep theme in sync if the user switches OS dark/light mode while the app is open,
  // but only when they haven't manually set a preference themselves.
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_THEME)) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : '');
      }
    });
  } catch (e) {}
})();