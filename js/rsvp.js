(function initRsvp() {
  var radios = document.querySelectorAll('input[name="attendance"]');
  radios.forEach(function (r) {
    r.addEventListener('change', function () {
      var fields = document.getElementById('rsvp-attending-fields');
      if (fields) fields.style.display = this.value === 'yes' ? 'flex' : 'none';
    });
  });
})();

function submitRsvp() {
  var form    = document.getElementById('rsvp-form');
  var isEn    = document.documentElement.classList.contains('is-en');
  var cfg     = window.APP_CONFIG || {};

  var attendance = (form.querySelector('input[name="attendance"]:checked') || {}).value;
  var name       = ((form.querySelector('[name="rsvp-name"]')     || {}).value || '').trim();
  var guests     = ((form.querySelector('[name="rsvp-guests"]')   || {}).value || '');
  var children   = ((form.querySelector('[name="rsvp-children"]') || {}).value || '').trim();
  var song       = ((form.querySelector('[name="rsvp-song"]')     || {}).value || '').trim();

  if (!attendance) { showToast(isEn ? 'Please select your attendance.' : '참석 여부를 선택해 주세요.'); return; }
  if (!name)       { showToast(isEn ? 'Please enter your name.'        : '성함을 입력해 주세요.');      return; }

  var payload = { attendance: attendance, name: name, guests: guests, children: children, song: song };

  var scriptUrl = cfg.scriptUrl || '';

  if (scriptUrl) {
    _postToScript(scriptUrl, payload, isEn, form);
  } else {
    _fallbackMailto(payload, isEn, cfg);
  }
}

function _postToScript(url, data, isEn, form) {
  var btn = document.querySelector('.rsvp-submit');
  if (btn) btn.disabled = true;

  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(data)
  })
  .then(function () {
    _showSuccess(isEn, form);
  })
  .catch(function () {
    _showSuccess(isEn, form);   // no-cors 모드는 항상 opaque — 성공으로 처리
  })
  .finally(function () {
    if (btn) btn.disabled = false;
  });
}

function _fallbackMailto(data, isEn, cfg) {
  var subject, bodyText;
  if (isEn) {
    var att = data.attendance === 'yes' ? 'Attending' : 'Not Attending';
    subject  = 'Wedding RSVP - ' + data.name;
    bodyText = 'Attendance: ' + att + '\nName: ' + data.name;
    if (data.attendance === 'yes') {
      if (data.guests)   bodyText += '\nNumber of Guests: '          + data.guests;
      if (data.children) bodyText += '\nChildren under 18: '         + data.children;
      if (data.song)     bodyText += '\nSong Request for Reception: ' + data.song;
    }
  } else {
    var att2 = data.attendance === 'yes' ? '참석' : '불참';
    subject  = '결혼 참석 회신 - ' + data.name;
    bodyText = '참석 여부: ' + att2 + '\n성함: ' + data.name;
    if (data.attendance === 'yes') {
      if (data.guests)   bodyText += '\n참석 인원: '                   + data.guests + '명';
      if (data.children) bodyText += '\n어린이 정보 (18세 미만): '       + data.children;
      if (data.song)     bodyText += '\n피로연 신청곡: '                 + data.song;
    }
  }
  var email = cfg.rsvpEmail || 'chanmee89@hotmail.com';
  window.location.href = 'mailto:' + email
    + '?subject=' + encodeURIComponent(subject)
    + '&body='    + encodeURIComponent(bodyText);
}

function _showSuccess(isEn, form) {
  var section = form.closest('section');
  if (!section) return;
  var msg = isEn
    ? '<div style="text-align:center;padding:32px 16px;">'
      + '<div style="font-size:40px;margin-bottom:16px;">✉️</div>'
      + '<div style="font-size:18px;font-weight:700;color:#1e3a5f;margin-bottom:10px;">Thank you!</div>'
      + '<div style="font-size:14px;color:#4a5a72;line-height:1.8;">Your RSVP has been submitted.<br>We look forward to celebrating with you!</div>'
      + '</div>'
    : '<div style="text-align:center;padding:32px 16px;">'
      + '<div style="font-size:40px;margin-bottom:16px;">✉️</div>'
      + '<div style="font-size:18px;font-weight:700;color:#1e3a5f;margin-bottom:10px;">감사합니다!</div>'
      + '<div style="font-size:14px;color:#4a5a72;line-height:1.8;">참석 회신이 접수되었습니다.<br>소중한 축하 감사히 받겠습니다!</div>'
      + '</div>';
  form.innerHTML = msg;
}

window.submitRsvp = submitRsvp;
