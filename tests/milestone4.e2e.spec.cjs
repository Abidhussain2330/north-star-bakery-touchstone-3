const path = require('node:path');
const { test, expect } = require('@playwright/test');

const workspace = path.resolve(__dirname, '..');
const fileUrl = (fileName) => `file:///${path.join(workspace, fileName).replace(/\\/g, '/')}`;

test('favorites persist, restore, and can be removed in the browser', async ({ page }) => {
  await page.goto(fileUrl('products.html'));
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#favorite-status')).toHaveText('No favorites saved yet.');

  await page.getByRole('button', { name: /save pastries/i }).click();
  await page.getByRole('button', { name: /save cakes/i }).click();
  await expect(page.locator('#favorite-status')).toHaveText('Saved favorites: Pastries and Cakes.');
  await expect(page.getByRole('button', { name: /pastries saved/i })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#favorites-feature').screenshot({ path: path.join(workspace, 'Touchstone_4_Screenshot_1_Favorites.png') });

  await page.reload();
  await expect(page.locator('#favorite-status')).toHaveText('Saved favorites: Pastries and Cakes.');
  await page.getByRole('button', { name: /pastries saved/i }).click();
  await expect(page.locator('#favorite-status')).toHaveText('Saved favorites: Cakes.');
});

test('form validation and saved contact details work as a local demonstration', async ({ page }) => {
  await page.goto(fileUrl('contact.html'));
  await page.evaluate(() => localStorage.removeItem('northStarBakeryContactDetails'));
  await page.reload();
  await page.getByLabel('Full Name').fill('A');
  await page.getByLabel('Email Address').fill('invalid-email');
  await page.locator('#item-details').fill('cake');
  await page.getByRole('button', { name: 'Send Request' }).click();
  await expect(page.locator('#name-error')).toHaveText(/at least 2 characters/i);
  await expect(page.locator('#email-error')).toHaveText(/valid email address/i);
  await expect(page.locator('#item-details-error')).toHaveText(/at least 5 characters/i);
  await page.locator('fieldset').first().screenshot({ path: path.join(workspace, 'Touchstone_4_Screenshot_2_Validation.png') });

  await page.getByLabel('Full Name').fill('Taufiq Uddin');
  await page.getByLabel('Email Address').fill('taufiq@example.com');
  await page.locator('#pickup-date').fill('2026-10-20');
  await page.locator('#preorder').check();
  await page.locator('#item-details').fill('One chocolate celebration cake for eight guests.');
  await page.getByRole('button', { name: 'Send Request' }).click();
  await expect(page.locator('#form-status')).toHaveText(/validated locally.*No order was sent/i);
  await page.reload();
  await expect(page.getByLabel('Full Name')).toHaveValue('Taufiq Uddin');
  await expect(page.getByLabel('Email Address')).toHaveValue('taufiq@example.com');
  await expect(page.locator('#form-status')).toHaveText(/welcome back/i);
  await page.locator('form').screenshot({ path: path.join(workspace, 'Touchstone_4_Screenshot_3_Storage.png') });
});
