/**
 * js/ui.js
 *
 * Utilidades de interfaz reutilizables: notificaciones tipo toast,
 * formateo de precio en pesos colombianos, y apertura/cierre de
 * modales con una pequeña animación GSAP.
 */

(function () {
  'use strict';

  const toastEl = document.getElementById('toast');
  let toastTimeout = null;

  function showToast(message, type = 'success') {
    if (!toastEl) return;

    clearTimeout(toastTimeout);
    toastEl.textContent = message;
    toastEl.classList.toggle('toast--error', type === 'error');
    toastEl.hidden = false;

    gsap.fromTo(
      toastEl,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
    );

    toastTimeout = setTimeout(() => {
      gsap.to(toastEl, {
        y: 20,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete() {
          toastEl.hidden = true;
        },
      });
    }, 3200);
  }

  /**
   * Formatea un número como precio en pesos colombianos.
   * Si price es null/undefined, devuelve null para que quien llama
   * decida mostrar "Disponible bajo consulta".
   */
  function formatPrice(price) {
    if (price === null || price === undefined) return null;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Abre un modal (overlay) con una animación de entrada.
   * @param {HTMLElement} overlay
   */
  function openModal(overlay) {
    if (!overlay) return;
    overlay.hidden = false;
    const modal = overlay.querySelector('.modal');

    gsap.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
    gsap.fromTo(
      modal,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', delay: 0.05 }
    );

    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra un modal con animación de salida.
   * @param {HTMLElement} overlay
   */
  function closeModal(overlay) {
    if (!overlay || overlay.hidden) return;
    const modal = overlay.querySelector('.modal');

    gsap.to(modal, {
      y: 20,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
    });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      delay: 0.05,
      onComplete() {
        overlay.hidden = true;
        document.body.style.overflow = '';
      },
    });
  }

  window.SantiUI = { showToast, formatPrice, openModal, closeModal };
})();
