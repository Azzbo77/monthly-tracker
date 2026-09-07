// -- Item actions --
/**
 * Sorts tasks in a column by priority level (High → Medium → Low).
 * Within each priority tier, maintains the existing manual order.
 * @param {Array<Object>} tasks - Array of task objects from a column
 * @returns {Array<Object>} Sorted tasks array (modifies in place and returns)
 */
function sortByPriority(tasks) {
  const priorityOrder = { high: 0, med: 1, low: 2 };
  return tasks.sort((a, b) => {
    const aPrio = priorityOrder[a.priority || 'med'] ?? 1;
    const bPrio = priorityOrder[b.priority || 'med'] ?? 1;
    return aPrio - bPrio;
  });
}

function sortColumnByPriority(col) {
  const w = getOrCreate(currentKey);
  sortByPriority(w[col]);
  normalizeOrders(w);
  colSorted[col] = true;
  save();
  render();
  showToast(`${COL_LABELS[col]} sorted by priority.`, 'info', null, null, 2500);
}

// Assign consistent order values (0, 1, 2...) to all tasks in a month
/**
 * Assigns consistent order values (0, 1, 2...) to all tasks in a month.
 * Ensures stable ordering when tasks are added, reordered, or moved between columns.
 * @param {Object} w - Week/month object containing {doing, planned, blocked, done, cancelled} arrays
 * @returns {void}
 */
function normalizeOrders(w) {
  let changed = false;
  COLS.concat(['done', 'cancelled']).forEach(col => {
    (w[col] || []).forEach((task, idx) => {
      if (task.order !== idx) {
        task.order = idx;
        changed = true;
      }
    });
  });
  return changed;
}

function createTask(text, extra = {}) {
  return Object.assign({
    text: text,
    note: '',
    carried: false,
    ongoing: false,
    progress: null,
    order: 0,
    priority: 'med',
    createdDate: todayDisplayDate(),
    startedDate: ''
  }, extra);
}

function taskIdentity(it) {
  return String(it && it.text || '').trim().toLowerCase();
}

function mergeTasks(dest, incoming) {
  const seen = new Set(dest.map(taskIdentity));
  (incoming || []).forEach(it => {
    const key = taskIdentity(it);
    if (!key || seen.has(key)) return;
    dest.push(it);
    seen.add(key);
  });
}

function setStartedDate(col, i, iso) {
  const it = getOrCreate(currentKey)[col] && getOrCreate(currentKey)[col][i];
  if (!it) return;
  it.startedDate = iso ? isoToDisplayDate(iso) : '';
  save();
  render();
}

// When creating a new task, add it to the top of the column
function addItem(col) {
  const inp = document.getElementById('in-' + col);
  const v = inp.value.trim();
  if (!v) return;

  const w = getOrCreate(currentKey);

  // Insert at top — shift all existing orders up by 1 then assign 0 to the new task
  w[col].forEach(t => { t.order = (t.order || 0) + 1; });
  w[col].unshift(createTask(v));

  colSorted[col] = false;
  inp.value = '';
  save();
  render();
}

function setProgress(col, i, val, commit = false) {
  const trimmed = val.trim();
  const n = parseInt(trimmed, 10);
  const it = getOrCreate(currentKey)[col][i];
  if (!it) return false;
  if (trimmed === '' || isNaN(n)) it.progress = null;
  else it.progress = Math.min(100, Math.max(0, n));
  save(commit);

  const k = col + i;
  const wrap = document.getElementById('prog-wrap-' + k);
  const fill = document.getElementById('prog-fill-' + k);
  const label = document.getElementById('prog-label-' + k);
  const cardInp = document.getElementById('prog-card-' + k);
  const noteInp = document.getElementById('prog-' + k);
  const pct = it.progress;
  const color = pct === 100 ? 'var(--green)' : pct >= 50 ? 'var(--blue)' : 'var(--amber)';

  if (wrap) wrap.style.display = 'flex';
  if (fill) {
    fill.style.width = (pct || 0) + '%';
    fill.style.background = color;
    fill.style.opacity = pct === null ? '.25' : '1';
  }
  if (label) {
    label.textContent = pct === null ? '' : pct + '%';
    label.style.color = color;
  }
  if (cardInp && document.activeElement !== cardInp) cardInp.value = pct === null ? '' : String(pct);
  if (noteInp && document.activeElement !== noteInp) noteInp.value = pct === null ? '' : String(pct);

  if (commit && pct === 100) {
    const ta = document.getElementById('nte-' + k);
    if (ta) it.note = ta.value;
    editing[k] = false;
    markDone(col, i);
    return true;
  }
  updateSummary(getOrCreate(currentKey));
  return false;
}

