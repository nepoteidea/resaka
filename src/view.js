import { DRINKS, GLASS_ML, formatLitres, loggedRows, totals, waterPlan } from './drinks.js';

// Inline stroke icons from the prototype. Every one is decorative: buttons carry text labels.
const ICON_PATHS = {
  beer: '<path d="M5 8h10v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M15 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><path d="M5 8a3 3 0 0 1 3-4 3 3 0 0 1 5 0 2.5 2.5 0 0 1 2 4"/>',
  wine: '<path d="M8 3h8l-.5 6a3.5 3.5 0 0 1-7 0z"/><path d="M12 12.5V20"/><path d="M8 21h8"/>',
  cocktail: '<path d="M4 4h16l-8 9z"/><path d="M12 13v7"/><path d="M8 21h8"/>',
  shot: '<path d="M7 5h10l-1.5 15h-7z"/><path d="M7.6 11h8.8"/>',
  long: '<path d="M7 4h10l-1.2 17H8.2z"/><path d="M13.5 4 16 1"/><path d="M7.4 10h9.2"/>',
  cider:
    '<path d="M12 7c-2-1.5-6-1-6 4 0 4 3 9 6 8 3 1 6-4 6-8 0-5-4-5.5-6-4z"/><path d="M12 7c0-2 1-3 3-4"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
};

function icon(name, { size = 24, width = 1.8, cls = '' } = {}) {
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}

const dateLabel = (date) =>
  date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

const eyebrow = 'text-xs font-bold uppercase tracking-[0.12em] text-muted';
const sectionLabel = 'text-[13px] font-bold text-muted';
const roundButton =
  'flex size-11 items-center justify-center rounded-full border border-line text-ink-text hover:bg-panel-hi';

function tonight(state, now) {
  const t = totals(state.counts);
  const plan = waterPlan(t.drinks, state.glasses);
  const rows = loggedRows(state.counts);

  const buttons = DRINKS.map(
    (d) => `
      <button type="button" data-action="add" data-id="${d.id}" data-key="add-${d.id}"
        class="flex min-h-26 flex-col items-start gap-1.5 rounded-[18px] border border-edge bg-panel px-3 py-3.5 text-left hover:bg-panel-hi active:scale-[0.98]">
        ${icon(d.id, { size: 26, cls: 'text-accent' })}
        <span class="text-[15px] font-bold">${d.name}</span>
        <span class="text-xs text-muted">${d.ml} ml · ${d.abv}%</span>
      </button>`,
  ).join('');

  const list = rows.length
    ? rows
        .map(
          (r) => `
      <li class="flex items-center gap-3 rounded-2xl bg-panel py-2.5 pr-2.5 pl-4" data-row="${r.id}">
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span class="text-[15px] font-bold">${r.name}</span>
          <span class="text-xs text-muted">${r.kcal} kcal</span>
        </div>
        <div class="flex items-center gap-1">
          <button type="button" data-action="remove" data-id="${r.id}" data-key="remove-${r.id}" class="${roundButton}" aria-label="Remove one ${r.name}">${icon('minus', { size: 18, width: 2 })}</button>
          <span class="w-7 text-center text-[17px] font-bold" data-count>${r.n}</span>
          <button type="button" data-action="add" data-id="${r.id}" data-key="plus-${r.id}" class="${roundButton}" aria-label="Add one ${r.name}">${icon('plus', { size: 18, width: 2 })}</button>
        </div>
      </li>`,
        )
        .join('')
    : `<li class="rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">Nothing yet. Tap a drink above to log it.</li>`;

  return `
    <section class="flex flex-col gap-6" aria-labelledby="tonight-heading">
      <div class="flex items-center justify-between">
        <h1 id="tonight-heading" class="${eyebrow}">Tonight · ${dateLabel(now)}</h1>
        <button type="button" data-action="reset" data-key="reset" class="min-h-11 px-1 text-sm text-muted hover:text-ink-text">Reset</button>
      </div>

      <div class="flex flex-col gap-2" aria-live="polite">
        <div class="flex items-baseline gap-2">
          <span class="font-display text-6xl leading-none font-bold text-accent" data-testid="kcal">${t.kcal}</span>
          <span class="text-lg text-muted">kcal</span>
        </div>
        <div class="flex gap-4 text-[15px] text-soft">
          <span data-testid="drinks">${t.drinks} ${t.drinks === 1 ? 'drink' : 'drinks'}</span>
          <span class="text-dim" aria-hidden="true">•</span>
          <span data-testid="grams">${t.grams} g alcohol</span>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <h2 class="${sectionLabel}">Add a drink</h2>
        <div class="grid grid-cols-3 gap-2.5">${buttons}</div>
      </div>

      <div class="flex flex-col gap-2.5">
        <h2 class="${sectionLabel}">Logged tonight</h2>
        <ul class="flex flex-col gap-2.5">${list}</ul>
      </div>

      <button type="button" data-action="tab" data-tab="tomorrow" data-key="water-card"
        class="flex items-center gap-3.5 rounded-[20px] border border-water-line bg-water-bg p-4.5 text-left hover:brightness-110">
        ${icon('drop', { size: 28, cls: 'text-water' })}
        <span class="flex flex-1 flex-col gap-0.5">
          <span class="text-[13px] text-water-soft">Tomorrow, drink</span>
          <span class="text-xl font-bold" data-testid="water-teaser">${formatLitres(plan.targetMl)} of water</span>
        </span>
        ${icon('chevron', { size: 20, width: 2, cls: 'text-water-soft' })}
      </button>

      <p class="text-xs leading-normal text-faint">Calories are estimates for the standard sizes shown.</p>
    </section>`;
}

