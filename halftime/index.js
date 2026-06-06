/**
 * EoD Halftime – Sponsor Display
 *
 * Sponsor behavior:
 *   - Read sponsor images from CRG media binding in #Banners
 *   - Shuffle once per page load
 *   - Hard-cut to next image every 5 seconds (no animation)
 *   - Apply image sizing classes (wide/tall) like intermission_sponsors.js
 *   - Cycle forever, never stop
 *
 * Clock behavior:
 *   - Intermission clock is CRG-bound via sbContext/sbDisplay/sbClock
 *   - JS adds urgency flash class when <= URGENT_THRESHOLD seconds
 */

;(function () {
'use strict';

if (window.__eodHalftimeInit) {
  return;
}
window.__eodHalftimeInit = true;

const SPONSOR_DURATION_MS = 5000;
const URGENT_THRESHOLD = 30;

let sponsorImages = [];
let sponsorImgIndex = 0;
let rotateTimer = null;

function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    const temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }
  return array;
}

function incrementSponsorImgIndex() {
  if (sponsorImages.length > 1) {
    sponsorImgIndex = (sponsorImgIndex + 1) % sponsorImages.length;
  }
}

function applySizing(imgEl) {
  const parent = imgEl && imgEl.parentElement;
  if (!parent || !imgEl || imgEl.naturalWidth === 0 || imgEl.naturalHeight === 0) return;

  imgEl.classList.remove('wide', 'tall');
  imgEl.style.marginTop = '0px';

  const parentWidth = parent.clientWidth;
  const parentHeight = parent.clientHeight;
  const imageAspect = imgEl.naturalWidth / imgEl.naturalHeight;
  const parentAspect = parentWidth / parentHeight;

  if (parentAspect >= imageAspect) {
    imgEl.classList.add('tall');
  } else {
    imgEl.classList.add('wide');
    const adjustedHeight = (parentWidth / imgEl.naturalWidth) * imgEl.naturalHeight;
    imgEl.style.marginTop = `${(parentHeight - adjustedHeight) / 2}px`;
  }
}

function getBannerSources() {
  return $('#Banners [File]')
    .map(function () { return $(this).attr('src'); })
    .get()
    .filter(src => typeof src === 'string' && src.trim() !== '');
}

function setPlaceholderVisible(visible) {
  const ph = document.getElementById('sponsorPlaceholder');
  if (!ph) return;
  ph.classList.toggle('hidden', !visible);
}

function hardCutToNextImage(currentImg) {
  // Hard cut: directly swap src and reapply sizing, no animation
  applySizing(currentImg);
}

function scheduleNextRotation(currentImg) {
  rotateTimer = window.setTimeout(function tick() {
    if (sponsorImages.length <= 1) {
      rotateTimer = window.setTimeout(tick, SPONSOR_DURATION_MS);
      return;
    }

    // Hard cut to next image
    const nextSrc = sponsorImages[sponsorImgIndex];
    currentImg.onload = function () {
      hardCutToNextImage(currentImg);
    };
    currentImg.src = nextSrc;
    incrementSponsorImgIndex();

    rotateTimer = window.setTimeout(tick, SPONSOR_DURATION_MS);
  }, SPONSOR_DURATION_MS);
}

function initSponsors() {
  sponsorImages = shuffle(getBannerSources().slice());

  const currentImg = document.querySelector('#SponsorBox img.CurrentImg');
  if (!currentImg) return;

  if (!sponsorImages.length) {
    setPlaceholderVisible(true);
    return;
  }

  setPlaceholderVisible(false);

  currentImg.onload = function () { applySizing(currentImg); };
  currentImg.src = sponsorImages[sponsorImgIndex];
  incrementSponsorImgIndex();

  window.addEventListener('resize', function () {
    applySizing(currentImg);
  });

  scheduleNextRotation(currentImg);
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

function bootstrap() {
  watchClock();
  // Give sbForeach a beat to populate #Banners from CRG media list.
  window.setTimeout(initSponsors, 200);
}

if (window.WS && typeof window.WS.AfterLoad === 'function') {
  window.WS.AfterLoad(bootstrap);
} else {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
}

window.addEventListener('beforeunload', function () {
  if (rotateTimer) {
    window.clearTimeout(rotateTimer);
    rotateTimer = null;
  }
});

})();
