/* ==========================================================================
   Vídeo do YouTube no hero
   - Link em js/config.js → hero.youtube (vazio = hero sem vídeo)
   - Autoplay sem som + loop (navegadores só permitem autoplay mudo)
   - Botão "Clique para ativar o som": volta ao início e liga o áudio
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

  var hero = box.closest('.hero');
  var frame = box.querySelector('[data-hero-frame]');
  var btn = box.querySelector('[data-hero-unmute]');

  box.hidden = false;
  if (hero) hero.classList.add('hero--video');
  // capa enquanto o player carrega
  frame.style.backgroundImage = 'url("https://i.ytimg.com/vi/' + id + '/hqdefault.jpg")';

  var params = {
    autoplay: 1, mute: 1, playsinline: 1, loop: 1, playlist: id,
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
  function hideButton() { if (btn) btn.hidden = true; box.classList.remove('is-hint'); }

  // Escuta o player: se a pessoa ligar o som pelos controles do YouTube, o botão some
  iframe.addEventListener('load', function () {
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'hero-video' }), '*');
  });
  window.addEventListener('message', function (e) {
    if (!/youtube(-nocookie)?\.com$/.test(String(e.origin).replace(/^https?:\/\/(www\.)?/, ''))) return;
    var data;
    try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (err) { return; }
    if (data && data.info && data.info.muted === false) hideButton();
  });

  if (btn) btn.addEventListener('click', function () {
    send('seekTo', [0, true]);
    send('unMute');
    send('setVolume', [100]);
    send('playVideo');
    hideButton();
    (window.dataLayer = window.dataLayer || []).push({ event: 'hero_video_unmute' });
  });
})();
