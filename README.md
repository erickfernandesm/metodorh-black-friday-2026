# Black Friday — Método RH Estratégico

Landing page estática (HTML, CSS e JavaScript puros, sem build e sem dependências).
Para publicar, envie a pasta inteira para a hospedagem (ou para uma pasta do WordPress, por exemplo `/black-friday/`).

## Estrutura

```
index.html         Página (seções comentadas na ordem da narrativa)
css/styles.css     Estilos, mobile-first, organizados por componente
js/config.js       >>> ÚNICO arquivo para preço, checkout, data e rastreamento <<<
js/offer.js        Preenche preço, selo de Black Friday e contador a partir do config
js/checkout.js     UTMs, formulário rápido (SellFlux) e redirecionamento ao checkout
js/tracking.js     GTM, Meta Pixel, Clarity e UTMify (não carregam em localhost)
js/ui.js           Mural de cursos, faixas, animações de entrada e CTA fixo
img/               Imagens otimizadas (WebP)  ·  img/cursos/ capas dos cursos
fonts/             Anton e Archivo (mesmas da campanha de captura)
```

## O que preencher em `js/config.js` antes de publicar

| Campo | Situação hoje |
|---|---|
| `offer.cashPrice`, `installments`, `installmentValue` | Preço atual do site (12x R$ 212,66 / R$ 1.997 à vista). Trocar pelo preço da Black. |
| `offer.isBlackFridayPrice` | `false`. Mude para `true` quando o preço da Black estiver preenchido: aparece o selo "Condição Black Friday" e a economia. |
| `offer.listPrice` | R$ 2.997 (o "De" do site atual). Confirme se continua valendo. |
| `offer.installmentNote` | Vazio. Preencha "sem juros" só se for verdade. |
| `offer.consultoria.enabled` | `true` (1h de consultoria para os 10 primeiros, condição do site atual). Desative se não valer na Black. |
| `campaign.endsAt` | `null`, por isso o contador fica oculto. Ex.: `'2026-11-30T23:59:59-03:00'`. |
| `checkout.url` | Checkout atual da Hotmart. Trocar pelo link/oferta da Black Friday. |
| `checkout.defaultParams` | Vazio. Opcional: `{ utm_campaign: 'black-friday-2026' }`. |
| `tracking.*` | IDs do site atual (GTM, Pixel, Clarity). Se publicar dentro do WordPress com o PixelYourSite ativo, zere `metaPixelId` e `gtmId` para não duplicar eventos. |

Ao abrir a página localmente (ou com `?preview=1` na URL), um aviso amarelo lista o que ainda está pendente. Visitantes comuns nunca veem esse aviso.

## Depois de publicar

- Em `index.html`, descomente `canonical` e `og:url` e troque `og:image` por URL absoluta (ex.: `https://.../img/og-image.jpg`).

## Eventos de conversão

- `dataLayer`: `cta_click` (com `cta_location`), `lead_form_open`, `generate_lead`, `begin_checkout`.
- Meta Pixel: `PageView` e `Lead` (no envio do formulário, igual ao site atual). O `InitiateCheckout` fica a cargo da integração do Pixel na Hotmart.
