/* ============================================================================
   MOTION SYSTEM
   ============================================================================
   One place decides how everything moves, so the page reads as a single
   continuous direction rather than a pile of separate effects.

   Three rules the whole system obeys:

   1. Hidden states are set by JS, never by CSS. If this file never runs, the
      page renders complete and readable. Nothing can be trapped invisible.
   2. `prefers-reduced-motion` exits before a single tween is created. The CSS
      companion in global.css pins everything to its resting state, so the
      static alternative is the full page, not a degraded one.
   3. Curves come from tokens, never from a default. `ease-in-out` appears
      nowhere. `EASE.signature` is the curve the WordPress site already used on
      its portfolio gallery, which is what keeps the new motion on-brand.
   ========================================================================= */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/** Curves, mirrored from the `--ease-*` tokens in theme.css. */
export const EASE = {
  signature: 'power2.inOut', // cubic-bezier(.65,0,.35,1) equivalent
  entrance: 'expo.out', // cubic-bezier(.16,1,.3,1)
  exit: 'expo.in',
  soft: 'power2.out',
  overshoot: 'back.out(1.7)',
  hero: 'power4.out', // the curve the current hero already uses
} as const;

export const DURATION = {
  micro: 0.3,
  layout: 0.6,
  media: 0.8,
  reveal: 1.2,
} as const;

export const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Coarse pointer / small viewport — animations adapt rather than switch off. */
const isCompact = () => window.matchMedia('(max-width: 767px)').matches;

let lenis: Lenis | null = null;
let ctx: gsap.Context | null = null;
let tickerFn: ((time: number) => void) | null = null;
/** Removes the delegated anchor listener on teardown. */
let anchorAbort: AbortController | null = null;

/* ---------------------------------------------------------------------------
   Smooth scroll
   ------------------------------------------------------------------------ */

function initLenis() {
  lenis = new Lenis({
    lerp: isCompact() ? 0.15 : 0.09,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
    smoothWheel: true,
    // Never smooth touch scrolling: it fights the platform and hurts a11y.
    syncTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  tickerFn = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);

  bindAnchors();
}

function findHash(hash: string): HTMLElement | null {
  if (!hash || hash === '#') return null;
  try {
    return document.querySelector<HTMLElement>(hash);
  } catch {
    return null; // not a valid selector
  }
}

/** Real height of the fixed header, so jumps never land underneath it. */
function headerOffset() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  return (header?.offsetHeight ?? 72) + 16;
}

function landOn(target: HTMLElement) {
  // Keyboard users must land with focus on the destination.
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

/**
 * In-page jump, dressed as the same transition used between pages.
 *
 * A long smooth scroll was the wrong answer for the nav. It travelled through
 * every section on the way, it took two seconds, and it dragged the reader
 * straight through the pinned Team track — engaging and releasing the pin
 * mid-flight, which is the "weird bug" on that link specifically. Worse, it
 * looked nothing like the transition you get moving between pages.
 *
 * So the jump is instant and hidden behind the same dissolve: main fades out,
 * the scroll position changes while nothing is visible, main fades back in.
 * Clicking Team from the home page and clicking it from /contact/ now produce
 * the same gesture.
 *
 * Only `opacity` is animated — a transform on <main> would make it the
 * containing block for the pinned track's `position: fixed` and break the pin.
 */
function jumpToHash(hash: string) {
  const target = findHash(hash);
  if (!target) return false;

  const main = document.getElementById('main');
  if (!main || !lenis) {
    target.scrollIntoView();
    landOn(target);
    return true;
  }

  gsap
    .timeline()
    .to(main, { opacity: 0, duration: 0.24, ease: EASE.exit })
    .add(() => {
      // Order matters, and getting it wrong is what made the nav need two
      // clicks: refreshing AFTER the jump re-measures the pin spacers, the
      // layout shifts, and the position we just scrolled to is no longer where
      // the section sits. Refresh first, then measure, then scroll — and scroll
      // to a resolved number so nothing can re-measure underneath us.
      ScrollTrigger.refresh();
      const y = target.getBoundingClientRect().top + window.scrollY - headerOffset();
      lenis?.scrollTo(y, { immediate: true });
      landOn(target);
    })
    .to(main, { opacity: 1, duration: 0.42, ease: EASE.entrance });

  return true;
}

/** Used when arriving with a hash already in the URL — no dissolve needed. */
function settleOnHash(hash: string) {
  const target = findHash(hash);
  if (!target) return false;
  lenis?.scrollTo(target, { offset: -80, immediate: true });
  landOn(target);
  return true;
}

/**
 * In-page anchors go through Lenis so the easing matches the rest of the page.
 *
 * Delegated rather than bound per link, because the nav lives in a persisted
 * header and the rest of the DOM is swapped by View Transitions.
 *
 * The pathname check is the important part. Nav hashes are absolute (`/#about`)
 * so they mean the same destination from any page: on the home page this
 * intercepts and scrolls, and from /contact/ it does nothing and lets the
 * router navigate to home — where the hash is picked up on load below.
 */
function bindAnchors() {
  anchorAbort = new AbortController();
  const samePath = (a: string, b: string) => a.replace(/\/+$/, '') === b.replace(/\/+$/, '');

  document.addEventListener(
    'click',
    (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as Element | null)?.closest?.('a');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      if (!url.hash || url.hash === '#') return;
      if (!samePath(url.pathname, location.pathname)) return;

      if (jumpToHash(url.hash)) {
        e.preventDefault();
        history.replaceState(null, '', url.hash);
      }
    },
    { signal: anchorAbort.signal },
  );

  // Arriving with a hash — from another page, or from a shared link. The page
  // transition has already covered the change, so this just lands.
  if (location.hash) {
    requestAnimationFrame(() => settleOnHash(location.hash));
  }
}

