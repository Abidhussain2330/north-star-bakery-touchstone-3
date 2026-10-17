const path = require('node:path');
const { test, expect } = require('@playwright/test');

const workspace = path.resolve(__dirname, '..');
const fileUrl = (fileName) => `file:///${path.join(workspace, fileName).replace(/\\/g, '/')}`;

test('favorites, validation, and saved contact details work in the browser', async ({ page }) => {
  await page.goto(fileUrl('products.html'));
  await page.getByRole('button', { name: /save pastries/i }).click();
  await expect(page.locator('#favorite-status')).toHaveText('Saved favorites: Pastries.');
  await page.screenshot({ path: path.join(workspace, 'Touchstone_4_Screenshot_1_Favorites.png'), fullPage: true });

  await page.goto(fileUrl('contact.html'));
  await page.getByLabel('Full Name').fill('A');
  await page.getByLabel('Email Address').fill('invalid-email');
  await page.locator('#item-details').fill('cake');
  await page.getByRole('button', { name: 'Send Request' }).click();
  await expect(page.locator('#name-error')).toHaveText(/at least 2 characters/i);
  await expect(page.locator('#email-error')).toHaveText(/valid email address/i);
  await expect(page.locator('#item-details-error')).toHaveText(/at least 5 characters/i);
  await page.screenshot({ path: path.join(workspace, 'Touchstone_4_Screenshot_2_Validation.png'), fullPage: true });

  await page.getByLabel('Full Name').fill('Taufiq Uddin');
  await page.getByLabel('Email Address').fill('taufiq@example.com');
  await page.locator('#pickup-date').fill('2026-10-20');
  await page.locator('#preorder').check();
  await page.locator('#item-details').fill('One chocolate celebration cake for eight guests.');
  await page.getByRole('button', { name: 'Send Request' }).click();
  await expect(page.locator('#form-status')).toHaveText(/name and email are saved for next time/i);
  await page.reload();
  await expect(page.getByLabel('Full Name')).toHaveValue('Taufiq Uddin');
  await expect(page.getByLabel('Email Address')).toHaveValue('taufiq@example.com');
  await expect(page.locator('#form-status')).toHaveText(/welcome back/i);
  await page.screenshot({ path: path.join(workspace, 'Touchstone_4_Screenshot_3_Storage.png'), fullPage: true });
});
