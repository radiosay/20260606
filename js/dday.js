(function initDday() {
  const wedding = new Date(window.APP_CONFIG.weddingDate);

  // 현재 시간을 한국 시간(KST) 기준으로 고정
  const now = new Date();
  const kstNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Toronto' })
  );

  const diff = Math.ceil((wedding - kstNow) / (1000 * 60 * 60 * 24));
  const countEl = document.getElementById('dday-count');
  const barEl = document.getElementById('dday-bar');

  if (!countEl || !barEl) return;

  if (diff > 0) {
    countEl.textContent = diff;

    const pct = Math.max(0, Math.min(100, ((365 - diff) / 365) * 100));
    setTimeout(() => {
      barEl.style.width = pct + '%';
    }, 300);
  } else if (diff === 0) {
    countEl.textContent = 'DAY';
    barEl.style.width = '100%';
  } else {
    countEl.parentElement.innerHTML =
      '<div class="dday-number" style="font-size:48px;"><span class="ko">결혼했습니다!</span><span class="en">Just Married! 🎊</span></div>';
  }
})();