function shiftEditingKeys(col, removedIdx) {
  [editing, editingName].forEach(map => {
    const keys = Object.keys(map)
      .filter(k => k.startsWith(col) && !isNaN(parseInt(k.slice(col.length), 10)))
      .sort((a, b) => parseInt(a.slice(col.length), 10) - parseInt(b.slice(col.length), 10));
    keys.forEach(k => {
      const idx = parseInt(k.slice(col.length), 10);
      if (idx === removedIdx) delete map[k];
      else if (idx > removedIdx) { map[col + (idx - 1)] = map[k]; delete map[k]; }
    });
  });
}

function removeItem(col, i) {
  const w = getOrCreate(currentKey);
  const removed = w[col].splice(i, 1)[0];
  shiftEditingKeys(col, i);
  save();
  render();
  showToast('Task deleted.', 'warning', 'Undo', () => {
    const target = getOrCreate(currentKey)[col];
    target.splice(Math.min(i, target.length), 0, removed);
    save();
    render();
  });
}

function markDone(col, i) {
  const w = getOrCreate(currentKey);
  const it = w[col].splice(i, 1)[0];
  shiftEditingKeys(col, i);
  if (it.progress !== null && it.progress !== undefined) it.progress = 100;
  it.completedFrom = col;
  it.completedDate = todayDisplayDate();
  w.done.push(it);
  save();
  render();
  // Offer an optional completion note and achievement flag
  setTimeout(() => {
    showNoteToast('Add a completion note… (optional)', 'var(--green)', (val, isAch, date) => {
      if (val) it.note = it.note ? it.note + '\n\n[Completed] ' + val : '[Completed] ' + val;
      if (isAch) it.achievement = true;
      if (date) it.completedDate = date;
      save();
      render();
    }, true, { label: 'Completed on', value: it.completedDate });
  }, 50);
}

function markCancelled(col, i) {
  const w = getOrCreate(currentKey);
  const it = w[col].splice(i, 1)[0];
  shiftEditingKeys(col, i);
  it.cancelledFrom = col;
  it.cancelledDate = todayDisplayDate();
  w.cancelled.push(it);
  save();
  render();
  // Offer an optional cancellation reason note and the real cancel date
  setTimeout(() => {
    showNoteToast('Add a reason for cancelling… (optional)', 'var(--amber)', (val, _isAch, date) => {
      if (val) it.note = it.note ? it.note + '\n\n[Cancelled] ' + val : '[Cancelled] ' + val;
      if (date) it.cancelledDate = date;
      save();
      render();
    }, false, { label: 'Cancelled on', value: it.cancelledDate });
  }, 100);
}

function setResolvedDate(sec, i, iso) {
  const it = getOrCreate(currentKey)[sec] && getOrCreate(currentKey)[sec][i];
  if (!it) return;
  const display = iso ? isoToDisplayDate(iso) : '';
  if (sec === 'done') it.completedDate = display || todayDisplayDate();
  else if (sec === 'cancelled') it.cancelledDate = display || todayDisplayDate();
  save();
  render();
}

function restoreItem(sec, i) {
  const w = getOrCreate(currentKey);
  const it = w[sec].splice(i, 1)[0];
  const col = COLS.includes(it.completedFrom) ? it.completedFrom :
              COLS.includes(it.cancelledFrom) ? it.cancelledFrom : 'doing';
  // Clear resolution metadata so the task is clean when reactivated
  delete it.completedFrom;
  delete it.completedDate;
  delete it.cancelledFrom;
  delete it.cancelledDate;
  delete it.achievement; // achievement is only meaningful on a completed task
  // Strip any completion/cancellation note appended by the note toast.
  // Two cases: note was the entire content (starts with tag),
  // or it was appended after existing content (preceded by \n\n).
  if (it.note) {
    it.note = it.note
      .replace(/\n\n\[Completed\][^]*$/, '')
      .replace(/\n\n\[Cancelled\][^]*$/, '')
      .replace(/^\[Completed\][^]*$/, '')
      .replace(/^\[Cancelled\][^]*$/, '')
      .trimEnd();
  }
  w[col].unshift(it);
  save();
  render();
}

function removeResolved(sec, i) {
  const w = getOrCreate(currentKey);
  const removed = w[sec].splice(i, 1)[0];
  save();
  render();
  showToast('Task deleted.', 'warning', 'Undo', () => {
    const target = getOrCreate(currentKey)[sec];
    target.splice(Math.min(i, target.length), 0, removed);
    save();
    render();
  });
}

