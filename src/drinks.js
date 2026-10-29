// Standard servings shown on the drink buttons. kcal values are typical estimates for the
// whole serving (alcohol plus sugar), so they're stored rather than derived from ABV.
export const DRINKS = [
  { id: 'beer', name: 'Beer', ml: 330, abv: 5, kcal: 145 },
  { id: 'wine', name: 'Wine', ml: 150, abv: 12, kcal: 125 },
  { id: 'cocktail', name: 'Cocktail', ml: 200, abv: 12, kcal: 190 },
  { id: 'shot', name: 'Shot', ml: 40, abv: 40, kcal: 95 },
  { id: 'long', name: 'Long drink', ml: 250, abv: 8, kcal: 170 },
  { id: 'cider', name: 'Cider', ml: 330, abv: 4.5, kcal: 170 },
];

export const DRINK_IDS = DRINKS.map((d) => d.id);

export const BASE_WATER_ML = 2000;
export const WATER_PER_DRINK_ML = 250;
export const GLASS_ML = 250;

// Density of ethanol in g/ml.
const ETHANOL_DENSITY = 0.789;

export function alcoholGrams(drink) {
  return drink.ml * (drink.abv / 100) * ETHANOL_DENSITY;
}

/** Totals for a `{ [drinkId]: count }` map. Unknown ids are ignored. */
export function totals(counts) {
  let drinks = 0;
  let kcal = 0;
  let grams = 0;
  for (const d of DRINKS) {
    const n = counts[d.id] ?? 0;
    drinks += n;
    kcal += n * d.kcal;
    grams += n * alcoholGrams(d);
  }
  return { drinks, kcal, grams: Math.round(grams) };
}

/** Rows for the "Logged tonight" list, in button order, skipping drinks with no count. */
export function loggedRows(counts) {
  return DRINKS.filter((d) => (counts[d.id] ?? 0) > 0).map((d) => ({
    id: d.id,
    name: d.name,
    n: counts[d.id],
    kcal: counts[d.id] * d.kcal,
  }));
}

/** Next-day water target: a daily base plus a fixed amount per drink, tracked in glasses. */
export function waterPlan(drinks, glassesDrunk) {
  const targetMl = BASE_WATER_ML + WATER_PER_DRINK_ML * drinks;
  const glassesNeeded = Math.ceil(targetMl / GLASS_ML);
  const drunk = Math.min(Math.max(glassesDrunk, 0), glassesNeeded);
  return {
    targetMl,
    glassesNeeded,
    drunk,
    leftMl: Math.max(0, targetMl - drunk * GLASS_ML),
    progress: drunk / glassesNeeded,
  };
}

/** 2000 → "2.0 L", 2250 → "2.25 L", 2500 → "2.5 L". */
export function formatLitres(ml) {
  return `${(ml / 1000).toFixed(2).replace(/0$/, '')} L`;
}
