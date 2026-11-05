/* ==========================================================================
   Rastreamento
   Carrega GTM, Meta Pixel, Microsoft Clarity e UTMify com os IDs do config.
   Não carrega nada em ambiente local, para não misturar testes com dados reais.
   Expõe window.RHTrack.event(nome, dados) para os outros scripts.
   ========================================================================== */
(function () {
  'use strict';

  var cfg = (window.RH_CONFIG && window.RH_CONFIG.tracking) || {};
  var host = location.hostname;
  var isLocal = location.protocol === 'file:' || host === '' || host === 'localhost' ||
    host === '127.0.0.1' || /\.local$/.test(host);

  window.dataLayer = window.dataLayer || [];

  window.RHTrack = {
    isLocal: isLocal,
    // Evento genérico para o GTM (dataLayer). O GTM decide para onde enviar.
    event: function (name, data) {
      var payload = { event: name };
      if (data) for (var k in data) payload[k] = data[k];
      window.dataLayer.push(payload);
    },
    // Evento padrão do Meta Pixel (somente quando o Pixel estiver carregado).
    pixel: function (name, data) {
      if (typeof window.fbq === 'function') window.fbq('track', name, data || {});
    },
  };

  if (isLocal) return;

  function addScript(src, attrs) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    if (attrs) for (var k in attrs) s.setAttribute(k, attrs[k]);
    document.head.appendChild(s);
  }

  // Google Tag Manager
  if (cfg.gtmId) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    addScript('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(cfg.gtmId));
  }

  // Meta Pixel
  if (cfg.metaPixelId) {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', cfg.metaPixelId);
    window.fbq('track', 'PageView');
  }

  // Microsoft Clarity
  if (cfg.clarityId) {
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    // carrega depois da página e do vídeo, para não disputar o celular com o player
    var loadClarity = function () { setTimeout(function () { addScript('https://www.clarity.ms/tag/' + encodeURIComponent(cfg.clarityId)); }, 4000); };
    if (document.readyState === 'complete') loadClarity(); else window.addEventListener('load', loadClarity);
  }

  // UTMify (mesma configuração do site atual)
  if (cfg.utmify) {
    addScript('https://cdn.utmify.com.br/scripts/utms/latest.js', {
      'data-utmify-prevent-xcod-sck': '',
      'data-utmify-prevent-subids': '',
    });
  }
})();
