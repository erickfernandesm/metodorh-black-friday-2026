/* ==========================================================================
   Caminho até o checkout
   - Guarda as UTMs da visita e repassa ao checkout.
   - Botões [data-checkout] abrem o formulário rápido (se ativo) ou vão direto
     ao checkout.
   - O formulário envia o lead ao webhook da SellFlux e abre o checkout com
     nome, e-mail e telefone preenchidos (mesmo fluxo do site atual).
   ========================================================================== */
(function () {
  'use strict';

  var C = window.RH_CONFIG || {};
  var co = C.checkout || {};
  var lead = co.leadCapture || {};
  var track = window.RHTrack || { event: function () {}, pixel: function () {} };
  var STORE_KEY = 'rh_bf_params';

  /* Parâmetros da visita (UTMs etc.) -------------------------------------- */
  function readStored() {
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }

  function captureParams() {
    var url = new URLSearchParams(location.search);
    var keys = co.passParams || [];
    var fresh = {};
    var found = false;
    keys.forEach(function (k) {
      var v = url.get(k);
      if (v) { fresh[k] = v; found = true; }
    });
    // Se a visita trouxe parâmetros novos, eles substituem os anteriores.
    var params = found ? fresh : readStored();

    // Complemento: UTMs salvas pelo UTMify (mesma lógica do site atual)
    try {
      ['utmify', 'utms'].some(function (key) {
        var raw = localStorage.getItem(key);
        if (!raw) return false;
        var parsed = JSON.parse(raw);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
          if (!params[k] && parsed && parsed[k]) params[k] = parsed[k];
        });
        return true;
      });
    } catch (e) { /* armazenamento indisponível */ }

    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(params)); } catch (e) { /* idem */ }
    return params;
  }

  var visitParams = captureParams();

  function buildCheckoutUrl(prefill) {
    var url;
    try { url = new URL(co.url); } catch (e) { return co.url || '#oferta'; }
    var p = url.searchParams;
    Object.keys(visitParams).forEach(function (k) { p.set(k, visitParams[k]); });
    var defaults = co.defaultParams || {};
    Object.keys(defaults).forEach(function (k) { if (!p.has(k)) p.set(k, defaults[k]); });
    if (prefill) Object.keys(prefill).forEach(function (k) { if (prefill[k]) p.set(k, prefill[k]); });
    return url.toString();
  }

  function goToCheckout(prefill) {
    track.event('begin_checkout', { checkout_url: co.url });
    window.location.href = buildCheckoutUrl(prefill);
  }

  /* Modal do formulário ----------------------------------------------------- */
  var modal = document.querySelector('[data-lead-modal]');
  var form = document.querySelector('[data-lead-form]');
  var useModal = lead.enabled && lead.webhookUrl && modal && typeof modal.showModal === 'function';
  var lastTrigger = null;

  function openModal(trigger) {
    lastTrigger = trigger;
    modal.showModal();
    document.documentElement.style.overflow = 'hidden';
    var first = form.querySelector('input');
    if (first) setTimeout(function () { first.focus(); }, 50);
    track.event('lead_form_open');
  }

  function closeModal() {
    if (modal.open) modal.close();
  }

  if (modal) {
    modal.addEventListener('close', function () {
      document.documentElement.style.overflow = '';
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    });
    // Fecha ao clicar fora do formulário
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    var closeBtn = modal.querySelector('[data-lead-close]');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }

  /* Botões de compra ---------------------------------------------------------- */
  function bindCheckoutButtons() {
    var href = buildCheckoutUrl();
    Array.prototype.forEach.call(document.querySelectorAll('[data-checkout]'), function (btn) {
      btn.setAttribute('href', href);
      if (useModal) btn.setAttribute('aria-haspopup', 'dialog');
    });
  }

  document.addEventListener('click', function (e) {
    var cta = e.target.closest && e.target.closest('[data-cta]');
    if (cta) track.event('cta_click', { cta_location: cta.getAttribute('data-cta') });

    var btn = e.target.closest && e.target.closest('[data-checkout]');
    if (!btn) return;
    // Mantém Ctrl/Cmd+clique abrindo o checkout em nova aba
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    if (useModal) openModal(btn);
    else goToCheckout();
  });

  /* Formulário ---------------------------------------------------------------- */
  // 32999999999 -> "32 99999-9999"
  function formatPhone(v) {
    v = v.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 2) return v;
    var ddd = v.slice(0, 2);
    var rest = v.slice(2);
    if (rest.length <= 4) return ddd + ' ' + rest;
    var cut = rest.length === 9 ? 5 : 4;
    return ddd + ' ' + rest.slice(0, cut) + '-' + rest.slice(cut);
  }

  function sendLead(data) {
    // Não deixa o visitante esperando mais de 2,5 s pelo webhook
    var request = fetch(lead.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(function () { /* segue para o checkout mesmo se falhar */ });
    var timeout = new Promise(function (resolve) { setTimeout(resolve, 2500); });
    return Promise.race([request, timeout]);
  }

  if (form) {
    var phone = form.elements.phone;
    var errorEl = form.querySelector('[data-lead-error]');
    var submit = form.querySelector('[data-lead-submit]');
    var submitLabel = form.querySelector('[data-lead-label]');

    phone.addEventListener('input', function () { phone.value = formatPhone(phone.value); });

    function fail(input, msg) {
      errorEl.textContent = msg;
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    }

    form.addEventListener('input', function (e) {
      e.target.removeAttribute('aria-invalid');
      errorEl.textContent = '';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var digits = phone.value.replace(/\D/g, '');

      if (name.length < 3) return fail(form.elements.name, 'Informe seu nome completo.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail(form.elements.email, 'Informe um e-mail válido.');
      if (digits.length !== 11) return fail(phone, 'Informe o celular completo com DDD. Ex.: 32 99999-9999');

      submit.setAttribute('aria-busy', 'true');
      submitLabel.textContent = 'Abrindo o pagamento…';

      var p = visitParams;
      sendLead({
        name: name,
        email: email,
        phone: digits,
        utm_source: p.utm_source || '',
        utm_medium: p.utm_medium || '',
        utm_campaign: p.utm_campaign || '',
        utm_content: p.utm_content || '',
        utm_term: p.utm_term || '',
        sck: p.sck || '',
        src: p.src || '',
        timestamp: new Date().toISOString(),
        page_url: location.href,
      }).then(function () {
        track.pixel('Lead', { content_name: 'Método RH Estratégico', currency: 'BRL', value: 0 });
        track.event('generate_lead', { form: 'pre_checkout' });

        var names = lead.prefillParams || {};
        var prefill = {};
        if (names.name) prefill[names.name] = name;
        if (names.email) prefill[names.email] = email;
        if (names.phone) prefill[names.phone] = digits;
        goToCheckout(prefill);
      });
    });
  }

  /* Links institucionais a partir do config --------------------------------- */
  function bindContactLinks() {
    var ct = C.contact || {};
    if (ct.privacyUrl) Array.prototype.forEach.call(document.querySelectorAll('[data-privacy-link]'), function (a) { a.href = ct.privacyUrl; });
    if (ct.emecUrl) Array.prototype.forEach.call(document.querySelectorAll('[data-emec-link]'), function (a) { a.href = ct.emecUrl; });
  }

  // Volta do botão "voltar" do navegador (bfcache): reativa o formulário
  window.addEventListener('pageshow', function () {
    var s = form && form.querySelector('[data-lead-submit]');
    if (s && s.getAttribute('aria-busy')) {
      s.removeAttribute('aria-busy');
      form.querySelector('[data-lead-label]').textContent = 'Ir para o pagamento';
    }
    if (modal && modal.open) closeModal();
  });

  bindCheckoutButtons();
  bindContactLinks();

  window.RHCheckout = { buildUrl: buildCheckoutUrl };
})();