/**
 * Overlays freeze the page behind them by dispatching `overlay:open` /
 * `overlay:close` on the document. Going through events rather than an exported
 * function keeps the menu and search components free of any import from this
 * module — they stay plain DOM code and pull in none of GSAP.
 */
function bindOverlayLock() {
  document.addEventListener('overlay:open', () => lenis?.stop());
  document.addEventListener('overlay:close', () => lenis?.start());
}

/* ---------------------------------------------------------------------------
   Text splitting
   ------------------------------------------------------------------------ */

/**
 * Splits an element's text into per-character spans for the hero reveal.
 * Callers are responsible for keeping the text accessible — Hero.astro hides
 * the visual lines from assistive tech and exposes the sentence separately.
 * Words stay intact in their own inline-block so wrapping still works.
 */
function splitChars(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? '';
  el.textContent = '';

  const chars: HTMLElement[] = [];
  for (const word of text.split(' ')) {
    const wordEl = document.createElement('span');
    wordEl.className = 'inline-block whitespace-nowrap';
    for (const ch of word) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      wordEl.appendChild(span);
      chars.push(span);
    }
    el.appendChild(wordEl);
    el.appendChild(document.createTextNode(' '));
  }
  return chars;
}

/** Wraps each block child in an overflow-hidden line box for mask reveals. */
function wrapLines(el: HTMLElement) {
  const inner = document.createElement('span');
  inner.append(...Array.from(el.childNodes));
  el.textContent = '';
  el.classList.add('line-mask');
  el.appendChild(inner);
  return inner;
}

/* ---------------------------------------------------------------------------
   The animations
   ------------------------------------------------------------------------ */

/**
 * Hero — per-character rise with a slight roll.
 * Ported from the Slider Revolution layer config that runs today:
 * `d:5; y:50%; o:0; rZ:-5deg` → `e:power4.out; d:3`, 1200ms, 490ms delay.
 */
function heroReveal(delay = 0.25) {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  // Both compositions of the headline are in the DOM, one per breakpoint.
  // Only animate the one actually on screen — splitting characters inside a
  // `display: none` block measures nothing and would leave the hidden set in a
  // half-animated state if the viewport later crossed the breakpoint.
  //
  // Lines are in document order regardless of which treatment they get, so the
  // timeline offsets stay in step with what the reader sees.
  const lines = Array.from(
    hero.querySelectorAll<HTMLElement>('[data-hero-line], [data-hero-block]'),
  ).filter((el) => el.offsetParent !== null);
  if (!lines.length) return;

  const tl = gsap.timeline({ delay });

  lines.forEach((line, i) => {
    // Gradient-filled lines rise whole: splitting them into per-character
    // spans would break `background-clip: text`.
    if (line.hasAttribute('data-hero-block')) {
      const inner = line.firstElementChild ?? line;
      tl.fromTo(
        inner,
        { yPercent: 105 },
        { yPercent: 0, duration: DURATION.reveal, ease: EASE.hero },
        i * 0.09,
      );
      return;
    }

    const chars = splitChars(line);
    tl.fromTo(
      chars,
      { yPercent: 50, opacity: 0, rotate: -5 },
      {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        duration: DURATION.reveal,
        ease: EASE.hero,
        stagger: { each: isCompact() ? 0.014 : 0.022, from: 'start' },
      },
      i * 0.09,
    );
  });

  // The rest of the hero furniture trails the headline.
  const trail = hero.querySelectorAll<HTMLElement>('[data-hero-trail]');
  if (trail.length) {
    tl.fromTo(
      trail,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: DURATION.media, ease: EASE.entrance, stagger: 0.08 },
      '-=0.8',
    );
  }
}

