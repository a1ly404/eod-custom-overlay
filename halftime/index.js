/**
 * EoD Halftime – Sponsor Display
 * ─────────────────────────────────────────────────────────────────────────
 * Loads sponsor images from /images/sponsor_banner/ by parsing the Jetty
 * directory listing, then builds a continuously-scrolling horizontal strip.
 *
 * Behaviour:
 *   • 0 images  → placeholder text visible, no animation
 *   • 1 image   → centred statically, no animation
 *   • 2+ images → seamless infinite horizontal scroll (right → left)
 *
 * The intermission clock ("TIME TO DERBY") is updated by CRG's built-in
 * sbDisplay/sbTimeString binding; JS only adds the urgency flash at < 30 s.
 *
 * Speed: PIXELS_PER_SECOND px/s (adjust below for slower/faster scroll).
 */

'use strict';

// ── Config ────────────────────────────────────────────────────────────────────

const SPONSOR_PATH      = '/images/sponsor_banner/';
const IMG_EXTS          = /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i;
const PIXELS_PER_SECOND = 80;   // scroll speed — increase for faster slide
const URGENT_THRESHOLD  = 30;   // seconds remaining before clock turns red

// ── Load sponsor images from Jetty directory listing ─────────────────────────

async function loadSponsorImages() {
  try {
    const resp = await fetch(SPONSOR_PATH);
    if (!resp.ok) return [];

    const html  = await resp.text();
    const links = [...html.matchAll(/href="([^"?#]+)"/gi)].map(m => m[1]);

    return links
      .filter(h => IMG_EXTS.test(h))
      // href may be just a filename ("logo.png") or an absolute path
      .map(h => h.startsWith('/') ? h : SPONSOR_PATH + h);
  } catch (_) {
    return [];
  }
}

// ── Build & start the scrolling sponsor strip ─────────────────────────────────

/**
 * Measures the total pixel width of a track element's children
 * (ignoring its own padding/border).
 */
function measureStripWidth(trackEl) {
  // sum of child offsetWidths + gaps
  const children = [...trackEl.children];
  if (!children.length) return 0;
  // Use getBoundingClientRect to get rendered width of each img
  let total = 0;
  const gap  = 80; // must match CSS gap
  children.forEach(c => { total += c.getBoundingClientRect().width; });
  total += gap * (children.length - 1);
  return Math.ceil(total);
}

function buildSponsorStrip(viewportEl, trackEl, images) {
  const placeholder = document.getElementById('sponsorPlaceholder');

  if (!images.length) {
    // Keep placeholder; nothing to animate
    return;
  }

  // Hide placeholder
  if (placeholder) placeholder.classList.add('hidden');

  // ── Inject images ──────────────────────────────────────────────────────────
  const createImg = src => {
    const img   = document.createElement('img');
    img.src     = src;
    img.alt     = '';
    img.className = 'SponsorImg';
    return img;
  };

  if (images.length === 1) {
    // Single sponsor: show centred, static
    trackEl.style.justifyContent = 'center';
    trackEl.style.width          = '100%';
    trackEl.appendChild(createImg(images[0]));
    return;
  }

  // Multiple sponsors: build scrolling strip
  // First pass: add all images so we can measure rendered widths
  images.forEach(src => trackEl.appendChild(createImg(src)));

  // Wait one frame for images to be laid out (sizes may still be 0 until
  // load events, but the DOM is in place; we'll recalculate on first load)
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => startScrollAnimation(trackEl, images, createImg));
  });
}

function startScrollAnimation(trackEl, images, createImg) {
  // Wait for at least the first image to load so we have real dimensions
  const firstImg = trackEl.querySelector('img');
  const doStart  = () => {
    // Measure the natural strip
    const naturalWidth = measureStripWidth(trackEl);
    if (naturalWidth === 0) {
      // Still no dimensions — retry after a short delay
      setTimeout(() => startScrollAnimation(trackEl, images, createImg), 200);
      return;
    }

    // Duplicate strip for seamless loop: append clones
    images.forEach(src => {
      const clone = createImg(src);
      clone.setAttribute('aria-hidden', 'true');
      trackEl.appendChild(clone);
    });

    // Set CSS variables on the track
    //   --slide-dist: how far to translate (= -naturalWidth - gap)
    //   --slide-dur:  seconds to traverse that distance at PIXELS_PER_SECOND px/s
    const gap       = 80; // must match CSS gap
    const slideDist = naturalWidth + gap; // one full strip width + one gap
    const dur       = slideDist / PIXELS_PER_SECOND;

    trackEl.style.setProperty('--slide-dist', `-${slideDist}px`);
    trackEl.style.setProperty('--slide-dur',  `${dur.toFixed(1)}s`);
    trackEl.classList.add('running');
  };

  if (firstImg && firstImg.complete) {
    doStart();
  } else if (firstImg) {
    firstImg.addEventListener('load',  doStart, { once: true });
    firstImg.addEventListener('error', doStart, { once: true }); // don't hang on broken img
  } else {
    doStart();
  }
}

// ── Clock urgency flash ───────────────────────────────────────────────────────

function applyUrgency(text) {
  const match = text.match(/^(\d+):(\d{2})$/);
  if (!match) return;
  const totalSec = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  const el = document.getElementById('intermissionClock');
  if (el) el.classList.toggle('urgent', totalSec > 0 && totalSec <= URGENT_THRESHOLD);
}

function watchClock() {
  const el = document.getElementById('intermissionClock');
  if (!el) return;
  const obs = new MutationObserver(() => applyUrgency(el.textContent.trim()));
  obs.observe(el, { characterData: true, subtree: true, childList: true });
}

// ── CRG WebSocket init ────────────────────────────────────────────────────────

WS.AfterLoad(async function () {
  watchClock();

  const viewportEl = document.getElementById('sponsorViewport');
  const trackEl    = document.getElementById('sponsorTrack');
  const images     = await loadSponsorImages();

  buildSponsorStrip(viewportEl, trackEl, images);
});