function tomorrow(state, now) {
  const t = totals(state.counts);
  const plan = waterPlan(t.drinks, state.glasses);
  const next = new Date(now.getTime() + 86_400_000);

  const glasses = Array.from({ length: plan.glassesNeeded }, (_, i) => {
    const full = i < plan.drunk;
    return `<li class="flex justify-center"><svg width="30" height="36" viewBox="0 0 24 28" aria-hidden="true" data-glass="${full ? 'full' : 'empty'}"><path d="M4 3h16l-2 22H6z" fill="${full ? 'var(--color-water)' : 'transparent'}" stroke="${full ? 'var(--color-water)' : 'var(--color-dim)'}" stroke-width="1.6" stroke-linejoin="round"/></svg></li>`;
  }).join('');

  const pct = Math.round(plan.progress * 100);

  return `
    <section class="flex flex-col gap-6" aria-labelledby="tomorrow-heading">
      <div class="flex min-h-11 items-center">
        <h1 id="tomorrow-heading" class="${eyebrow}">Tomorrow · ${dateLabel(next)}</h1>
      </div>

      <div class="flex flex-col gap-1.5">
        <h2 class="font-display text-[28px] font-bold">Rehydrate</h2>
        <div class="flex flex-wrap items-baseline gap-2.5">
          <span class="font-display text-6xl leading-none font-bold text-water" data-testid="water-target">${formatLitres(plan.targetMl)}</span>
          <span class="text-base text-muted">${plan.glassesNeeded} glasses of ${GLASS_ML} ml</span>
        </div>
      </div>

      <div class="flex flex-col gap-2.5">
        <div class="h-2.5 overflow-hidden rounded-full bg-track" role="progressbar" aria-label="Water drunk" aria-valuemin="0" aria-valuemax="${plan.glassesNeeded}" aria-valuenow="${plan.drunk}">
          <div class="h-full rounded-full bg-water transition-[width]" style="width: ${pct}%"></div>
        </div>
        <div class="flex justify-between text-sm text-soft" aria-live="polite">
          <span data-testid="glass-count">${plan.drunk} of ${plan.glassesNeeded} glasses</span>
          <span class="text-muted" data-testid="left">${formatLitres(plan.leftMl)} to go</span>
        </div>
      </div>

      <ul class="grid grid-cols-6 gap-2.5">${glasses}</ul>

      <div class="flex gap-2.5">
        <button type="button" data-action="drinkGlass" data-key="drink-glass" ${plan.drunk >= plan.glassesNeeded ? 'disabled' : ''}
          class="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-water text-[17px] font-bold text-water-ink hover:brightness-110 disabled:opacity-50">
          ${icon('plus', { size: 20, width: 2.2 })}I drank a glass
        </button>
        <button type="button" data-action="undoGlass" data-key="undo-glass" aria-label="Undo last glass" ${plan.drunk === 0 ? 'disabled' : ''}
          class="flex min-h-14 w-14 items-center justify-center rounded-full border border-line hover:bg-panel-hi disabled:opacity-40">
          ${icon('undo', { size: 20, width: 2 })}
        </button>
      </div>

      <div class="flex flex-col gap-1.5 rounded-[18px] bg-panel p-4">
        <h2 class="${sectionLabel}">How it's worked out</h2>
        <p class="text-[15px] leading-normal">2.0 L daily base, plus 250 ml for each of last night's ${t.drinks} ${t.drinks === 1 ? 'drink' : 'drinks'}.</p>
      </div>

      <p class="text-xs leading-normal text-faint">Water helps you rehydrate. It won't cure a hangover on its own.</p>
    </section>`;
}

function tabButton(id, label, iconName, active) {
  const on = id === 'tonight' ? 'bg-track text-accent' : 'bg-water-bg text-water';
  return `
    <button type="button" data-action="tab" data-tab="${id}" data-key="tab-${id}" ${active ? 'aria-current="page"' : ''}
      class="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold ${active ? on : 'text-muted hover:text-ink-text'}">
      ${icon(iconName, { size: 22 })}${label}
    </button>`;
}

/** The whole screen as an HTML string. `now` is injectable so tests get stable dates. */
export function render(state, now = new Date()) {
  const isTonight = state.tab === 'tonight';
  return `
    <main class="flex-1 px-5 pt-7 pb-6">${isTonight ? tonight(state, now) : tomorrow(state, now)}</main>
    <nav aria-label="Sections" class="sticky bottom-0 flex gap-2 border-t border-rule bg-ink px-5 pt-2 pb-[max(20px,env(safe-area-inset-bottom))]">
      ${tabButton('tonight', 'Tonight', 'moon', isTonight)}
      ${tabButton('tomorrow', 'Tomorrow', 'drop', !isTonight)}
    </nav>`;
}