/**
 * Clip-path reveals — the house style for photography.
 * The frame wipes open while the image inside settles from a slight zoom, so
 * the picture feels like it arrives rather than appears.
 */
function clipReveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal="clip"]').forEach((el) => {
    const img = el.querySelector('img');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });

    tl.fromTo(
      el,
      { clipPath: 'inset(0 0 100% 0)' },
      { clipPath: 'inset(0 0 0% 0)', duration: DURATION.media, ease: EASE.entrance },
    );

    if (img) {
      tl.fromTo(
        img,
        { scale: 1.18 },
        { scale: 1, duration: 1.1, ease: EASE.entrance },
        0,
      );
    }
  });
}

/** Chained rise reveals — the connective tissue between sections. */
function riseReveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal="rise"]').forEach((el) => {
    const targets = el.children.length ? Array.from(el.children) : [el];
    gsap.fromTo(
      targets,
      { y: isCompact() ? 24 : 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: DURATION.media,
        ease: EASE.entrance,
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      },
    );
  });
}

/** Line-masked headings — each line slides up out of its own box. */
function lineReveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    const lines = Array.from(el.querySelectorAll<HTMLElement>('[data-line]'));
    const inners = lines.map(wrapLines);
    gsap.fromTo(
      inners,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: DURATION.reveal,
        ease: EASE.entrance,
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    );
  });
}

/**
 * Layered parallax. Replaces the theme's `--trx-addons-parallax-*` behaviour.
 * Depth is reduced rather than removed on small screens, so the layering still
 * reads on a phone without the elements drifting off-canvas.
 */
function parallaxLayers() {
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const depth = parseFloat(el.dataset.parallax || '0.2');
    const scale = isCompact() ? 0.45 : 1;
    const shift = 120 * depth * scale;

    gsap.fromTo(
      el,
      { y: -shift },
      {
        y: shift,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-parallax-scope]') ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      },
    );
  });
}

/** Slow zoom on photography as it travels through the viewport. */
function scrollZoom() {
  gsap.utils.toArray<HTMLElement>('[data-scroll-zoom]').forEach((el) => {
    const img = el.querySelector('img');
    if (!img) return;
    gsap.fromTo(
      img,
      { scale: 1 },
      {
        scale: 1.12,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      },
    );
  });
}

/**
 * The letters carousel. Runs on a GSAP timeline rather than a CSS keyframe so
 * scroll velocity can lean into it — the strip speeds up and skews slightly
 * with the page, which is what stops it feeling like a detached loop.
 */
function marquees() {
  gsap.utils.toArray<HTMLElement>('[data-marquee]').forEach((el) => {
    const track = el.querySelector<HTMLElement>('[data-marquee-track]');
    if (!track) return;

    const speed = parseFloat(el.dataset.marquee || '11');
    const reverse = el.dataset.marqueeReverse !== undefined;
    const distance = track.scrollWidth / 2;
    if (!distance) return;

    const tween = gsap.fromTo(
      track,
      { x: reverse ? -distance : 0 },
      {
        x: reverse ? 0 : -distance,
        duration: distance / (speed * 8),
        ease: 'none',
        repeat: -1,
      },
    );

    // Scroll velocity nudges the speed, then eases back to the base rate.
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const v = gsap.utils.clamp(-3, 3, self.getVelocity() / 900);
        gsap.to(tween, { timeScale: 1 + Math.abs(v), duration: 0.4, overwrite: true });
        gsap.to(track, { skewX: v * -1.2, duration: 0.4, overwrite: 'auto' });
      },
      onLeave: () => gsap.to(tween, { timeScale: 1, duration: 0.6 }),
    });

    // Pause on hover, matching the theme's `bg_text_marquee_hover` option.
    el.addEventListener('pointerenter', () => gsap.to(tween, { timeScale: 0, duration: 0.5 }));
    el.addEventListener('pointerleave', () => gsap.to(tween, { timeScale: 1, duration: 0.5 }));
  });
}

/**
 * The brand stroke as a reading indicator.
 * The logo is one continuous gradient stroke, so the header carries the same
 * stroke and draws it across as the page is read.
 */
function scrollThread() {
  const el = document.querySelector<HTMLElement>('[data-scroll-thread]');
  if (!el) return;

  gsap.fromTo(
    el,
    { width: '0%' },
    {
      width: '100%',
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.35 },
    },
  );
}

