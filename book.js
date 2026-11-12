/* Booking flow for Styled by Sunny.

   GO LIVE: paste a form endpoint below. Anything that accepts a normal form POST works:
   Formspree (https://formspree.io/f/xxxx), a Make.com webhook, Basin, Getform.
   While this is empty the flow runs in preview mode and sends nothing. */
var FORM_ENDPOINT = '';

(function () {
  'use strict';

  var TOTAL = 4;
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var form = document.getElementById('form');
  var panes = [].slice.call(document.querySelectorAll('[data-step]'));
  var segs = [].slice.call(document.querySelectorAll('.seg'));
  var progress = document.getElementById('progress');
  var sendBtn = document.getElementById('send');
  var state = { step: 1, service: '', color: false, parking: '', day: '', window: '' };

  function el(id) { return document.getElementById(id); }
  function val(id) { return (el(id).value || '').trim(); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function pane(step) { return document.querySelector('[data-step="' + step + '"]'); }

  /* Day chips: the next 14 days, starting tomorrow. */
  (function buildDays() {
    var now = new Date(), html = '';
    for (var i = 1; i <= 14; i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      var label = DOW[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate();
      html += '<button type="button" class="day" role="radio" aria-checked="false" data-value="' + label + '" aria-label="' + label + '">' +
        '<span class="day-dow">' + DOW[d.getDay()] + '</span>' +
        '<span class="day-num">' + d.getDate() + '</span>' +
        '<span class="day-mon">' + MON[d.getMonth()] + '</span></button>';
    }
    el('days').innerHTML = html;
  })();

  /* One handler for every pick-one group: service, parking, day, window. */
  function choose(group, btn) {
    var name = group.getAttribute('data-group');
    [].forEach.call(group.querySelectorAll('[role="radio"]'), function (b) {
      var on = b === btn;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    state[name] = btn.getAttribute('data-value');
    if (name === 'service') {
      state.color = btn.hasAttribute('data-color');
      el('colorNote').hidden = !state.color;
    }
    clearErr(state.step);
  }
  [].forEach.call(document.querySelectorAll('[data-group]'), function (group) {
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('[role="radio"]');
      if (btn && group.contains(btn)) choose(group, btn);
    });
  });

  /* Errors */
  function showErr(step, msg, fieldId) {
    var p = pane(step).querySelector('[data-err]');
    p.textContent = msg;
    p.hidden = false;
    if (fieldId) {
      var f = el(fieldId);
      f.setAttribute('aria-invalid', 'true');
      f.focus();
    } else {
      p.scrollIntoView({ block: 'center' });
    }
  }
  function clearErr(step) {
    var p = pane(step) && pane(step).querySelector('[data-err]');
    if (p) { p.hidden = true; p.textContent = ''; }
  }
  form.addEventListener('input', function (e) {
    if (e.target.removeAttribute) e.target.removeAttribute('aria-invalid');
    if (state.step !== 'done') clearErr(state.step);
  });

  function validate(step) {
    if (step === 1 && !state.service) { showErr(1, 'Choose a service to continue.'); return false; }
    if (step === 2) {
      if (!val('street')) { showErr(2, 'Add your street address so Sunny knows where to come.', 'street'); return false; }
      if (!/^\d{5}$/.test(val('zip'))) { showErr(2, 'Enter a 5-digit ZIP code.', 'zip'); return false; }
      if (!val('city')) { showErr(2, 'Add your city.', 'city'); return false; }
    }
    if (step === 3) {
      if (!state.day) { showErr(3, 'Pick a day.'); return false; }
      if (!state.window) { showErr(3, 'Pick a time of day.'); return false; }
    }
    if (step === 4) {
      if (!val('name')) { showErr(4, 'Add your name.', 'name'); return false; }
      if (val('phone').replace(/\D/g, '').length < 10) { showErr(4, 'Enter a mobile number Sunny can text, with area code.', 'phone'); return false; }
    }
    return true;
  }

  /* Summary */
  function where() {
    var line = val('street');
    if (val('unit')) line += ', ' + val('unit');
    return line + ', ' + val('city') + ' ' + val('zip');
  }
  function summaryHTML() {
    var rows = [['Service', state.service], ['Where', where()], ['When', state.day + ' · ' + state.window]];
    return rows.map(function (r, i) {
      return '<div class="sum-row' + (i === rows.length - 1 ? ' sum-last' : '') + '"><span class="sum-k">' + r[0] +
        '</span><span class="sum-v">' + esc(r[1]) + '</span></div>';
    }).join('');
  }

  /* Steps. Each step is a history entry, so the phone's back gesture goes back one step
     and does not throw away the form. */
  function show(step, push) {
    state.step = step;
    panes.forEach(function (p) { p.hidden = p.getAttribute('data-step') !== String(step); });
    var n = step === 'done' ? TOTAL : step;
    segs.forEach(function (s, i) { s.classList.toggle('seg-on', i < n); });
    progress.setAttribute('aria-valuenow', n);
    if (step === 4) el('summary').innerHTML = summaryHTML();
    window.scrollTo(0, 0);
    if (push) { try { history.pushState({ step: step }, '', '#step-' + step); } catch (e) {} }
  }
  try { history.replaceState({ step: 1 }, '', location.pathname + location.search); } catch (e) {}
  window.addEventListener('popstate', function (e) {
    if (state.step === 'done') return;
    show((e.state && e.state.step) || 1, false);
  });

  function next() {
    if (state.step === 'done' || state.step >= TOTAL) return;
    if (validate(state.step)) show(state.step + 1, true);
  }
  form.addEventListener('click', function (e) {
    if (e.target.closest('[data-next]')) next();
    if (e.target.closest('[data-back]')) {
      if (history.state && history.state.step === state.step && state.step > 1) history.back();
      else show(Math.max(1, state.step - 1), false);
    }
  });

  /* Send */
  function finish(preview) {
    el('doneSummary').innerHTML = summaryHTML();
    if (preview) {
      el('doneEyebrow').textContent = 'Preview mode';
      el('doneTitle').innerHTML = 'This is a <span class="it">preview.</span>';
      el('doneText').textContent = 'Nothing was sent. Add a form endpoint in book.js to take real requests.';
    }
    show('done', false);
    try { history.replaceState({ step: 'done' }, '', location.pathname); } catch (e) {}
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (state.step !== 4) { next(); return; }   /* Enter key on an earlier step */
    if (!validate(4)) return;
    if (val('company')) { finish(false); return; }   /* honeypot: bots fill it, people never see it */

    var data = new FormData();
    data.append('service', state.service);
    data.append('color_consult', state.color ? 'yes' : 'no');
    data.append('address', where());
    data.append('parking', state.parking);
    data.append('access_notes', val('access'));
    data.append('day', state.day);
    data.append('time_of_day', state.window);
    data.append('name', val('name'));
    data.append('phone', val('phone'));
    data.append('instagram', val('instagram'));
    data.append('notes', val('notes'));
    data.append('_subject', 'House call request: ' + state.service + ', ' + state.day);

    if (!FORM_ENDPOINT) { finish(true); return; }

    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending…';
    fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        finish(false);
      })
      .catch(function () {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send request';
        showErr(4, 'That did not send. Check your connection and try again, or DM @styledby.sunny on Instagram.');
      });
  });

  /* Service rows on the landing page link here with ?service=key */
  try {
    var key = new URLSearchParams(location.search).get('service');
    var pre = key && document.querySelector('[data-group="service"] [data-key="' + key.replace(/[^a-z]/g, '') + '"]');
    if (pre) choose(pre.parentNode, pre);
  } catch (e) {}
})();
