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


    // Etiqueta de urgência ao lado de "BLACK FRIDAY" (hero e bloco do vitalício).
    // Use somente se for verdade no dia em que a página estiver no ar.
    // null esconde a etiqueta.
    urgencyTag: null,
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
    isBlackFridayPrice: true,      // Black Friday: 30% OFF e preço "De"

    // [CONFIRMADO] Black Friday do mês (a partir de 06/11): 30% OFF para todos,
    // alunos e novos alunos, igual à página do vídeo. Cupom BLACK30.
    priceConfirmed: true,
    listPrice: 1997,               // preço "De" (preço cheio)
    cashPrice: 1397.90,            // 30% OFF sobre R$ 1.997
    tiers: null,                   // um preço só, para todos
    // Com promoção ativa, o "% OFF" é calculado a partir de listPrice e cashPrice.

    // [PENDENTE] valor da parcela em 12x na Hotmart. Enquanto for null, a
    // página mostra "R$ 1.397,90 à vista ou em até 12x no cartão".
    installments: null,
    installmentValue: null,
    installmentNote: '',           // ex.: 'sem juros' (preencha só se for verdade)

    showSavings: true,             // mostra "economia" (só quando isBlackFridayPrice = true)

    // Acesso: vitalício à plataforma completa (textos direto no index.html).
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
    // [CONFIRMADO] checkout da Black do mês (cupom BLACK30), o mesmo da página do vídeo.
    url: 'https://pay.hotmart.com/N103364259K?offDiscount=BLACK30&bid=1794225083425',

    // Checkout por botão (vazio = todos os botões usam o url acima).
    urls: {},

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
      // [CONFIRMADO] Webhook SellFlux da campanha.
      webhookUrl: 'https://webhook.sellflux.app/v2/webhook/custom/f39c600d3d8414b3a7bd057498e97ede',
      // Um webhook por público. Vazio = usa o webhookUrl acima.
      // O lead também vai com o campo aluno: 'sim' / 'nao'.
      // Público único: todos os leads vão para o webhookUrl acima (igual à página do vídeo).
      // Webhook dos não alunos (Black de 05/11): a65b8575d8b7f0aa22fd74c951b5c3a4
      webhookUrls: {},
      // Parâmetros de pré-preenchimento do checkout da Hotmart:
      // nome, e-mail, DDD (phoneac) e número do telefone (phonenumber).
      prefillParams: { name: 'name', email: 'email', phoneAreaCode: 'phoneac', phoneNumber: 'phonenumber' },
    },
  },

  /* ----------------------------------------------------------------------
     CONTATO E LINKS INSTITUCIONAIS [CONFIRMADO]
     ---------------------------------------------------------------------- */
  contact: {
    privacyUrl: 'https://soluterh.com.br/politica-de-privacidade.html',
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
    metaPixelId: '3251089601854184',
    clarityId: 'rl00japbzt',
    utmify: true,
  },
};
