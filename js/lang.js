(function initLang() {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;

  function applyLang(isEn) {
    document.documentElement.classList.toggle('is-en', isEn);
    document.documentElement.lang = isEn ? 'en' : 'ko';
    btn.textContent = isEn ? '한' : 'EN';
    try { localStorage.setItem('wedding-lang', isEn ? 'en' : 'ko'); } catch (_) {}
  }

  btn.addEventListener('click', function () {
    applyLang(!document.documentElement.classList.contains('is-en'));
  });

  try {
    if (localStorage.getItem('wedding-lang') === 'en') applyLang(true);
  } catch (_) {}
})();
