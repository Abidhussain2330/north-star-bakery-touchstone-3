const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const siteRoot = path.resolve(__dirname, '..');
const milestone4 = require(path.join(siteRoot, 'script.js'));

test('products and contact pages load the shared Milestone 4 script', () => {
  const products = fs.readFileSync(path.join(siteRoot, 'products.html'), 'utf8');
  const contact = fs.readFileSync(path.join(siteRoot, 'contact.html'), 'utf8');

  assert.ok(fs.existsSync(path.join(siteRoot, 'script.js')), 'script.js should exist');
  assert.match(products, /<script\s+src="script\.js"\s+defer><\/script>/, 'Products should load script.js');
  assert.match(contact, /<script\s+src="script\.js"\s+defer><\/script>/, 'Contact should load script.js');
});

test('pre-order validation returns clear errors for invalid customer data', () => {
  assert.equal(typeof milestone4.validatePreorder, 'function', 'validatePreorder should be exported');

  const errors = milestone4.validatePreorder({
    name: 'A',
    email: 'not-an-email',
    pickupDate: '',
    requestType: '',
    itemDetails: 'cake',
  });

  assert.equal(errors.name, 'Please enter your full name (at least 2 characters).');
  assert.equal(errors.email, 'Enter a valid email address, such as name@example.com.');
  assert.equal(errors.pickupDate, 'Please choose a pickup date.');
  assert.equal(errors.requestType, 'Please choose a request type.');
  assert.equal(errors.itemDetails, 'Please include at least 5 characters about your order.');
});

test('favorite toggling adds a product and removes it when selected again', () => {
  assert.equal(typeof milestone4.toggleFavorite, 'function', 'toggleFavorite should be exported');

  const added = milestone4.toggleFavorite(['artisan-breads'], 'pastries');
  const removed = milestone4.toggleFavorite(added, 'pastries');

  assert.deepEqual(added, ['artisan-breads', 'pastries']);
  assert.deepEqual(removed, ['artisan-breads']);
});

test('favorite status message names the saved product categories', () => {
  assert.equal(typeof milestone4.favoriteStatusMessage, 'function', 'favoriteStatusMessage should be exported');

  assert.equal(milestone4.favoriteStatusMessage([]), 'No favorites saved yet.');
  assert.equal(
    milestone4.favoriteStatusMessage(['artisan-breads', 'cakes']),
    'Saved favorites: Artisan Breads and Cakes.'
  );
});

test('pages provide accessible hooks for favorites and inline validation feedback', () => {
  const products = fs.readFileSync(path.join(siteRoot, 'products.html'), 'utf8');
  const contact = fs.readFileSync(path.join(siteRoot, 'contact.html'), 'utf8');

  assert.match(products, /id="favorites-feature"/, 'Products should include the favorites feature');
  assert.match(products, /id="favorite-status"[^>]*aria-live="polite"/, 'Favorites should announce updates');
  assert.match(contact, /id="name-error"[^>]*aria-live="polite"/, 'Name feedback should appear near the field');
  assert.match(contact, /id="email-error"[^>]*aria-live="polite"/, 'Email feedback should appear near the field');
  assert.match(contact, /id="form-status"[^>]*aria-live="polite"/, 'The form should announce its result');
});

test('browser integration uses localStorage and organized initialization functions', () => {
  const script = fs.readFileSync(path.join(siteRoot, 'script.js'), 'utf8');

  assert.match(script, /const contactFieldIds = \[/, 'A second data array should organize form fields');
  assert.match(script, /function initializeFavorites\(/, 'Favorites should use an initialization function');
  assert.match(script, /function initializePreorderForm\(/, 'Form behavior should use an initialization function');
  assert.match(script, /localStorage\.setItem/, 'The feature should save data in localStorage');
  assert.match(script, /localStorage\.getItem/, 'The feature should restore data from localStorage');
  assert.match(script, /DOMContentLoaded/, 'Browser behavior should initialize after the page loads');
});
