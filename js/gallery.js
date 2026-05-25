(function initGallery() {
  const slider = document.querySelector('.gallery-slider');
  const viewport = slider?.querySelector('.gallery-scroll');
  const track = slider?.querySelector('.gallery-track');
  const thumbsRoot = document.getElementById('gallery-thumbs');
  const indicator = document.getElementById('gallery-indicator');

  if (!slider || !viewport || !track || !thumbsRoot) return;

  const slides = Array.from(track.querySelectorAll('.gallery-item'));
  if (!slides.length) return;

  let current = 0;
  let isAnimating = false;
  let scrollEndTimer = null;
  let thumbScrollRaf = null;
  let currentTranslate = 0;
  let currentWidth = 1;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartTranslate = 0;
  let dragging = false;
  let isHorizontalDrag = false;
  let pointerId = null;

  thumbsRoot.innerHTML = '';

  const thumbs = slides.map((slide, index) => {
    const img = slide.querySelector('img');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gallery-thumb';
    btn.setAttribute('aria-label', `${index + 1}번 사진 보기`);
    btn.innerHTML = `<img src="${img.getAttribute('src')}" alt="${img.getAttribute('alt') || `웨딩 사진 ${index + 1}`}">`;

    btn.addEventListener('click', () => {
      goTo(index, true);
    });

    thumbsRoot.appendChild(btn);
    return btn;
  });

  function getSlideWidth() {
    return viewport.clientWidth || slider.clientWidth || 1;
  }

  function clampIndex(index) {
    return Math.max(0, Math.min(slides.length - 1, index));
  }

  function clampTranslate(value) {
    const max = 0;
    const min = -(slides.length - 1) * currentWidth;
    return Math.max(min, Math.min(max, value));
  }

  function setTrackPosition(value, withAnimation = false) {
    currentTranslate = clampTranslate(value);
    track.style.transition = withAnimation ? 'transform 240ms ease-out' : 'none';
    track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
  }

  function updateIndicator() {
    if (indicator) {
      indicator.textContent = `${current + 1} / ${slides.length}`;
    }
  }

  function updateThumbs(immediate = false) {
    thumbs.forEach((thumb, index) => {
      thumb.classList.toggle('active', index === current);
    });

    const active = thumbs[current];
    if (!active) return;

    const left = Math.max(0, active.offsetLeft - (thumbsRoot.clientWidth / 2) + (active.clientWidth / 2));

    if (thumbScrollRaf) cancelAnimationFrame(thumbScrollRaf);

    if (immediate) {
      thumbsRoot.scrollLeft = left;
      return;
    }

    thumbScrollRaf = requestAnimationFrame(() => {
      thumbsRoot.scrollTo({ left, behavior: 'auto' });
    });
  }

  function preloadAround(index) {
    [index - 1, index, index + 1].forEach((i) => {
      const slide = slides[i];
      const img = slide?.querySelector('img[loading="lazy"]');
      if (img) {
        img.loading = 'eager';
        img.decoding = 'async';
      }
    });
  }

  function finishAnimation() {
    isAnimating = false;
    track.style.transition = 'none';
  }

  function goTo(index, animate = true, immediateThumb = false) {
    const next = clampIndex(index);
    current = next;
    isAnimating = animate;
    setTrackPosition(-(current * currentWidth), animate);
    updateIndicator();
    updateThumbs(immediateThumb);
    preloadAround(current);

    if (!animate) finishAnimation();
  }

  function snapToNearest(animate = true) {
    const next = clampIndex(Math.round(Math.abs(currentTranslate) / currentWidth));
    goTo(next, animate, true);
  }

  function onTransitionEnd(e) {
    if (e.propertyName === 'transform') {
      finishAnimation();
    }
  }

  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (isAnimating) finishAnimation();

    pointerId = e.pointerId;
    dragging = true;
    isHorizontalDrag = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartTranslate = currentTranslate;

    viewport.classList.add('is-dragging');
    if (viewport.setPointerCapture) viewport.setPointerCapture(pointerId);
  }

  function onPointerMove(e) {
    if (!dragging || e.pointerId !== pointerId) return;

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    if (!isHorizontalDrag) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dx) <= Math.abs(dy)) {
        dragging = false;
        viewport.classList.remove('is-dragging');
        if (viewport.releasePointerCapture && viewport.hasPointerCapture(pointerId)) {
          viewport.releasePointerCapture(pointerId);
        }
        return;
      }
      isHorizontalDrag = true;
    }

    e.preventDefault();
    setTrackPosition(dragStartTranslate + dx, false);
  }

  function endDrag(e) {
    if (pointerId !== null && e.pointerId !== undefined && e.pointerId !== pointerId) return;

    if (dragging && isHorizontalDrag) {
      const moved = currentTranslate - dragStartTranslate;
      const threshold = Math.min(90, currentWidth * 0.18);

      if (moved <= -threshold) {
        goTo(current + 1, true, true);
      } else if (moved >= threshold) {
        goTo(current - 1, true, true);
      } else {
        snapToNearest(true);
      }
    }

    dragging = false;
    isHorizontalDrag = false;
    viewport.classList.remove('is-dragging');

    if (pointerId !== null && viewport.releasePointerCapture && viewport.hasPointerCapture(pointerId)) {
      viewport.releasePointerCapture(pointerId);
    }
    pointerId = null;
  }

  function onResize() {
    currentWidth = getSlideWidth();
    goTo(current, false, true);
  }

  currentWidth = getSlideWidth();
  track.style.willChange = 'transform';
  track.addEventListener('transitionend', onTransitionEnd);

  viewport.addEventListener('pointerdown', onPointerDown, { passive: true });
  viewport.addEventListener('pointermove', onPointerMove, { passive: false });
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', endDrag);

  window.addEventListener('resize', () => {
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(onResize, 80);
  });

  updateIndicator();
  goTo(0, false, true);
})();
