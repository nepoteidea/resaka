import { describe, expect, it } from 'vitest';
import { render } from '../../src/view.js';

const NOW = new Date('2026-10-30T22:00:00');

const text = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('render: tonight', () => {
  it('shows an empty state with the base water target', () => {
    const html = render({ tab: 'tonight', counts: {}, glasses: 0 }, NOW);
    const t = text(html);
    expect(t).toContain('Tonight · Fri 30 Oct');
    expect(t).toContain('0 kcal');
    expect(t).toContain('0 drinks');
    expect(t).toContain('Nothing yet. Tap a drink above to log it.');
    expect(t).toContain('2.0 L of water');
    expect(html.match(/data-action="add"/g)).toHaveLength(6);
  });

  it('shows totals and a row per logged drink', () => {
    const html = render({ tab: 'tonight', counts: { beer: 2, wine: 1 }, glasses: 0 }, NOW);
    const t = text(html);
    expect(t).toContain('415 kcal');
    expect(t).toContain('3 drinks');
    expect(t).toContain('40 g alcohol');
    expect(t).toContain('Beer 290 kcal');
    expect(t).toContain('2.75 L of water');
    expect(html).toContain('aria-label="Remove one Beer"');
    expect(html).toContain('aria-label="Add one Wine"');
    expect(t).not.toContain('Nothing yet');
  });

  it('uses the singular for one drink', () => {
    expect(text(render({ tab: 'tonight', counts: { shot: 1 }, glasses: 0 }, NOW))).toContain(
      '1 drink ',
    );
  });

  it('marks the active tab', () => {
    const html = render({ tab: 'tonight', counts: {}, glasses: 0 }, NOW);
    expect(html).toMatch(/data-tab="tonight" data-key="tab-tonight" aria-current="page"/);
    expect(html).not.toMatch(/data-tab="tomorrow" data-key="tab-tomorrow" aria-current/);
  });
});

describe('render: tomorrow', () => {
  it('shows target, progress and glasses', () => {
    const html = render({ tab: 'tomorrow', counts: { beer: 2, wine: 1 }, glasses: 4 }, NOW);
    const t = text(html);
    expect(t).toContain('Tomorrow · Sat 31 Oct');
    expect(t).toContain('2.75 L');
    expect(t).toContain('11 glasses of 250 ml');
    expect(t).toContain('4 of 11 glasses');
    expect(t).toContain('1.75 L to go');
    expect(t).toContain("each of last night's 3 drinks");
    expect(html.match(/data-glass="full"/g)).toHaveLength(4);
    expect(html.match(/data-glass="empty"/g)).toHaveLength(7);
    expect(html).toContain('style="width: 36%"');
    expect(html).toContain('aria-valuenow="4"');
  });

  it('disables undo at zero and drinking once the target is met', () => {
    const empty = render({ tab: 'tomorrow', counts: {}, glasses: 0 }, NOW);
    expect(empty).toMatch(/data-action="undoGlass"[^>]*\sdisabled(?=\s|>)/);
    expect(empty).not.toMatch(/data-action="drinkGlass"[^>]*\sdisabled(?=\s|>)/);

    const done = render({ tab: 'tomorrow', counts: { shot: 1 }, glasses: 9 }, NOW);
    expect(done).toMatch(/data-action="drinkGlass"[^>]*\sdisabled(?=\s|>)/);
    expect(text(done)).toContain("last night's 1 drink.");
  });

  it('defaults the date to now', () => {
    expect(render({ tab: 'tomorrow', counts: {}, glasses: 0 })).toContain('Tomorrow · ');
  });
});
