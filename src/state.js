import { DRINK_IDS, waterPlan, totals } from './drinks.js';

export const STORAGE_KEY = 'resaka:v1';

export function initialState() {
  return { tab: 'tonight', counts: {}, glasses: 0 };
}

/** Pure state transitions. Returns the same object when nothing changes. */
export function reduce(state, action) {
  switch (action.type) {
    case 'tab':
      return action.tab === 'tonight' || action.tab === 'tomorrow'
        ? { ...state, tab: action.tab }
        : state;
    case 'add':
    case 'remove': {
      if (!DRINK_IDS.includes(action.id)) return state;
      const n = (state.counts[action.id] ?? 0) + (action.type === 'add' ? 1 : -1);
      const counts = { ...state.counts };
      if (n > 0) counts[action.id] = n;
      else delete counts[action.id];
      return clampGlasses({ ...state, counts });
    }
    case 'drinkGlass':
      return clampGlasses({ ...state, glasses: state.glasses + 1 });
    case 'undoGlass':
      return { ...state, glasses: Math.max(0, state.glasses - 1) };
    case 'reset':
      return { ...state, counts: {}, glasses: 0 };
    default:
      return state;
  }
}

// Removing drinks lowers the target, so the glass count can't stay above it.
function clampGlasses(state) {
  const { glassesNeeded } = waterPlan(totals(state.counts).drinks, state.glasses);
  return state.glasses > glassesNeeded ? { ...state, glasses: glassesNeeded } : state;
}

/** Reads saved state, falling back to a fresh one for missing, blocked or corrupt storage. */
export function load(storage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const saved = JSON.parse(raw);
    const counts = {};
    for (const id of DRINK_IDS) {
      const n = saved?.counts?.[id];
      if (Number.isInteger(n) && n > 0) counts[id] = n;
    }
    const glasses = Number.isInteger(saved?.glasses) && saved.glasses > 0 ? saved.glasses : 0;
    const tab = saved?.tab === 'tomorrow' ? 'tomorrow' : 'tonight';
    return clampGlasses({ tab, counts, glasses });
  } catch {
    return initialState();
  }
}

export function save(storage, state) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or full storage: the app still works for this session.
  }
}
