/**
 * js/animations.js
 *
 * Coreografía de GSAP: intro, revealCard, pulseCard, revealFab.
 * Ahora es un módulo ES.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  gsap.globalTimeline.timeScale(50);
}

/* ============ HERO VIDEO SLIDESHOW ============ */

const heroVideos = document.querySelectorAll('.hero__video');
let currentVideoIndex = 0;
let slideshowInterval = null;

function startSlideshow() {
  if (heroVideos.length <= 1) return;

  slideshowInterval = setInterval(() => {
    const prev = heroVideos[currentVideoIndex];
    currentVideoIndex = (currentVideoIndex + 1) % heroVideos.length;
    const next = heroVideos[currentVideoIndex];

    prev.classList.remove('hero__video--active');
    next.classList.add('hero__video--active');
    next.play().catch(() => {});
  }, 5000);
}

function stopSlideshow() {
  clearInterval(slideshowInterval);
}

function initHeroVideoScrollFade() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  gsap.to('.hero__bg', {
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  gsap.to('.hero__overlay', {
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '60% top',
      scrub: true,
    },
  });
}

/* ============ DIVISORIO DECORATIVO ============ */

function initDivider() {
  const divider = document.querySelector('.divider');
  if (!divider) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: divider,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });

  tl.to('.divider__line--left', {
    opacity: 1,
    scaleX: 1,
    duration: 0.8,
    ease: 'power2.out',
  })
    .to(
      '.divider__line--right',
      {
        opacity: 1,
        scaleX: 1,
        duration: 0.8,
        ease: 'power2.out',
      },
      '<'
    )
    .to(
      '.divider__diamond',
      {
        scale: 1,
        rotation: 45,
        duration: 0.5,
        ease: 'back.out(1.7)',
      },
      '-=0.4'
    );
}

/* ============ COLECCIÓN: PARALLAX + GLOW ============ */

function initCollectionEffects() {
  const collection = document.querySelector('.collection');
  if (!collection) return;

  gsap.from('.collection__header', {
    y: 40,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: collection,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });

  gsap.to('.collection__glow', {
    opacity: 1,
    duration: 1.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: collection,
      start: 'top 70%',
      toggleActions: 'play none none none',
    },
  });

  gsap.to('.collection__glow', {
    y: -60,
    ease: 'none',
    scrollTrigger: {
      trigger: collection,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
}

export function playIntro() {
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
    .from('.header', { y: -30, opacity: 0, duration: 0.6 }, '-=0.3')
    .from('.hero__eyebrow', { y: 20, opacity: 0, duration: 0.6 }, '-=0.2')
    .from('.hero__title', { y: 30, opacity: 0, duration: 0.8 }, '-=0.45')
    .from('.hero__subtitle', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
    .from('#heroCta', { y: 20, opacity: 0, duration: 0.5 }, '-=0.35')
    .from('.hero__scroll-cue', { opacity: 0, duration: 0.5 }, '-=0.2');

  gsap.to('.hero__hand line', {
    rotate: 360,
    duration: 60,
    repeat: -1,
    ease: 'none',
    transformOrigin: '200px 200px',
  });

  gsap.to('.hero__scroll-cue span', {
    top: '100%',
    duration: 1.6,
    repeat: -1,
    ease: 'power1.inOut',
  });

  // Iniciar slideshow de videos y fade al scroll
  heroVideos[0]?.play().catch(() => {});
  startSlideshow();
  initHeroVideoScrollFade();
  initDivider();
  initCollectionEffects();
}

export function revealCard(cardEl, index) {
  gsap.fromTo(
    cardEl,
    { y: 60, opacity: 0, scale: 0.95 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
      delay: (index % 6) * 0.1,
      scrollTrigger: {
        trigger: cardEl,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    }
  );
}

export function pulseCard(cardEl) {
  gsap.fromTo(
    cardEl,
    { scale: 0.97 },
    { scale: 1, duration: 0.4, ease: 'back.out(2)' }
  );
}

export function revealFab(fabEl) {
  gsap.fromTo(
    fabEl,
    { scale: 0, rotate: -90 },
    { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(1.7)' }
  );
}

export function removeCard(cardEl) {
  return gsap.to(cardEl, {
    opacity: 0,
    scale: 0.9,
    y: -20,
    duration: 0.4,
    ease: 'power2.in',
  });
}

export const SantiAnimations = { playIntro, revealCard, pulseCard, revealFab, removeCard };
