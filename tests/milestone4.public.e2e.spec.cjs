const { test, expect } = require('@playwright/test');

const siteUrl = 'https://abidhussain2330.github.io/north-star-bakery-touchstone-3/';
const pageNames = ['products.html', 'about.html', 'contact.html'];

test('deployed North Star Bakery supports the required Touchstone 4 journeys', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(siteUrl, { waitUntil: 'domcontentloaded' });
    expect(response.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Welcome to North Star Bakery' })).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
  }

  for (const pageName of pageNames) {
    const response = await page.goto(`${siteUrl}${pageName}`, { waitUntil: 'domcontentloaded' });
    expect(response.status()).toBe(200);
    await expect(page.locator('main')).toBeVisible();
  }

  await page.goto(`${siteUrl}products.html`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: /save pastries/i }).click();
  await page.getByRole('button', { name: /save cakes/i }).click();
  await expect(page.locator('#favorite-status')).toHaveText('Saved favorites: Pastries and Cakes.');
  await page.reload();
  await expect(page.getByRole('button', { name: /pastries saved/i })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /pastries saved/i }).click();
  await expect(page.locator('#favorite-status')).toHaveText('Saved favorites: Cakes.');

  await page.goto(`${siteUrl}contact.html`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('northStarBakeryContactDetails'));
  await page.reload();
  await page.getByLabel('Full Name').fill('A');
  await page.getByLabel('Email Address').fill('invalid');
  await page.locator('#item-details').fill('cake');
  await page.getByRole('button', { name: 'Send Request' }).click();
  await expect(page.locator('#name-error')).toHaveText(/at least 2 characters/i);
  await expect(page.locator('#email-error')).toHaveText(/valid email address/i);
  await expect(page.locator('#pickup-date-error')).toHaveText(/choose a pickup date/i);
  await expect(page.locator('#request-type-error')).toHaveText(/choose a request type/i);
  await expect(page.locator('#item-details-error')).toHaveText(/at least 5 characters/i);

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

  expect(pageErrors).toEqual([]);
});
