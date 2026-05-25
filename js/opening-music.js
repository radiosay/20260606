(function initOpeningAndMusic() {
  const audio = document.getElementById('bgm');
  const toggle = document.getElementById('music-toggle');
  const opening = document.getElementById('opening-overlay');
  const openBtn = document.getElementById('opening-enter');

  let interactionBound = false;
  let autoplayTried = false;
  let openingClosed = false;
  let musicStartedByUser = false;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  function forceScrollTop() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  function syncMusicButton() {
    if (!toggle || !audio) return;
    const isEn = document.documentElement.classList.contains('is-en');
    const paused = audio.paused;
    const ko = paused ? '🔇 음악 켜기' : '🎵 음악 끄기';
    const en = paused ? '🔇 Music On' : '🎵 Music Off';
    toggle.innerHTML = '<span class="ko">' + ko + '</span><span class="en">' + en + '</span>';
  }

  async function tryPlayMusic(markUserStarted = false) {
    if (!audio) return false;
    if (!audio.paused) {
      if (markUserStarted) musicStartedByUser = true;
      syncMusicButton();
      return true;
    }

    try {
      await audio.play();
      if (markUserStarted) musicStartedByUser = true;
      syncMusicButton();
      return true;
    } catch (e) {
      syncMusicButton();
      return false;
    }
  }

  function removeFirstInteractionListeners() {
    window.removeEventListener('touchstart', handleFirstInteraction, passiveOnce);
    window.removeEventListener('pointerdown', handleFirstInteraction, passiveOnce);
    window.removeEventListener('keydown', handleFirstInteraction, passiveOnce);
    interactionBound = false;
  }

  async function handleFirstInteraction() {
    const played = await tryPlayMusic(true);
    if (played) {
      removeFirstInteractionListeners();
    }
  }

  const passiveOnce = { passive: true, once: true };

  function bindFirstInteractionAutoPlay() {
    if (interactionBound) return;
    interactionBound = true;
    window.addEventListener('touchstart', handleFirstInteraction, passiveOnce);
    window.addEventListener('pointerdown', handleFirstInteraction, passiveOnce);
    window.addEventListener('keydown', handleFirstInteraction, passiveOnce);
  }

  async function attemptImmediatePlay() {
    if (autoplayTried) return;
    autoplayTried = true;

    const played = await tryPlayMusic(false);
    if (!played) {
      bindFirstInteractionAutoPlay();
    }
  }

  function closeOpening() {
    if (openingClosed) return;
    openingClosed = true;

    if (opening) {
      opening.classList.add('hidden');
    }
    document.body.style.overflow = 'auto';
  }

  document.body.style.overflow = 'hidden';
  forceScrollTop();

  document.addEventListener('DOMContentLoaded', () => {
    forceScrollTop();
    syncMusicButton();
    attemptImmediatePlay();
  });

  window.addEventListener('load', () => {
    forceScrollTop();
    syncMusicButton();
  });

  if (openBtn) {
    openBtn.addEventListener('click', async () => {
      closeOpening();

      if (audio && audio.paused && !musicStartedByUser) {
        const played = await tryPlayMusic(true);
        if (!played) {
          bindFirstInteractionAutoPlay();
        }
      }
    });
  }

  if (toggle) {
    toggle.addEventListener('click', async () => {
      if (!audio) return;

      if (audio.paused) {
        const played = await tryPlayMusic(true);
        if (!played) {
          const isEn = document.documentElement.classList.contains('is-en');
          showToast(isEn ? 'Music will start after your first tap.' : '첫 터치 후 음악이 시작됩니다');
        }
      } else {
        audio.pause();
        syncMusicButton();
      }
    });
  }

  document.addEventListener('visibilitychange', syncMusicButton);
  syncMusicButton();
})();