import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, initialState, load, reduce, save } from '../../src/state.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
  };
}

const throwing = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('quota');
  },
};

describe('reduce', () => {
  it('adds and removes drinks, dropping zero counts', () => {
    let s = initialState();
    s = reduce(s, { type: 'add', id: 'beer' });
    s = reduce(s, { type: 'add', id: 'beer' });
    expect(s.counts).toEqual({ beer: 2 });
    s = reduce(s, { type: 'remove', id: 'beer' });
    s = reduce(s, { type: 'remove', id: 'beer' });
    expect(s.counts).toEqual({});
  });

  it('never goes below zero', () => {
    const s = reduce(initialState(), { type: 'remove', id: 'wine' });
    expect(s.counts).toEqual({});
  });

  it('ignores unknown drinks, tabs and actions', () => {
    const s = initialState();
    expect(reduce(s, { type: 'add', id: 'mead' })).toBe(s);
    expect(reduce(s, { type: 'tab', tab: 'yesterday' })).toBe(s);
    expect(reduce(s, { type: 'dance' })).toBe(s);
  });

  it('switches tabs', () => {
    expect(reduce(initialState(), { type: 'tab', tab: 'tomorrow' }).tab).toBe('tomorrow');
    expect(
      reduce({ ...initialState(), tab: 'tomorrow' }, { type: 'tab', tab: 'tonight' }).tab,
    ).toBe('tonight');
  });

  it('counts glasses between zero and the target', () => {
    let s = initialState();
    s = reduce(s, { type: 'undoGlass' });
    expect(s.glasses).toBe(0);
    for (let i = 0; i < 12; i++) s = reduce(s, { type: 'drinkGlass' });
    expect(s.glasses).toBe(8);
    s = reduce(s, { type: 'undoGlass' });
    expect(s.glasses).toBe(7);
  });

  it('lowers the glass count when removing drinks lowers the target', () => {
    let s = { tab: 'tonight', counts: { shot: 2 }, glasses: 10 };
    s = reduce(s, { type: 'remove', id: 'shot' });
    expect(s.glasses).toBe(9);
  });

  it('reset clears drinks and glasses but keeps the tab', () => {
    const s = reduce({ tab: 'tomorrow', counts: { beer: 3 }, glasses: 2 }, { type: 'reset' });
    expect(s).toEqual({ tab: 'tomorrow', counts: {}, glasses: 0 });
  });
});

describe('load / save', () => {
  it('round-trips state', () => {
    const storage = memoryStorage();
    const state = { tab: 'tomorrow', counts: { wine: 2, shot: 1 }, glasses: 3 };
    save(storage, state);
    expect(JSON.parse(storage.data[STORAGE_KEY])).toEqual(state);
    expect(load(storage)).toEqual(state);
  });

  it('starts fresh with no storage, nothing saved, or corrupt data', () => {
    expect(load(null)).toEqual(initialState());
    expect(load(memoryStorage())).toEqual(initialState());
    expect(load(memoryStorage({ [STORAGE_KEY]: '{not json' }))).toEqual(initialState());
    expect(load(throwing)).toEqual(initialState());
  });

  it('drops invalid fields from saved data', () => {
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        tab: 'nope',
        counts: { beer: 2, wine: -1, shot: 1.5, mead: 3, cider: '2' },
        glasses: 'lots',
      }),
    });
    expect(load(storage)).toEqual({ tab: 'tonight', counts: { beer: 2 }, glasses: 0 });
  });

  it('clamps saved glasses to the target', () => {
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({ counts: {}, glasses: 50 }),
    });
    expect(load(storage).glasses).toBe(8);
  });

  it('save survives storage that throws', () => {
    expect(() => save(throwing, initialState())).not.toThrow();
    expect(() => save(null, initialState())).not.toThrow();
  });
});
