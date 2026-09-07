const weeks = {};
const COLS = ['doing', 'planned', 'blocked'];

const secOpen = { done: true, cancelled: true };
const editing = {};
const editingName = {};
// Tracks which columns currently have an active priority sort.
// Cleared when tasks are dragged, added, or moved in that column.
const colSorted = { doing: false, planned: false, blocked: false };

let currentKey = '';
let monthOffset = 0;
let draggedItem = null;