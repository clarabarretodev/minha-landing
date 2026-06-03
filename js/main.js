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
     PARTE 3 — FORMULÁRIO DE CONTATO
     ==========================================

     O formulário tem novalidate no HTML, então
     o browser não valida sozinho. O JS faz:
     1. Verifica se os campos estão preenchidos
     2. Verifica se o email tem formato válido
     3. Mostra feedback visual para o usuário
     4. (Futuro) envia os dados para um serviço

     CONCEITOS NOVOS:
     → event.target: o elemento que disparou
       o evento (no caso, o form)
     → .value: lê o conteúdo digitado num input
     → .trim(): remove espaços em branco das
       pontas de uma string
     → RegExp / regex: padrão para validar
       o formato de um email
     → classList.add / remove: adiciona ou
       remove classes CSS de um elemento
     ========================================== */

  const form = document.getElementById('contact-form');

  if (form) {

    form.addEventListener('submit', function (event) {

      /* cancela o envio padrão do browser
         (que recarregaria a página)         */
      event.preventDefault();

      /* lê os valores dos campos
         .trim() remove espaços acidentais
         ex: "  clara  " → "clara"           */
      const nome     = document.getElementById('nome').value.trim();
      const email    = document.getElementById('email').value.trim();
      const mensagem = document.getElementById('mensagem').value.trim();

      /* ── validação ──

         Um array (lista) de erros.
         Se ficar vazio ao final, tudo certo.
         Se tiver itens, mostramos as mensagens. */
      const erros = [];

      if (nome === '') {
        erros.push('Por favor, informe seu nome.');
      }

      /* regex de email: verifica se tem o padrão
         texto@texto.texto
         O método .test() retorna true ou false   */
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email === '') {
        erros.push('Por favor, informe seu email.');
      } else if (!emailRegex.test(email)) {
        erros.push('Por favor, informe um email válido.');
      }

      if (mensagem === '') {
        erros.push('Por favor, escreva uma mensagem.');
      }

      /* ── feedback visual ──

         Busca ou cria um elemento de feedback
         logo abaixo do botão de envio.          */
      let feedback = document.getElementById('form-feedback');

      if (!feedback) {
        /* cria o elemento se ainda não existe */
        feedback = document.createElement('p');
        feedback.id = 'form-feedback';
        feedback.style.fontSize   = '12px';
        feedback.style.marginTop  = '8px';
        feedback.style.fontFamily = 'monospace';
        form.appendChild(feedback);
      }

      if (erros.length > 0) {

        /* mostra o primeiro erro encontrado */
        feedback.textContent = erros[0];
        feedback.style.color = '#ff6b6b'; /* vermelho — erro */

        /* foco no primeiro campo com problema
           para acessibilidade                  */
        if (nome === '') {
          document.getElementById('nome').focus();
        } else if (!emailRegex.test(email)) {
          document.getElementById('email').focus();
        } else {
          document.getElementById('mensagem').focus();
        }

      } else {

        /* ── sucesso ──

           Aqui você vai conectar com um serviço
           de envio de emails no futuro.
           Opções: Formspree, EmailJS, Web3Forms
           (todos têm plano gratuito).

           Por enquanto, só mostra confirmação.  */

        feedback.textContent = 'Mensagem enviada! Em breve entro em contato.';
        feedback.style.color = '#e8ff5a'; /* amarelo — sucesso */

        /* limpa o formulário após envio */
        form.reset();

        /* remove o feedback depois de 5 segundos
           setTimeout executa uma função uma vez
           após o delay em milissegundos          */
        setTimeout(function () {
          feedback.textContent = '';
        }, 5000);

      }

    }); /* fim do submit listener */

  } /* fim do if do form */


}); /* fim do DOMContentLoaded */