/* The header used to retract on scroll-down and return on scroll-up. That is
   gone on purpose. It hid the menu the moment you used it, it fought the
   programmatic jumps, and the transform it animated caused visible jitter at
   the responsive breakpoints. The header is now plainly fixed and always
   visible, styled entirely in Header.astro with no JS involved. */

/**
 * Magnetic hover for buttons and icon links.
 * Pointer-driven only, so it never fires on touch, and it resets on blur so a
 * keyboard user never sees a control drifting off its focus ring.
 */
function magnetic() {
  if (window.matchMedia('(hover: none)').matches) return;

  gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || '0.35');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: EASE.soft });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: EASE.soft });

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    });

    const reset = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointerleave', reset);
    el.addEventListener('blur', reset);
  });
}

/**
 * Pinned horizontal run.
 * The section sticks and its track scrubs sideways, so the portraits get the
 * full height of the viewport instead of a quarter of a grid row. This is the
 * page's one big set-piece — everything else stays quiet around it.
 *
 * Desktop only: pinning fights native touch scrolling, so small screens keep a
 * plain snap carousel, which is what the CSS already provides.
 */
function pinnedRows() {
  if (window.innerWidth < 1024) return;

  gsap.utils.toArray<HTMLElement>('[data-pin-row]').forEach((row) => {
    const track = row.querySelector<HTMLElement>('[data-pin-track]');
    if (!track) return;

    // Measured in a function so ScrollTrigger re-reads it on refresh, after
    // fonts and lazy images have settled.
    const distance = () => Math.max(0, track.scrollWidth - row.clientWidth);
    if (distance() <= 0) return;

    row.classList.add('is-pinned');

    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: row,
        start: 'center center',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  });
}

/**
 * The ink bands unroll.
 * A band opens from its own centre line to full height as it enters, so the
 * switch from the light wall to the dark room reads as a deliberate cut rather
 * than a block of colour scrolling into view.
 */
function bandReveals() {
  gsap.utils.toArray<HTMLElement>('[data-band]').forEach((band) => {
    gsap.fromTo(
      band,
      { clipPath: 'inset(48% 0% 48% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1,
        ease: EASE.entrance,
        scrollTrigger: { trigger: band, start: 'top 92%', once: true },
      },
    );
  });
}

/**
 * Wall labels decode into place.
 * The labels are set in mono and carry capture data — discipline, city, year —
 * so resolving them character by character, like a readout settling, says
 * something about the content instead of just moving it.
 */
function decodeLabels() {
  const GLYPHS = '/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ·';

  gsap.utils.toArray<HTMLElement>('.wall-label span:not(.wall-label__sep)').forEach((el) => {
    const final = el.textContent ?? '';
    if (final.length < 2) return;

    const state = { p: 0 };
    gsap.to(state, {
      p: 1,
      duration: Math.min(1.1, 0.22 + final.length * 0.035),
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 95%', once: true },
      onStart: () => {
        el.style.minWidth = `${el.getBoundingClientRect().width}px`;
      },
      onUpdate: () => {
        const settled = Math.floor(state.p * final.length);
        let out = final.slice(0, settled);
        for (let i = settled; i < final.length; i++) {
          out += final[i] === ' ' ? ' ' : GLYPHS[(Math.floor(state.p * 97) + i * 7) % GLYPHS.length];
        }
        el.textContent = out;
      },
      onComplete: () => {
        el.textContent = final;
        el.style.minWidth = '';
      },
    });
  });
}

/**
 * Opening curtain.
 *
 * An ink panel holds the page for a beat while the brand stroke draws across
 * it, then lifts to hand off directly into the hero's character reveal — one
 * continuous move rather than two separate animations.
 *
 * The panel is only ever shown by the inline script in BaseLayout, which also
 * arms a failsafe timer. If this module never loads, the curtain still lifts.
 * It plays once per session.
 *
 * Returns the timeline so the hero can be scheduled against it.
 */
function introCurtain(): gsap.core.Timeline | null {
  const el = document.querySelector<HTMLElement>('[data-intro-curtain]');
  if (!el || !document.documentElement.hasAttribute('data-intro')) return null;

  const bar = el.querySelector<HTMLElement>('[data-intro-bar]');
  const mark = el.querySelector<HTMLElement>('[data-intro-mark]');

  const finish = () => {
    document.documentElement.removeAttribute('data-intro');
    try {
      sessionStorage.setItem('jpmg-intro', '1');
    } catch {
      /* private mode — the failsafe timer still clears the curtain */
    }
  };

  const tl = gsap.timeline({ onComplete: finish });

  tl.fromTo(mark, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5, ease: EASE.entrance })
    .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.75, ease: 'power2.inOut' }, 0.15)
    .to([mark, bar], { opacity: 0, duration: 0.25, ease: 'none' }, '+=0.05')
    .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.85, ease: EASE.entrance }, '-=0.1');

  return tl;
}

