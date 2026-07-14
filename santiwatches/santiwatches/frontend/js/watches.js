/**
 * js/watches.js
 *
 * Renderiza la colección y maneja acciones del admin.
 * Ahora es un módulo ES.
 */

import { SantiAPI } from './api.js';
import { SantiUI } from './ui.js';
import { SantiAnimations } from './animations.js';

const grid = document.getElementById('watchGrid');
const emptyState = document.getElementById('collectionEmpty');

const fabAdd = document.getElementById('fabAdd');
const watchOverlay = document.getElementById('watchOverlay');
const watchClose = document.getElementById('watchClose');
const watchForm = document.getElementById('watchForm');
const watchError = document.getElementById('watchError');
const watchImageInput = document.getElementById('watchImage');
const watchImageName = document.getElementById('watchImageName');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function buildCardElement(watch) {
  const card = document.createElement('article');
  card.className = 'watch-card';
  card.dataset.id = watch.id;
  if (watch.is_sold_out) {
    card.classList.add('watch-card--sold-out');
  }

  const formattedPrice = SantiUI.formatPrice(watch.price);
  const priceMarkup = formattedPrice
    ? `<p class="watch-card__price">${formattedPrice}</p>`
    : `<p class="watch-card__price watch-card__price--query">Disponible bajo consulta</p>`;

  card.innerHTML = `
    <div class="watch-card__image-wrap">
      <span class="watch-card__ribbon">Agotado</span>
      <img
        class="watch-card__image"
        src="${watch.image_path}"
        alt="${escapeHtml(watch.name)}"
        loading="lazy"
      />
    </div>
    <div class="watch-card__body">
      <h3 class="watch-card__name">${escapeHtml(watch.name)}</h3>
      <p class="watch-card__description">${escapeHtml(watch.description)}</p>
      ${priceMarkup}
    </div>
    <div class="watch-card__admin-bar">
      <button type="button" class="watch-card__admin-btn" data-action="toggle-sold-out">
        ${watch.is_sold_out ? 'Marcar disponible' : 'Marcar agotado'}
      </button>
    </div>
  `;

  return card;
}

function renderWatches(watches) {
  grid.innerHTML = '';
  emptyState.hidden = watches.length > 0;

  watches.forEach((watch, index) => {
    const card = buildCardElement(watch);
    grid.appendChild(card);
    SantiAnimations.revealCard(card, index);
  });
}

export async function loadWatches() {
  try {
    const { watches } = await SantiAPI.watches.getAll();
    renderWatches(watches);
  } catch (err) {
    SantiUI.showToast(err.message, 'error');
  }
}

grid.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action="toggle-sold-out"]');
  if (!button) return;

  const card = button.closest('.watch-card');
  const id = card.dataset.id;

  button.disabled = true;
  try {
    const { watch } = await SantiAPI.watches.toggleSoldOut(id);
    card.classList.toggle('watch-card--sold-out', Boolean(watch.is_sold_out));
    button.textContent = watch.is_sold_out ? 'Marcar disponible' : 'Marcar agotado';
    SantiAnimations.pulseCard(card);
    SantiUI.showToast(
      watch.is_sold_out ? 'Reloj marcado como agotado.' : 'Reloj marcado como disponible.'
    );
  } catch (err) {
    SantiUI.showToast(err.message, 'error');
  } finally {
    button.disabled = false;
  }
});

function showWatchError(message) {
  watchError.textContent = message;
  watchError.hidden = false;
}

function hideWatchError() {
  watchError.hidden = true;
  watchError.textContent = '';
}

fabAdd.addEventListener('click', () => {
  hideWatchError();
  watchForm.reset();
  watchImageName.textContent = 'Ningún archivo seleccionado';
  SantiUI.openModal(watchOverlay);
});

watchClose.addEventListener('click', () => {
  SantiUI.closeModal(watchOverlay);
});

watchOverlay.addEventListener('click', (event) => {
  if (event.target === watchOverlay) {
    SantiUI.closeModal(watchOverlay);
  }
});

watchImageInput.addEventListener('change', () => {
  const file = watchImageInput.files[0];
  watchImageName.textContent = file ? file.name : 'Ningún archivo seleccionado';
});

watchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideWatchError();

  const formData = new FormData(watchForm);
  const priceValue = formData.get('price');
  if (!priceValue || String(priceValue).trim() === '') {
    formData.delete('price');
  }

  const submitButton = watchForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const { watch } = await SantiAPI.watches.create(formData);

    const card = buildCardElement(watch);
    grid.prepend(card);
    SantiAnimations.revealCard(card, 0);

    emptyState.hidden = true;
    SantiUI.closeModal(watchOverlay);
    SantiUI.showToast('Reloj publicado correctamente.');
  } catch (err) {
    showWatchError(err.message);
  } finally {
    submitButton.disabled = false;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !watchOverlay.hidden) {
    SantiUI.closeModal(watchOverlay);
  }
});

export const SantiWatches = { loadWatches };
