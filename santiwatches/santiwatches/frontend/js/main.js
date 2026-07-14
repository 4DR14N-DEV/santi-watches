/**
 * js/main.js
 *
 * Punto de entrada del frontend. Importa todos los módulos
 * y orquesta el arranque.
 */

import { SantiAnimations } from './animations.js';
import { SantiAuth } from './auth.js';
import { SantiWatches } from './watches.js';

document.addEventListener('DOMContentLoaded', () => {
  SantiAnimations.playIntro();
  SantiAuth.checkExistingSession();
  SantiWatches.loadWatches();
});

document.getElementById('heroCta').addEventListener('click', (event) => {
  event.preventDefault();
  const target = document.getElementById('coleccion');
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
