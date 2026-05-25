function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

function copyAccount(text, btn) {
  const accountText =
    btn?.closest('.account-card')?.querySelector('.account-num')?.textContent?.replace(/\s+/g, ' ').trim()
    || text;

  const isEn = () => document.documentElement.classList.contains('is-en');

  const finish = () => {
    if (btn) {
      const koSpan = btn.querySelector('.ko');
      const enSpan = btn.querySelector('.en');
      if (koSpan) koSpan.textContent = '복사됨';
      if (enSpan) enSpan.textContent = 'Copied';
      if (!koSpan && !enSpan) btn.textContent = '복사됨';
      btn.classList.add('copied');
      setTimeout(() => {
        if (koSpan) koSpan.textContent = '복사';
        if (enSpan) enSpan.textContent = 'Copy';
        if (!koSpan && !enSpan) btn.textContent = '복사';
        btn.classList.remove('copied');
      }, 2000);
    }
    showToast(isEn() ? 'Copied to clipboard' : '복사되었습니다');
  };

  navigator.clipboard.writeText(accountText).then(finish).catch(() => {
    fallbackCopyText(accountText);
    finish();
  });
}

function copyLink() {
  const isEn = document.documentElement.classList.contains('is-en');
  const finish = () => {
    showToast(isEn ? 'Invitation link copied' : '청첩장 링크가 복사되었습니다');
  };
  navigator.clipboard.writeText(window.location.href).then(finish).catch(() => {
    fallbackCopyText(window.location.href);
    finish();
  });
}

window.copyAccount = copyAccount;
window.copyLink = copyLink;