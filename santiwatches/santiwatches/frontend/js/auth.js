/**
 * js/auth.js
 *
 * Login/logout y modo administrador.
 * Ahora es un módulo ES.
 */

import { SantiAPI } from './api.js';
import { SantiUI } from './ui.js';
import { SantiAnimations } from './animations.js';

const loginTrigger = document.getElementById('loginTrigger');
const loginTriggerLabel = document.getElementById('loginTriggerLabel');
const loginOverlay = document.getElementById('loginOverlay');
const loginClose = document.getElementById('loginClose');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const fabAdd = document.getElementById('fabAdd');

let isAdmin = false;

function setAdminMode(active) {
  isAdmin = active;
  document.body.classList.toggle('is-admin', active);
  loginTriggerLabel.textContent = active ? 'Cerrar sesión' : 'Ingresar';
  fabAdd.hidden = !active;

  if (active) {
    SantiAnimations.revealFab(fabAdd);
  }
}

export function isAdminMode() {
  return isAdmin;
}

export async function checkExistingSession() {
  try {
    await SantiAPI.auth.me();
    setAdminMode(true);
  } catch (_) {
    setAdminMode(false);
  }
}

function showLoginError(message) {
  loginError.textContent = message;
  loginError.hidden = false;
}

function hideLoginError() {
  loginError.hidden = true;
  loginError.textContent = '';
}

loginTrigger.addEventListener('click', async () => {
  if (isAdmin) {
    try {
      await SantiAPI.auth.logout();
      setAdminMode(false);
      SantiUI.showToast('Sesión cerrada correctamente.');
    } catch (err) {
      SantiUI.showToast(err.message, 'error');
    }
    return;
  }

  hideLoginError();
  loginForm.reset();
  SantiUI.openModal(loginOverlay);
});

loginClose.addEventListener('click', () => {
  SantiUI.closeModal(loginOverlay);
});

loginOverlay.addEventListener('click', (event) => {
  if (event.target === loginOverlay) {
    SantiUI.closeModal(loginOverlay);
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideLoginError();

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    await SantiAPI.auth.login(username, password);
    setAdminMode(true);
    SantiUI.closeModal(loginOverlay);
    SantiUI.showToast('Bienvenido de nuevo.');
  } catch (err) {
    showLoginError(err.message);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !loginOverlay.hidden) {
    SantiUI.closeModal(loginOverlay);
  }
});

export const SantiAuth = { checkExistingSession, isAdminMode };
