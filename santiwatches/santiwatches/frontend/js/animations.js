/**
 * js/animations.js
 *
 * Toda la coreografía de GSAP vive aquí, separada de la lógica de
 * negocio (auth.js, watches.js). Se apoya en ScrollTrigger para las
 * revelaciones de las cards al hacer scroll.
 *
 * Respeta prefers-reduced-motion: si el usuario lo activa, GSAP usa
 * un contexto con duraciones mínimas (ver initReducedMotionGuard).
 */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    gsap.globalTimeline.timeScale(50); // todo casi instantáneo.
  }

  /**
   * Secuencia de entrada: preloader -> header -> hero.
   * La manecilla del preloader gira una vez antes de desvanecerse,
   * como si el reloj "arrancara" al abrir la página.
   */
  function playIntro() {
    const preloader = document.getElementById('preloader');
    const hand = preloader.querySelector('.preloader__hand');

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
    });

    tl.to(hand, {
      rotate: 360,
      duration: 0.9,
      ease: 'power2.inOut',
      transformOrigin: 'top center',
    })
      .to(preloader, {
        opacity: 0,
        duration: 0.5,
        onComplete() {
          preloader.style.display = 'none';
        },
      })
      .from(
        '.header',
        { y: -30, opacity: 0, duration: 0.6 },
        '-=0.3'
      )
      .from(
        '.hero__eyebrow',
        { y: 20, opacity: 0, duration: 0.6 },
        '-=0.2'
      )
      .from(
        '.hero__title',
        { y: 30, opacity: 0, duration: 0.8 },
        '-=0.45'
      )
      .from(
        '.hero__subtitle',
        { y: 20, opacity: 0, duration: 0.6 },
        '-=0.5'
      )
      .from(
        '#heroCta',
        { y: 20, opacity: 0, duration: 0.5 },
        '-=0.35'
      )
      .from(
        '.hero__scroll-cue',
        { opacity: 0, duration: 0.5 },
        '-=0.2'
      );

    // La manecilla del hero (elemento firma) gira lentamente y sin
    // fin, como un segundero de fondo, muy sutil.
    gsap.to('.hero__hand line', {
      rotate: 360,
      duration: 60,
      repeat: -1,
      ease: 'none',
      transformOrigin: '200px 200px',
    });

    // El indicador de scroll "cae" en bucle.
    gsap.to('.hero__scroll-cue span', {
      top: '100%',
      duration: 1.6,
      repeat: -1,
      ease: 'power1.inOut',
    });
  }

  /**
   * Anima la entrada de una card de reloj individual cuando aparece
   * en el viewport. Se llama por cada card nueva que se inserta en
   * el DOM (ver watches.js -> renderWatches).
   */
  function revealCard(cardEl, index) {
    gsap.fromTo(
      cardEl,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        delay: (index % 6) * 0.06,
        scrollTrigger: {
          trigger: cardEl,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  /**
   * Pequeño "pop" de confirmación cuando una card cambia de estado
   * (se marca como agotada o vuelve a estar disponible).
   */
  function pulseCard(cardEl) {
    gsap.fromTo(
      cardEl,
      { scale: 0.97 },
      { scale: 1, duration: 0.4, ease: 'back.out(2)' }
    );
  }

  /**
   * Anima la aparición del botón flotante de agregar (FAB) cuando
   * el admin inicia sesión.
   */
  function revealFab(fabEl) {
    gsap.fromTo(
      fabEl,
      { scale: 0, rotate: -90 },
      { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(1.7)' }
    );
  }

  window.SantiAnimations = {
    playIntro,
    revealCard,
    pulseCard,
    revealFab,
  };
})();
