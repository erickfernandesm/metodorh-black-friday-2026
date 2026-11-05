/* ==========================================================================
   Vídeo do YouTube no hero
   - Link em js/config.js → hero.youtube (vazio = hero sem vídeo)
   - Autoplay sem som: os navegadores só liberam som depois de um toque,
     clique ou tecla da pessoa na página
   - Se a pessoa já tocou na tela (ex.: tocou para pular a abertura), o som
     liga sozinho quando o player fica pronto
   - Botão "Clique para ativar o som": volta ao início e liga o áudio
   - Loop feito aqui: o loop do próprio YouTube (loop=1&playlist=ID)
     recarregava o player a cada volta
   ========================================================================== */
(function () {
  'use strict';

  var cfg = (window.RH_CONFIG && window.RH_CONFIG.hero) || {};
  var box = document.querySelector('[data-hero-video]');
  var id = parseId(cfg.youtube);
  if (!box || !id) return;

  function parseId(v) {
    v = String(v || '').trim();
    if (/^[\w-]{11}$/.test(v)) return v;
    var m = v.match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live|v)\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  // Interação antes do player ficar pronto (com ela o navegador libera o som)
  var touched = false;
  ['pointerdown', 'touchend', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function () { touched = true; }, { capture: true, once: true, passive: true });
  });
  function canSound() {
    return touched || !!(navigator.userActivation && navigator.userActivation.hasBeenActive);
  }

  var hero = box.closest('.hero');
  var frame = box.querySelector('[data-hero-frame]');
  var btn = box.querySelector('[data-hero-unmute]');

  box.hidden = false;
  if (hero) hero.classList.add('hero--video');
  // capa enquanto o player carrega
  frame.style.backgroundImage = 'url("https://i.ytimg.com/vi/' + id + '/hqdefault.jpg")';

  var params = {
    autoplay: 1, mute: 1, playsinline: 1,
    rel: 0, modestbranding: 1, iv_load_policy: 3, enablejsapi: 1,
  };
  if (/^https?:$/.test(location.protocol)) params.origin = location.origin;
  var qs = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');

  var iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?' + qs;
  iframe.title = 'Vídeo da Black Friday do Método RH Estratégico';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';

  // Com a Revelação da Black na tela, o vídeo só começa quando ela sai
  // (senão ele rodaria escondido atrás da abertura).
  function start() {
    if (iframe.parentNode) return;
    frame.appendChild(iframe);
    // cursor animado indicando o clique para ativar o som
    setTimeout(function () { if (btn && !btn.hidden) box.classList.add('is-hint'); }, 900);
  }
  if (document.documentElement.classList.contains('bf-intro-on')) {
    document.addEventListener('bf:intro-fim', start);
    setTimeout(start, 6500); // segurança, caso a abertura falhe
  } else start();

  function send(func, args) {
    if (!iframe.contentWindow) return;
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*');
  }
  function unmute(restart) {
    if (restart) send('seekTo', [0, true]);
    send('unMute');
    send('setVolume', [100]);
    send('playVideo');
  }
  function hideButton() { if (btn) btn.hidden = true; box.classList.remove('is-hint'); }

  // Escuta o player (estado, mudo/com som)
  iframe.addEventListener('load', function () {
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'hero-video' }), '*');
  });
  var ready = false;
  window.addEventListener('message', function (e) {
    if (e.source !== iframe.contentWindow) return;
    var data;
    try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (err) { return; }
    if (!data) return;

    // player pronto: se a pessoa já interagiu com a página, liga o som
    if (!ready && (data.event === 'onReady' || data.event === 'initialDelivery' || data.event === 'infoDelivery')) {
      ready = true;
      if (canSound()) unmute(false);
    }

    var info = data.info && typeof data.info === 'object' ? data.info : {};
    // som ligado (pelo botão, pela abertura ou pelos controles do YouTube): botão some
    if (info.muted === false) hideButton();
    // fim do vídeo (estado 0): volta ao início sem recarregar o player
    var state = data.event === 'onStateChange' ? data.info : info.playerState;
    if (state === 0) { send('seekTo', [0, true]); send('playVideo'); }
  });

  if (btn) btn.addEventListener('click', function () {
    unmute(true);
    hideButton();
    (window.dataLayer = window.dataLayer || []).push({ event: 'hero_video_unmute' });
  });
})();