function clearSec(sec) {
  const w = getOrCreate(currentKey);
  if (w[sec].length === 0) return;
  const snapshot = structuredClone(w[sec]);
  w[sec] = [];
  save();
  render();
  const secLabel = sec === 'done' ? 'completed' : sec;
  showToast(`Cleared all ${secLabel} tasks.`, 'warning', 'Undo', () => {
    getOrCreate(currentKey)[sec] = snapshot;
    save();
    render();
    showToast('Undo successful \u2014 tasks restored.', 'success', null, null, 3000);
  }, TIMING.TOAST_DEFAULT_DURATION);
}

function moveItem(fc, i, tc) {
  if (fc === tc) return;
  const w = getOrCreate(currentKey);
  shiftEditingKeys(fc, i);
  colSorted[fc] = false;
  colSorted[tc] = false;
  w[tc].unshift(w[fc].splice(i, 1)[0]);
  normalizeOrders(w);
  save();
  render();
}

function toggleMoveMenu(e, id) {
  e.stopPropagation();
  document.querySelectorAll('.mv-menu.open').forEach(m => { if (m.id !== id) m.classList.remove('open'); });
  document.getElementById(id).classList.toggle('open');
}

function toggleOngoing(col, i) {
  const it = getOrCreate(currentKey)[col][i];
  it.ongoing = !it.ongoing;
  save();
  render();
}

function cyclePriority(col, i) {
  const task = getOrCreate(currentKey)[col][i];
  
  if (!task.priority || task.priority === 'low') {
    task.priority = 'med';
  } else if (task.priority === 'med') {
    task.priority = 'high';
  } else {
    task.priority = 'low';
  }
  
  save();
  render();
}

function toggleEditName(col, i) {
  const k = col + i;
  editingName[k] = !editingName[k];
  render();
  if (editingName[k]) {
    setTimeout(() => {
      const inp = document.getElementById('itxt-' + k);
      if (inp) {
        inp.focus();
        inp.setSelectionRange(0, inp.value.length);
      }
    }, 0);
  }
}

function saveTaskName(col, i) {
  const k = col + i;
  const inp = document.getElementById('itxt-' + k);
  if (inp) {
    const newName = inp.value.trim();
    if (newName) getOrCreate(currentKey)[col][i].text = newName;
  }
  editingName[k] = false;
  save();
  render();
}

function handleTaskNameKey(e, col, i) {
  if (e.key === 'Enter') { e.preventDefault(); saveTaskName(col, i); return; }
  if (e.key === 'Escape') { e.preventDefault(); editingName[col + i] = false; render(); return; }
}

function toggleNote(col, i) {
  const k = col + i;
  editing[k] = !editing[k];
  render();
  if (editing[k]) {
    setTimeout(() => {
      const ta = document.getElementById('nte-' + k);
      if (ta) {
        ta.focus();
        ta.setSelectionRange(ta.value.length, ta.value.length);
      }
    }, TIMING.ASYNC_TASK_SCHEDULE);
  }
}

function saveNote(col, i) {
  const k = col + i;
  const ta = document.getElementById('nte-' + k);
  if (ta) getOrCreate(currentKey)[col][i].note = ta.value;
  const progInp = document.getElementById('prog-' + k);
  const progVal = progInp ? progInp.value : null;
  editing[k] = false;
  if (progVal !== null) {
    const completed = setProgress(col, i, progVal, true);
    if (completed) return;
  }
  save();
  render();
}

function toggleSec(sec) {
  secOpen[sec] = !secOpen[sec];
  document.getElementById('body-' + sec).style.display = secOpen[sec] ? 'block' : 'none';
  document.getElementById('tog-' + sec).innerHTML = secOpen[sec] ? '&#9660;' : '&#9654;';
  try { localStorage.setItem(STORAGE_SEC, JSON.stringify(secOpen)); } catch(e) {}
}

/**
 * Toggles the hideCompleted flag on a task, hiding strikethrough lines in the note view.
 * Persists the preference in localStorage.
 * @param {string} col - Column identifier ('doing', 'planned', 'blocked', etc)
 * @param {number} i - Zero-based index of the task within its column
 * @returns {void}
 */
function toggleHideCompleted(col, i) {
  const task = getOrCreate(currentKey)[col][i];
  task.hideCompleted = !task.hideCompleted;
  save();
  render();
}


