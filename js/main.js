// Run once everything is defined
load();
init();

// Press / when not in a text field to focus the first column's add input
document.addEventListener('keydown', e => {
  if (e.key !== '/') return;
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  // Don't fire if a modal is open
  if (document.querySelector('.modal-bg.open')) return;
  e.preventDefault();
  const inp = document.getElementById('in-doing');
  if (inp) inp.focus();
});
