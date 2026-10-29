import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('logs drinks and updates totals', async ({ page }) => {
  await expect(page.getByText('Nothing yet. Tap a drink above to log it.')).toBeVisible();

  await page.getByRole('button', { name: /^Beer/ }).click();
  await page.getByRole('button', { name: /^Beer/ }).click();
  await page.getByRole('button', { name: /^Wine/ }).click();

  await expect(page.getByTestId('kcal')).toHaveText('415');
  await expect(page.getByTestId('drinks')).toHaveText('3 drinks');
  await expect(page.getByTestId('grams')).toHaveText('40 g alcohol');
  await expect(page.getByTestId('water-teaser')).toHaveText('2.75 L of water');

  await page.getByRole('button', { name: 'Remove one Beer' }).click();
  await expect(page.getByTestId('kcal')).toHaveText('270');
  await page.getByRole('button', { name: 'Add one Wine' }).click();
  await expect(page.getByTestId('drinks')).toHaveText('3 drinks');
});

test('tracks water on the Tomorrow tab', async ({ page }) => {
  await page.getByRole('button', { name: /^Shot/ }).click();
  await page.getByRole('button', { name: /^Tomorrow, drink/ }).click();

  await expect(page.getByTestId('water-target')).toHaveText('2.25 L');
  await expect(page.getByTestId('glass-count')).toHaveText('0 of 9 glasses');
  await expect(page.getByRole('button', { name: 'Undo last glass' })).toBeDisabled();

  const drink = page.getByRole('button', { name: 'I drank a glass' });
  await drink.click();
  await drink.click();
  await expect(page.getByTestId('glass-count')).toHaveText('2 of 9 glasses');
  await expect(page.getByTestId('left')).toHaveText('1.75 L to go');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');

  await page.getByRole('button', { name: 'Undo last glass' }).click();
  await expect(page.getByTestId('glass-count')).toHaveText('1 of 9 glasses');

  await page.getByRole('navigation').getByRole('button', { name: 'Tonight' }).click();
  await expect(page.getByTestId('kcal')).toHaveText('95');
});

test('keeps state across reloads and resets it', async ({ page }) => {
  await page.getByRole('button', { name: /^Cider/ }).click();
  await page.reload();
  await expect(page.getByTestId('kcal')).toHaveText('170');

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByTestId('kcal')).toHaveText('0');
  await page.reload();
  await expect(page.getByTestId('kcal')).toHaveText('0');
});

test('keeps keyboard focus on the control that was pressed', async ({ page }) => {
  await page.getByRole('button', { name: /^Cocktail/ }).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('kcal')).toHaveText('380');
  await expect(page.getByRole('button', { name: /^Cocktail/ })).toBeFocused();
});

test('fits the screen without horizontal scroll', async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
