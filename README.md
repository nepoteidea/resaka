# Resaka

A drink tracker for the night out and the morning after. Log what you drink with one tap to see
calories and grams of alcohol. Then see how much water to drink tomorrow, and tick it off glass by
glass. Tracks [NEP-24](https://linear.app/nepoteidea/issue/NEP-24), built from the v1 prototype
in Claude Design (phone, 390×844).

Live at **https://resaka.nepoteidea.com** (deployed from `main`).

## How it works

- **Tonight:** six buttons for standard servings: beer (330 ml · 5%), wine (150 ml · 12%),
  cocktail (200 ml · 12%), shot (40 ml · 40%), long drink (250 ml · 8%) and cider
  (330 ml · 4.5%). Each logged drink gets a row with − / + buttons. The header shows total kcal,
  drink count and grams of alcohol (`ml × ABV × 0.789`).
- **Tomorrow:** the water target is a 2.0 L daily base plus 250 ml per drink, counted in 250 ml
  glasses, with a progress bar and an undo button.
- Everything is stored in `localStorage` on the device, so a reload or the next morning keeps
  the log. **Reset** clears it. There's no account and no server.
- Calorie values are typical estimates for each serving, not derived from ABV alone.

## Code

Plain JavaScript (ES modules) and Tailwind CSS v4, built with Vite. No framework, no runtime
dependencies.

| File            | What it does                                                          |
| --------------- | --------------------------------------------------------------------- |
| `src/drinks.js` | Drink catalogue, totals, water plan, litre formatting                 |
| `src/state.js`  | Pure state transitions, plus `localStorage` load/save with validation |
| `src/view.js`   | Renders the screen to an HTML string (Tailwind classes)               |
| `src/main.js`   | DOM wiring: click delegation, persistence, focus restore              |
| `src/style.css` | Tailwind import and the prototype's color/font tokens (`@theme`)      |

## Development

```sh
npm install
npm run dev            # local dev server
npm run lint           # ESLint
npm run format:check   # Prettier
npm test               # Vitest unit tests (npm run test:coverage for coverage)
npx playwright install chromium
npm run test:e2e       # Playwright: desktop and phone
```

## Deployment

Cloudflare Workers (static assets), configured in `wrangler.jsonc`. GitHub Actions deploys
`main` to production and uploads every pull request as a preview version, then comments the
preview URL on the PR. Credentials come from the nepoteidea org:
`secrets.CLOUDFLARE_API_TOKEN` and `vars.CLOUDFLARE_ACCOUNT_ID`.

To watch the Worker's logs live: `npx wrangler tail resaka`.
