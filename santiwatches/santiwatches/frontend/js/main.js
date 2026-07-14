/**
 * js/main.js
 *
 * Punto de entrada del frontend. Orquesta el orden de arranque:
 * 1. Reproduce la intro (preloader + hero) inmediatamente, para que
 *    la animación no espere a la red.
 * 2. En paralelo, revisa si hay sesión de admin y carga los relojes.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    SantiAnimations.playIntro();
    SantiAuth.checkExistingSession();
    SantiWatches.loadWatches();
  });

  // Suaviza el scroll al hacer clic en "Ver la colección".
  document.getElementById('heroCta').addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.getElementById('coleccion');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
