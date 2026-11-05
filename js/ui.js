/* ==========================================================================
   Interações da interface
   - Mural de cursos e faixas Black Friday em loop contínuo
   - Entrada suave das seções
   - CTA fixo: aparece ao chegar nos módulos e some sobre a oferta e o final
   - Ano do rodapé
   ========================================================================== */
(function () {
  'use strict';

  var hasIO = 'IntersectionObserver' in window;
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  /* Loop contínuo: duplica o conteúdo para a animação andar 50% sem "pulo" */
  each('.wall__track', function (track) {
    Array.prototype.slice.call(track.children).forEach(function (img) {
      var clone = img.cloneNode(true);
      clone.removeAttribute('fetchpriority');
      clone.loading = 'lazy';
      track.appendChild(clone);
    });
  });
  // Faixas: velocidade constante em px/s, independente do tamanho da tela
  var TAPE_SPEED = 45;
  function sizeTapes() {
    each('[data-tape]', function (track) {
      var distance = track.scrollWidth / 2; // a animação anda 50% da faixa
      if (distance > 0) track.style.setProperty('--tape-duration', Math.round(distance / TAPE_SPEED) + 's');
    });
  }
  each('[data-tape]', function (track) { track.innerHTML = track.innerHTML.repeat(6); });
  // Esteira de cursos (celular): duplica as capas para o loop contínuo.
  // No desktop as cópias ficam ocultas pela grade (CSS).
  each('[data-covers-track]', function (track) {
    Array.prototype.slice.call(track.children).forEach(function (img) { track.appendChild(img.cloneNode(true)); });
  });
  sizeTapes();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeTapes);

  /* Módulos: "Ver conteúdo" abre/fecha todos juntos. Os cards têm a mesma
     altura na grade; abrir só um deixaria espaço vazio nos outros. */
  var moduleDetails = document.querySelectorAll('.module details');
  var syncing = false;
  Array.prototype.forEach.call(moduleDetails, function (d) {
    d.addEventListener('toggle', function () {
      if (syncing) return;
      syncing = true;
      Array.prototype.forEach.call(moduleDetails, function (other) { other.open = d.open; });
      // o evento "toggle" é assíncrono: libera a trava depois que todos dispararem
      setTimeout(function () { syncing = false; }, 0);
    });
  });

  /* Carrossel de módulos: bolinhas indicando o card atual */
  var modList = document.querySelector('.modules');
  var dotsBox = document.querySelector('[data-modules-dots]');
  if (modList && dotsBox) {
    var cards = modList.children;
    for (var i = 0; i < cards.length; i++) dotsBox.appendChild(document.createElement('span'));
    var dots = dotsBox.children;
    var markDot = function () {
      var max = modList.scrollWidth - modList.clientWidth;
      var idx = max > 0 ? Math.round((modList.scrollLeft / max) * (cards.length - 1)) : 0;
      for (var j = 0; j < dots.length; j++) dots[j].classList.toggle('is-active', j === idx);
    };
    modList.addEventListener('scroll', markDot, { passive: true });
    markDot();
  }

  /* Entrada das seções */
  var reveals = document.querySelectorAll('.reveal');
  if (hasIO) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
  }

  /* CTA fixo */
  var sticky = document.querySelector('[data-sticky-cta]');
  var start = document.querySelector('[data-sticky-start]');
  if (sticky && start) {
    var links = sticky.querySelectorAll('a');
    var blockers = new Set();
    var visible = false;

    var update = function () {
      var reached = start.getBoundingClientRect().top < window.innerHeight * 0.85;
      var show = reached && blockers.size === 0;
      if (show === visible) return;
      visible = show;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      Array.prototype.forEach.call(links, function (a) { a.tabIndex = show ? 0 : -1; });
    };

    // Esconde onde já existe um botão de compra grande na tela
    if (hasIO) {
      var blockIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) blockers.add(e.target); else blockers.delete(e.target);
        });
        update();
      }, { threshold: 0.25 });
      each('.offer, .final', function (el) { blockIO.observe(el); });
    }

    document.body.classList.add('has-sticky-cta');
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* Ano do rodapé */
  each('[data-year]', function (el) { el.textContent = new Date().getFullYear(); });
})();

/* Oferta: quando metade dos cartões de preço entra na tela (uma vez só), eles
   balançam e saem confetes (mesma animação da página da Caixa de Ferramentas).
   Desktop: confetes saem de trás dos cartões. Celular: caem do topo da tela,
   porque saindo de trás dos cartões iriam para fora da tela. */
(function () {
  'use strict';
  var sec = document.getElementById('oferta');
  // cartões visíveis na fase atual (dois no dia 05/11, um só no resto do mês)
  var grid = sec && Array.prototype.filter.call(sec.querySelectorAll('.offer--tiers'), function (g) { return g.offsetParent !== null; })[0];
  if (!grid || !window.bfConfete || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return;
    io.disconnect();
    Array.prototype.forEach.call(grid.querySelectorAll('.tier'), function (t, i) {
      setTimeout(function () { t.classList.add('bf-sacode'); }, i * 160);
    });
    if (innerWidth < 760) {
      window.bfConfete(null, function (W, H, peca, n) {
        for (var i = 0; i < n; i++)
          peca(Math.random() * W, -10 - Math.random() * H * 1.3, (Math.random() - .5) * 1.2, 1 + Math.random() * 2, i);
      });
      return;
    }
    var rs = sec.getBoundingClientRect(), rc = grid.getBoundingClientRect();
    var x0 = rc.left - rs.left, y0 = rc.top - rs.top, cw = rc.width, ch = rc.height;
    var cx = x0 + cw / 2, cy = y0 + ch / 2;
    window.bfConfete(sec, function (W, H, peca, n) {
      for (var i = 0; i < n * .9; i++) {
        var x = x0 + Math.random() * cw, y = y0 + Math.random() * ch;
        var dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy) || 1, v = 7 + Math.random() * 9;
        peca(x, y, dx / d * v * 1.3, dy / d * v - 7, i);
      }
    });
  }, { threshold: .5 });
  io.observe(grid);
})();

/* Desempenho: animações contínuas só rodam quando estão na tela
   (mural 3D, selos, faixas e esteira de capas). Fora da tela ficam pausadas. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('is-offscreen', !e.isIntersecting); });
  }, { rootMargin: '100px 0px' });
  Array.prototype.forEach.call(document.querySelectorAll('.hero, .tapes, .lifetime, .seal-divider, .final, .site-footer'), function (el) { io.observe(el); });
})();
