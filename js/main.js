/* ============================================
   main.js — clarabarretodev
   Interações gerais da página:
   1. Scroll suave da nav
   2. Carrossel (scroll + dots)
   3. Formulário de contato
   ============================================ */


/* ============================================
   COMO O JAVASCRIPT SE CONECTA AO HTML

   O JS enxerga o HTML como uma árvore de
   elementos chamada DOM (Document Object Model).
   Para manipular qualquer elemento, primeiro
   você precisa "selecioná-lo" — como apontar
   para ele e dizer "é esse aqui".

   Os dois métodos mais comuns:

   document.querySelector('.classe')
   → retorna O PRIMEIRO elemento que tem
     aquela classe ou seletor CSS.
     Se não encontrar, retorna null.

   document.querySelectorAll('.classe')
   → retorna TODOS os elementos que batem
     com o seletor, numa NodeList (lista).

   Exemplo:
   const btn = document.querySelector('.nav-cta')
   → agora btn é o elemento <a class="nav-cta">
     e você pode ler e mudar qualquer coisa dele.
   ============================================ */


/* ============================================
   BLOCO 1 — ESPERAR O HTML ESTAR PRONTO

   O browser lê o HTML de cima pra baixo.
   Mesmo com o <script> no final do <body>,
   é boa prática envolver tudo num listener
   que garante que o DOM está 100% montado
   antes de qualquer código rodar.

   'DOMContentLoaded' dispara quando o HTML
   foi completamente lido e montado.
   É diferente de 'load', que só dispara
   depois de imagens e fontes carregarem.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Todas as funções ficam dentro deste
        bloco para garantir que o DOM existe
        quando elas tentarem acessá-lo.      ── */


  /* ==========================================
     PARTE 1 — SCROLL SUAVE DA NAV
     ==========================================

     PROBLEMA: os links da nav têm href="#sobre",
     "#trabalho" etc. Por padrão o browser pula
     direto para a seção — sem animação.

     SOLUÇÃO: interceptar o clique, cancelar o
     comportamento padrão, e rolar suavemente
     até o destino com scrollIntoView().

     CONCEITOS NOVOS:
     → addEventListener: "quando X acontecer,
       execute esta função"
     → event.preventDefault(): cancela o que
       o browser faria por padrão
     → getAttribute: lê o valor de um atributo
       HTML (href, id, aria-label, etc)
     → scrollIntoView: rola a página até o
       elemento ficar visível
     ========================================== */

  /* Seleciona TODOS os links que começam com '#'
     — o seletor CSS [href^="#"] significa
     "atributo href que começa com #"           */
  const navLinks = document.querySelectorAll('a[href^="#"]');

  /* Para cada link encontrado, adiciona um
     listener de clique. O forEach percorre
     a lista e executa a função para cada item. */
  navLinks.forEach(function (link) {

    link.addEventListener('click', function (event) {

      /* event é o objeto que descreve o clique:
         onde foi, qual elemento, etc.
         preventDefault() cancela o salto padrão */
      event.preventDefault();

      /* getAttribute('href') lê o valor do href
         ex: "#sobre" → targetId = "#sobre"      */
      const targetId = link.getAttribute('href');

      /* document.querySelector('#sobre') encontra
         a section com id="sobre" no HTML         */
      const targetElement = document.querySelector(targetId);

      /* só rola se o elemento existir na página  */
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth', /* animação de scroll */
          block: 'start'      /* alinha pelo topo do elemento */
        });
      }

    });
  });

  /* ── Por que fazer isso se o CSS já tem
        scroll-behavior: smooth no reset.css? ──

     O CSS smooth scroll não funciona em todos
     os browsers antigos. O JS é o fallback
     seguro. Quando ambos existem, o JS vence
     porque usa preventDefault() antes.         */


  /* ==========================================
     PARTE 2 — CARROSSEL
     ==========================================

     O carrossel funciona com CSS scroll snap
     (definido no layout.css) — o browser já
     "encaixa" os cards automaticamente.

     O JS só precisa fazer duas coisas:
     1. Quando o usuário scrolla, atualizar
        qual dot está ativo
     2. Quando o usuário clica num dot,
        scrollar até o card correspondente

     CONCEITOS NOVOS:
     → IntersectionObserver: observa quando
       um elemento entra/sai da tela
     → scrollTo: rola um elemento até uma
       posição específica
     → dataset: lê atributos data-* do HTML
       ex: data-index="0" → el.dataset.index
     ========================================== */

  const track = document.getElementById('carousel-track');
  const dots   = document.querySelectorAll('.carousel-dot');
  const cards  = document.querySelectorAll('.carousel-card');

  /* Só inicializa o carrossel se os elementos
     existirem. Checagem defensiva — evita erros
     se o HTML mudar no futuro.                 */
  if (track && dots.length && cards.length) {

    /* ── PARTE 2A: atualizar dots ao scrollar ──

       IntersectionObserver "observa" elementos
       e avisa quando eles ficam visíveis.

       threshold: 0.6 significa "avisa quando
       60% do elemento estiver visível".
       root: track significa "visível dentro
       do track, não da janela inteira".         */

    const observer = new IntersectionObserver(
      function (entries) {

        /* entries é uma lista de elementos que
           mudaram de estado (entraram ou saíram
           da área visível)                      */
        entries.forEach(function (entry) {

          /* isIntersecting: true quando o elemento
             ficou visível (entrou na área)       */
          if (entry.isIntersecting) {

            /* entry.target é o card que ficou visível.
               Array.from converte NodeList em Array
               para poder usar indexOf.           */
            const index = Array.from(cards).indexOf(entry.target);

            /* atualiza todos os dots:
               o do índice correspondente fica ativo,
               os outros ficam inativos            */
            dots.forEach(function (dot, i) {
              const isActive = i === index;
              dot.setAttribute('aria-selected', isActive);
              /* aria-selected já controla o visual
                 via CSS: [aria-selected="true"]   */
            });
          }
        });
      },
      {
        root:      track,  /* área de referência: o track */
        threshold: 0.6     /* 60% do card visível         */
      }
    );

    /* diz ao observer para vigiar cada card */
    cards.forEach(function (card) {
      observer.observe(card);
    });


    /* ── PARTE 2B: clicar num dot scrolla o track ──

       Cada dot tem data-index="0", "1", "2" no HTML.
       Quando clicado, lemos esse índice e scrollamos
       o track até o card correspondente.            */

    dots.forEach(function (dot) {

      dot.addEventListener('click', function () {

        /* dataset.index lê o atributo data-index
           mas retorna uma string — Number() converte
           para número para usar como índice          */
        const index = Number(dot.dataset.index);
        const targetCard = cards[index];

        if (targetCard) {

          /* offsetLeft: distância do card ao início
             do track. É onde precisamos scrollar.   */
          track.scrollTo({
            left:     targetCard.offsetLeft,
            behavior: 'smooth'
          });
        }
      });
    });


    
  } /* fim do if de verificação do carrossel */

  /* ==========================================
     PARTE 3 — BOTÃO DE COPIAR EMAIL
     ========================================== */

  const copyBtn = document.querySelector('.contact-copy');

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      const text = copyBtn.getAttribute('data-copy');
      navigator.clipboard.writeText(text).then(function () {
        const original = copyBtn.textContent;
        copyBtn.textContent = 'Copiado!';
        setTimeout(function () {
          copyBtn.textContent = original;
        }, 2000);
      });
    });
  }


  /* ==========================================
     PARTE 4 — PARALLAX DO FUNDO EM CONTATO
     ==========================================

     getBoundingClientRect(): posição do elemento
     em relação à janela visível agora.
     .top = distância do topo do elemento até
     o topo da tela (negativo depois que passa).

     ticking: evita calcular mais vezes por
     segundo do que o navegador consegue desenhar.
     ========================================== */

  const contactBg = document.querySelector('.contact-bg');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (contactBg && !prefersReducedMotion) {

    let ticking = false;

    function updateParallax() {
      const rect = contactBg.parentElement.getBoundingClientRect();

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const speed = 0.15;
        const offset = rect.top * speed;
        contactBg.style.transform = 'translateY(' + offset + 'px)';
      }

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });
  }


}); /* fim do DOMContentLoaded */