/**
 * A soft brand-coloured light that follows the pointer across the dark bands.
 * Enter/leave is bound to the bands themselves rather than hit-testing on every
 * move, so the cost is two listeners instead of a lookup per frame.
 */
function cursorSpotlight() {
  if (window.matchMedia('(hover: none)').matches) return;

  const el = document.querySelector<HTMLElement>('[data-spotlight]');
  const bands = gsap.utils.toArray<HTMLElement>('.band-ink');
  if (!el || !bands.length) return;

  const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3' });

  window.addEventListener(
    'pointermove',
    (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    },
    { passive: true },
  );

  bands.forEach((band) => {
    band.addEventListener('pointerenter', () =>
      gsap.to(el, { opacity: 1, duration: 0.45, overwrite: 'auto' }),
    );
    band.addEventListener('pointerleave', () =>
      gsap.to(el, { opacity: 0, duration: 0.45, overwrite: 'auto' }),
    );
  });
}

/**
 * The page leans into the scroll.
 * Content blocks take a small skew proportional to scroll velocity and settle
 * back when it stops. Capped at 3 degrees — past that, text starts to shimmer
 * and the effect reads as a broken transform rather than momentum.
 */
function velocitySkew() {
  const targets = gsap.utils.toArray<HTMLElement>('[data-skew]');
  if (!targets.length) return;

  const clamp = gsap.utils.clamp(-3, 3);
  let settle: number | undefined;

  ScrollTrigger.create({
    onUpdate: (self) => {
      const skew = clamp(self.getVelocity() / 420);
      gsap.to(targets, { skewY: skew, duration: 0.3, ease: 'power3', overwrite: true });

      window.clearTimeout(settle);
      settle = window.setTimeout(
        () => gsap.to(targets, { skewY: 0, duration: 0.55, ease: 'power3', overwrite: true }),
        90,
      );
    },
  });
}

/**
 * Ambient drift for the decorative plates, so the light sections are never
 * completely still. Slow, small, and randomised per element and per cycle, so
 * the movement never settles into a visible loop.
 */
function floaters() {
  gsap.utils.toArray<HTMLElement>('[data-float]').forEach((el, i) => {
    gsap.to(el, {
      y: () => gsap.utils.random(-26, 26),
      x: () => gsap.utils.random(-20, 20),
      rotation: () => gsap.utils.random(-7, 7),
      duration: () => gsap.utils.random(5, 9),
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
      delay: i * 0.4,
    });
  });
}

/* ---------------------------------------------------------------------------
   Lifecycle
   ------------------------------------------------------------------------ */

export function initMotion() {
  document.documentElement.classList.remove('no-js');

  // Idempotent on purpose. In dev, HMR re-evaluates this module and fires
  // `astro:page-load` again without a matching teardown; the leftover
  // ScrollTriggers then recurse through refresh and throw
  // "Cannot read properties of undefined (reading 'end')".
  if (ctx) destroyMotion();

  // The static alternative is the finished page. Bail before creating anything.
  if (reducedMotion()) return;

  initLenis();
  bindOverlayLock();

  ctx = gsap.context(() => {
    // The curtain and the hero are one move: the headline starts resolving
    // just before the panel finishes lifting, so there is no dead beat.
    const intro = introCurtain();
    heroReveal(intro ? Math.max(0.25, intro.duration() - 0.7) : 0.25);

    clipReveals();
    riseReveals();
    lineReveals();
    parallaxLayers();
    scrollZoom();
    marquees();
    scrollThread();
    bandReveals();
    decodeLabels();
    pinnedRows();
    cursorSpotlight();
    velocitySkew();
    floaters();
    magnetic();
  });

  // Late-loading images change layout; recalculate once they settle.
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

export function destroyMotion() {
  ctx?.revert();
  ctx = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
  if (tickerFn) gsap.ticker.remove(tickerFn);
  tickerFn = null;
  anchorAbort?.abort();
  anchorAbort = null;
  lenis?.destroy();
  lenis = null;
}

// Tear everything down before HMR swaps this module in dev.
if (import.meta.hot) {
  import.meta.hot.dispose(() => destroyMotion());
}
