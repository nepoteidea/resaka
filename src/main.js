import './style.css';
import { load, reduce, save } from './state.js';
import { render } from './view.js';

const root = document.getElementById('app');
const storage = (() => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
})();

let state = load(storage);

function paint() {
  // The screen is re-rendered as a whole, so keep keyboard focus on the same control.
  const focusedKey = document.activeElement?.dataset?.key;
  root.innerHTML = render(state);
  if (focusedKey) {
    const target = root.querySelector(`[data-key="${focusedKey}"]`);
    (target && !target.disabled ? target : root.querySelector('main button'))?.focus();
  }
}

root.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id, tab } = button.dataset;
  const next = reduce(state, { type: action, id, tab });
  if (next === state) return;
  const tabChanged = next.tab !== state.tab;
  state = next;
  save(storage, state);
  paint();
  if (tabChanged) window.scrollTo(0, 0);
});

paint();
