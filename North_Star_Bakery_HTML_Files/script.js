'use strict';

const storageKeys = {
  favorites: 'northStarBakeryFavorites',
  contactDetails: 'northStarBakeryContactDetails',
};

const productCategories = [
  { id: 'artisan-breads', name: 'Artisan Breads' },
  { id: 'pastries', name: 'Pastries' },
  { id: 'cakes', name: 'Cakes' },
];

const contactFieldIds = ['name', 'email', 'pickupDate', 'requestType', 'itemDetails'];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePreorder(values) {
  const errors = {};

  if (!values.name || values.name.trim().length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }
  if (!emailPattern.test((values.email || '').trim())) {
    errors.email = 'Enter a valid email address, such as name@example.com.';
  }
  if (!values.pickupDate) {
    errors.pickupDate = 'Please choose a pickup date.';
  }
  if (!values.requestType) {
    errors.requestType = 'Please choose a request type.';
  }
  if (!values.itemDetails || values.itemDetails.trim().length < 5) {
    errors.itemDetails = 'Please include at least 5 characters about your order.';
  }

  return errors;
}

function toggleFavorite(favorites, productId) {
  return favorites.includes(productId)
    ? favorites.filter((favorite) => favorite !== productId)
    : [...favorites, productId];
}

function favoriteStatusMessage(favorites) {
  if (!favorites.length) {
    return 'No favorites saved yet.';
  }

  const names = favorites
    .map((favorite) => productCategories.find((product) => product.id === favorite))
    .filter(Boolean)
    .map((product) => product.name);

  return `Saved favorites: ${names.join(' and ')}.`;
}

function getStoredData(key, fallbackValue) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The page remains usable if browser storage is unavailable.
  }
}

function renderFavorites(container, favorites) {
  container.replaceChildren();

  productCategories.forEach((product) => {
    const button = document.createElement('button');
    const isFavorite = favorites.includes(product.id);

    button.type = 'button';
    button.className = 'favorite-button';
    button.dataset.productId = product.id;
    button.setAttribute('aria-pressed', String(isFavorite));
    button.textContent = isFavorite ? `★ ${product.name} saved` : `☆ Save ${product.name}`;
    container.append(button);
  });
}

function initializeFavorites() {
  const container = document.querySelector('#favorite-options');
  const status = document.querySelector('#favorite-status');

  if (!container || !status) {
    return;
  }

  let favorites = getStoredData(storageKeys.favorites, []);
  favorites = Array.isArray(favorites) ? favorites : [];
  renderFavorites(container, favorites);
  status.textContent = favoriteStatusMessage(favorites);

  container.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-product-id]');
    if (!button) {
      return;
    }

    favorites = toggleFavorite(favorites, button.dataset.productId);
    saveData(storageKeys.favorites, favorites);
    renderFavorites(container, favorites);
    status.textContent = favoriteStatusMessage(favorites);
  });
}

function getPreorderValues(form) {
  return {
    name: form.elements.name.value,
    email: form.elements.email.value,
    pickupDate: form.elements['pickup-date'].value,
    requestType: form.elements['request-type'].value,
    itemDetails: form.elements['item-details'].value,
  };
}

function setFieldError(fieldId, message) {
  const errorElement = document.querySelector(`#${fieldId.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}-error`);
  const input = fieldId === 'requestType'
    ? document.querySelector('input[name="request-type"]')
    : document.querySelector(`#${fieldId.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`);

  if (errorElement) {
    errorElement.textContent = message || '';
  }
  if (input) {
    input.setAttribute('aria-invalid', String(Boolean(message)));
  }
}

function showValidationErrors(errors) {
  contactFieldIds.forEach((fieldId) => setFieldError(fieldId, errors[fieldId]));
}

function restoreContactDetails(form) {
  const details = getStoredData(storageKeys.contactDetails, {});
  if (!details || typeof details !== 'object') {
    return false;
  }

  if (details.name) form.elements.name.value = details.name;
  if (details.email) form.elements.email.value = details.email;
  return Boolean(details.name || details.email);
}

function initializePreorderForm() {
  const form = document.querySelector('form');
  const formStatus = document.querySelector('#form-status');

  if (!form || !formStatus) {
    return;
  }

  if (restoreContactDetails(form)) {
    formStatus.textContent = 'Welcome back! Your saved name and email have been filled in.';
  }

  form.addEventListener('input', (event) => {
    const fieldMap = {
      name: 'name',
      email: 'email',
      'pickup-date': 'pickupDate',
      'item-details': 'itemDetails',
    };
    if (fieldMap[event.target.name]) {
      setFieldError(fieldMap[event.target.name], '');
    }
  });

  form.addEventListener('change', (event) => {
    if (event.target.name === 'request-type') {
      setFieldError('requestType', '');
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = getPreorderValues(form);
    const errors = validatePreorder(values);

    showValidationErrors(errors);
    if (Object.keys(errors).length) {
      formStatus.textContent = 'Please correct the highlighted fields and try again.';
      return;
    }

    saveData(storageKeys.contactDetails, { name: values.name.trim(), email: values.email.trim() });
    formStatus.textContent = 'Thanks! Your request is ready for the bakery to review. Your name and email are saved for next time.';
  });
}

function initializeMilestone4() {
  initializeFavorites();
  initializePreorderForm();
}

const milestone4Api = {
  favoriteStatusMessage,
  getStoredData,
  initializeFavorites,
  initializePreorderForm,
  productCategories,
  storageKeys,
  toggleFavorite,
  validatePreorder,
};

if (typeof module !== 'undefined') {
  module.exports = milestone4Api;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeMilestone4);
}
