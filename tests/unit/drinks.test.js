import { describe, expect, it } from 'vitest';
import {
  DRINKS,
  alcoholGrams,
  formatLitres,
  loggedRows,
  totals,
  waterPlan,
} from '../../src/drinks.js';

describe('DRINKS', () => {
  it('has the six v1 drinks in button order', () => {
    expect(DRINKS.map((d) => d.name)).toEqual([
      'Beer',
      'Wine',
      'Cocktail',
      'Shot',
      'Long drink',
      'Cider',
    ]);
  });
});

describe('alcoholGrams', () => {
  it('uses volume × ABV × ethanol density', () => {
    expect(alcoholGrams({ ml: 330, abv: 5 })).toBeCloseTo(13.02, 2);
    expect(alcoholGrams({ ml: 40, abv: 40 })).toBeCloseTo(12.62, 2);
  });
});

describe('totals', () => {
  it('is zero with nothing logged', () => {
    expect(totals({})).toEqual({ drinks: 0, kcal: 0, grams: 0 });
  });

  it('sums drinks, kcal and rounded grams', () => {
    // 2 beers (2 × 145 kcal, 2 × 13.02 g) + 1 wine (125 kcal, 14.20 g)
    expect(totals({ beer: 2, wine: 1 })).toEqual({ drinks: 3, kcal: 415, grams: 40 });
  });

  it('ignores unknown drink ids', () => {
    expect(totals({ beer: 1, mead: 4 })).toEqual({ drinks: 1, kcal: 145, grams: 13 });
  });
});

describe('loggedRows', () => {
  it('lists only drinks with a count, in button order', () => {
    expect(loggedRows({ cider: 1, beer: 2, wine: 0 })).toEqual([
      { id: 'beer', name: 'Beer', n: 2, kcal: 290 },
      { id: 'cider', name: 'Cider', n: 1, kcal: 170 },
    ]);
  });
});

describe('waterPlan', () => {
  it('is 2.0 L (8 glasses) with no drinks', () => {
    expect(waterPlan(0, 0)).toEqual({
      targetMl: 2000,
      glassesNeeded: 8,
      drunk: 0,
      leftMl: 2000,
      progress: 0,
    });
  });

  it('adds 250 ml per drink and tracks glasses', () => {
    expect(waterPlan(3, 4)).toEqual({
      targetMl: 2750,
      glassesNeeded: 11,
      drunk: 4,
      leftMl: 1750,
      progress: 4 / 11,
    });
  });

  it('clamps glasses to the target and to zero', () => {
    expect(waterPlan(0, 20)).toMatchObject({ drunk: 8, leftMl: 0, progress: 1 });
    expect(waterPlan(0, -2)).toMatchObject({ drunk: 0, leftMl: 2000 });
  });
});

describe('formatLitres', () => {
  it('keeps one decimal for whole and half litres, two for quarters', () => {
    expect(formatLitres(2000)).toBe('2.0 L');
    expect(formatLitres(2500)).toBe('2.5 L');
    expect(formatLitres(2250)).toBe('2.25 L');
    expect(formatLitres(0)).toBe('0.0 L');
  });
});
