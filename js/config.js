/* ==========================================================================
   CONFIGURAÇÃO COMERCIAL DA CAMPANHA
   --------------------------------------------------------------------------
   Este é o ÚNICO arquivo que precisa ser editado para mudar preço, checkout,
   data de encerramento e textos promocionais. Os componentes da página leem
   tudo daqui.

   Legenda dos comentários:
     [CONFIRMADO]  valor publicado em https://metodorhestrategico.com.br/
     [PENDENTE]    ainda precisa ser definido para a Black Friday
   ========================================================================== */

window.RH_CONFIG = {

  /* ----------------------------------------------------------------------
     CAMPANHA
     ---------------------------------------------------------------------- */
  campaign: {
    // [PENDENTE] Data REAL de encerramento, no horário de Brasília (-03:00).
    // Enquanto for null, a faixa com o contador regressivo NÃO aparece.
    // Exemplo: '2026-11-30T23:59:59-03:00'
    endsAt: null,
  },

  /* ----------------------------------------------------------------------
     OFERTA E PREÇO
     ----------------------------------------------------------------------
     Os valores abaixo são os do site oficial hoje [CONFIRMADO].
     Quando o preço de Black Friday for definido:
       1. troque cashPrice / installments / installmentValue;
       2. mude isBlackFridayPrice para true.
     Com isBlackFridayPrice = false, a página NÃO chama o preço de
     "condição de Black Friday" nem exibe economia.
     ---------------------------------------------------------------------- */
  offer: {
    isBlackFridayPrice: false,     // [PENDENTE] true somente com o preço de BF definido

    listPrice: 2997,               // [CONFIRMADO] preço "De". Use null para não exibir.
    cashPrice: 1997,               // [CONFIRMADO] valor à vista
    installments: 12,              // [CONFIRMADO] número de parcelas
    installmentValue: 212.66,      // [CONFIRMADO] valor de cada parcela
    installmentNote: '',           // ex.: 'sem juros' (preencha só se for verdade)

    showSavings: true,             // mostra "economia" (só quando isBlackFridayPrice = true)

    accessMonths: 12,              // [CONFIRMADO] meses de acesso
    paymentMethods: 'Cartão de crédito, Pix e PayPal', // [CONFIRMADO] conforme FAQ do site

    // [CONFIRMADO no site atual] Condição limitada da turma.
    // Desative (enabled: false) se não valer para a Black Friday.
    consultoria: {
      enabled: true,
      text: '1 hora de consultoria individual com a Rose para os 10 primeiros inscritos',
    },
  },

  /* ----------------------------------------------------------------------
     CHECKOUT
     ---------------------------------------------------------------------- */
  checkout: {
    // [PENDENTE] Troque pelo link do checkout de Black Friday.
    // Hoje este é o checkout oficial usado pelo formulário do site atual (Hotmart).
    url: 'https://pay.hotmart.com/N103364259K?off=2j6xzmn0',

    // Parâmetros da URL da página que são repassados ao checkout
    // (UTMs + parâmetros de rastreio aceitos pela Hotmart).
    passParams: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck', 'xcod'],

    // Parâmetros fixos adicionados ao checkout quando o visitante não trouxer
    // o seu próprio. Ex.: { utm_campaign: 'black-friday-2026' }
    defaultParams: {},

    // Formulário rápido antes do checkout (mesmo fluxo do site atual):
    // envia nome, e-mail e WhatsApp à SellFlux (recuperação de carrinho)
    // e abre o checkout com os dados preenchidos.
    // Com enabled: false, os botões vão direto para o checkout.
    leadCapture: {
      enabled: true,
      webhookUrl: 'https://webhook.sellflux.app/v2/webhook/wordpress/37e214369f96f471972a99005a0a9da8',
      // Nomes dos parâmetros de pré-preenchimento usados no checkout.
      prefillParams: { name: 'name', email: 'email', phone: 'phone' },
    },
  },

  /* ----------------------------------------------------------------------
     CONTATO E LINKS INSTITUCIONAIS [CONFIRMADO]
     ---------------------------------------------------------------------- */
  contact: {
    privacyUrl: 'https://curso.soluterh.com.br/politicas-de-privacidade/',
    emecUrl: 'https://emec.mec.gov.br/emec/consulta-cadastro/detalhamento/d96957f455f6405d14c6542552b0f6eb/MjI2NjA=',
  },

  /* ----------------------------------------------------------------------
     RASTREAMENTO
     IDs copiados do site oficial [CONFIRMADO]. Use null para desativar.
     Os scripts não carregam em localhost nem ao abrir o arquivo direto,
     para não sujar os dados com testes.
     Se a página for publicada dentro do WordPress com o PixelYourSite ativo,
     desative aqui o metaPixelId e o gtmId para não duplicar eventos.
     ---------------------------------------------------------------------- */
  tracking: {
    gtmId: 'GTM-PGX58T8Q',
    metaPixelId: '173653188072538',
    clarityId: 'rl00japbzt',
    utmify: true,
  },
};
