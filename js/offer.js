/* ==========================================================================
   Oferta, preço e contador
   Lê js/config.js e preenche todos os pontos da página que mostram preço,
   condição de Black Friday, prazo de acesso e contador regressivo.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.RH_CONFIG || {};
  var offer = C.offer || {};
  var campaign = C.campaign || {};
  var isBF = offer.isBlackFridayPrice === true;

  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var brlShort = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  function money(v) { return Number.isInteger(v) ? brlShort.format(v) : brl.format(v); }

  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function setText(sel, txt) { each(sel, function (el) { el.textContent = txt; }); }

  var hasInstallments = offer.installments > 1 && offer.installmentValue > 0;
  var hasCash = offer.cashPrice > 0;
  var note = offer.installmentNote ? ' ' + offer.installmentNote : '';

  /* Preço ---------------------------------------------------------------- */
  function renderPrice() {
    // Preço "De"
    if (offer.listPrice > 0) setText('[data-price-list]', money(offer.listPrice));
    else each('[data-if-list]', function (el) { el.hidden = true; });

    var installmentsEl = document.querySelector('.price__installments');
    var cashEl = document.querySelector('.price__cash');

    if (hasInstallments) {
      setText('[data-price-installments]', offer.installments + 'x de');
      setText('[data-price-installment-value]', brl.format(offer.installmentValue));
      if (hasCash) setText('[data-price-cash]', brl.format(offer.cashPrice));
      else if (cashEl) cashEl.hidden = true;
    } else if (hasCash) {
      // Somente à vista: o valor à vista vira o destaque
      setText('[data-price-installments]', '');
      setText('[data-price-installment-value]', brl.format(offer.cashPrice));
      if (cashEl) cashEl.textContent = 'à vista';
    } else if (installmentsEl) {
      installmentsEl.hidden = true;
      if (cashEl) cashEl.hidden = true;
    }

    // Linha resumida (chamada final) e versão curta (CTA fixo)
    var line = [];
    if (hasInstallments) line.push(offer.installments + 'x de ' + brl.format(offer.installmentValue) + note);
    if (hasCash) line.push((hasInstallments ? 'ou ' : '') + brl.format(offer.cashPrice) + ' à vista');
    setText('[data-price-line]', line.join(' '));
    setText('[data-price-short]', hasInstallments
      ? offer.installments + 'x de ' + brl.format(offer.installmentValue)
      : (hasCash ? brl.format(offer.cashPrice) + ' à vista' : ''));

    // Economia: só exibida quando o preço de Black Friday estiver confirmado
    if (isBF && offer.showSavings && offer.listPrice > 0 && hasCash && offer.listPrice > offer.cashPrice) {
      var diff = offer.listPrice - offer.cashPrice;
      var pct = Math.round((diff / offer.listPrice) * 100);
      each('[data-price-savings]', function (el) {
        el.textContent = 'Economia de ' + money(diff) + ' (' + pct + '%) no pagamento à vista';
        el.hidden = false;
      });
    }

    // Selo e rótulos de Black Friday
    each('[data-offer-badge]', function (el) { el.hidden = !isBF; });

    // Percentual de desconto (ex.: "50% OFF"), calculado a partir dos preços
    var pctOff = (offer.listPrice > 0 && hasCash && offer.listPrice > offer.cashPrice)
      ? Math.round((1 - offer.cashPrice / offer.listPrice) * 100) : 0;
    // O selo 3D "50% OFF" é uma imagem fixa: se o desconto mudar, vira texto.
    each('[data-discount-img]', function (img) {
      if (isBF && pctOff === 50) return;
      if (!isBF || pctOff <= 0) { img.hidden = true; return; }
      var tag = document.createElement('span');
      tag.className = 'tag-off';
      tag.textContent = pctOff + '% OFF';
      img.replaceWith(tag);
    });
    if (isBF && pctOff > 0) {
      setText('[data-discount]', pctOff + '% OFF');
      setText('[data-discount-pct]', pctOff + '%');
    } else {
      each('[data-discount], [data-discount-pct]', function (el) { el.hidden = true; });
    }
    if (offer.paymentMethods) setText('[data-payment-methods]', offer.paymentMethods);

    // Consultoria individual (condição limitada)
    var consult = offer.consultoria || {};
    each('[data-consultoria]', function (el) { el.hidden = !consult.enabled; });
    if (consult.text) setText('[data-consultoria-text]', consult.text);
  }

  /* Faixa do topo e bloco de contagem regressiva ---------------------------
     Os dois só aparecem com uma data real em campaign.endsAt. */
  function renderCountdown() {
    var bar = document.querySelector('[data-campaign-bar]');
    var out = document.querySelector('[data-countdown-time]');
    var block = document.querySelector('[data-countdown-block]');
    var end = campaign.endsAt ? new Date(campaign.endsAt).getTime() : NaN;
    if (isNaN(end)) return; // sem data real, sem contador

    function show(visible) {
      if (block) block.hidden = !visible;
      if (!bar) return;
      bar.hidden = !visible;
      // o hero desconta a altura da faixa para o CTA continuar na primeira tela
      document.documentElement.style.setProperty('--bar-h', visible ? bar.offsetHeight + 'px' : '0px');
    }

    function pad(n) { return n < 10 ? '0' + n : String(n); }
    var shown = false;
    function tick() {
      var ms = end - Date.now();
      if (ms <= 0) {
        show(false);
        clearInterval(timer);
        return;
      }
      var s = Math.floor(ms / 1000);
      var d = Math.floor(s / 86400); s -= d * 86400;
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60); s -= m * 60;
      if (out) out.textContent = (d > 0 ? d + 'd ' : '') + pad(h) + 'h ' + pad(m) + 'm ' + pad(s) + 's';
      setText('[data-cd="d"]', pad(d));
      setText('[data-cd="h"]', pad(h));
      setText('[data-cd="m"]', pad(m));
      setText('[data-cd="s"]', pad(s));
      if (!shown) { shown = true; show(true); }
    }
    var timer = setInterval(tick, 1000);
    tick();
  }

  /* Aviso de prévia --------------------------------------------------------
     Lista o que ainda falta configurar. Aparece só em ambiente local ou com
     ?preview=1 na URL; nunca para o visitante comum. */
  function renderPreviewNotice() {
    var local = window.RHTrack ? window.RHTrack.isLocal : location.protocol === 'file:';
    if (!local && !/[?&]preview=1/.test(location.search)) return;

    var pending = [];
    if (!isBF) pending.push('Preço de Black Friday não definido. A página mostra o preço atual do site.');
    if (isBF && offer.priceConfirmed === false) pending.push('Preço da Black (R$ ' + offer.cashPrice + ') ainda não confirmado.');
    if (!(offer.installments > 1)) pending.push('Parcelamento da Black não definido. A página mostra só o valor à vista.');
    if (!campaign.endsAt) pending.push('Data de encerramento não definida. A faixa com contador está oculta.');
    if (/N103364259K\?off=2j6xzmn0/.test((C.checkout || {}).url || '')) pending.push('O checkout ainda é o link atual do site, não o da Black Friday.');
    if (!pending.length) return;

    var el = document.createElement('aside');
    el.className = 'preview-notice';
    el.setAttribute('role', 'note');
    el.innerHTML = '<button type="button" aria-label="Fechar aviso">×</button><strong>Prévia: itens pendentes em js/config.js</strong><ul></ul>';
    var ul = el.querySelector('ul');
    pending.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    el.querySelector('button').addEventListener('click', function () { el.remove(); });
    document.body.appendChild(el);
  }

  function init() {
    renderPrice();
    renderCountdown();
    renderPreviewNotice();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
