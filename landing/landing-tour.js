/**
 * CastFlow Landing — Self-demonstrating tour
 * Uses CastFlow to showcase CastFlow on its own landing page.
 */
(function () {
  'use strict';

  // ---- Nav scroll effect ----
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  // ---- Tour definition ----
  const scenes = [
    // 1 — Welcome (no element, centered)
    {
      title: 'Welcome to CastFlow',
      text: 'This is a live, self-guided tour — built with CastFlow itself. Sit back and watch.',
      speech: 'Welcome to CastFlow! This is a live tour running on this very landing page. Let me show you what it can do.',
      i18n: {
        'es-ES': {
          title: 'Bienvenido a CastFlow',
          text: 'Este es un tour en vivo — construido con CastFlow. Siéntate y disfruta.',
          speech: '¡Bienvenido a CastFlow! Este es un tour en vivo funcionando en esta misma landing. Déjame enseñarte lo que puede hacer.'
        }
      }
    },
    // 2 — Hero title
    {
      element: '.hero-title',
      title: 'The pitch',
      text: 'CastFlow turns any website into an interactive guided tour — with voice, cursor, and spotlight.',
      speech: 'CastFlow turns any website into an interactive guided tour. Voice narration, animated cursor, and spotlight — like someone teaching you live.',
      i18n: {
        'es-ES': {
          title: 'La propuesta',
          text: 'CastFlow convierte cualquier web en un tour guiado interactivo — con voz, cursor y spotlight.',
          speech: 'CastFlow convierte cualquier web en un tour guiado interactivo. Narración por voz, cursor animado y spotlight — como si alguien te enseñara en directo.'
        }
      }
    },
    // 3 — TTS feature
    {
      element: '#feat-tts',
      title: 'Voice Narration',
      text: 'You\'re hearing it right now! Text-to-speech in 8+ languages with speed control.',
      speech: 'You\'re hearing this right now. CastFlow uses the browser\'s built-in text to speech. Eight languages, adjustable speed, and it just works.',
      cursorClick: true,
      i18n: {
        'es-ES': {
          title: 'Narración por voz',
          text: '¡Lo estás escuchando ahora mismo! Texto a voz en 8+ idiomas con control de velocidad.',
          speech: 'Lo estás escuchando ahora mismo. CastFlow usa la síntesis de voz nativa del navegador. Ocho idiomas, velocidad ajustable, y simplemente funciona.'
        }
      }
    },
    // 4 — Animated cursor
    {
      element: '#feat-cursor',
      title: 'Animated Cursor',
      text: 'See the cursor moving? It simulates a real person clicking and navigating.',
      speech: 'See the cursor moving across the page? It simulates a real person clicking and navigating. Much more engaging than static tooltips.',
      cursorClick: true,
      i18n: {
        'es-ES': {
          title: 'Cursor animado',
          text: '¿Ves el cursor moviéndose? Simula a una persona real haciendo clic y navegando.',
          speech: '¿Ves el cursor moviéndose por la página? Simula a una persona real haciendo clic y navegando. Mucho más atractivo que tooltips estáticos.'
        }
      }
    },
    // 5 — Spotlight
    {
      element: '#feat-spotlight',
      title: 'Spotlight Overlay',
      text: 'The page dims and only the relevant element is highlighted. Zero distraction.',
      speech: 'The page dims and only the relevant element stays highlighted. This spotlight overlay uses SVG masks for a smooth, professional effect.',
      cursorClick: true,
      i18n: {
        'es-ES': {
          title: 'Overlay con spotlight',
          text: 'La página se oscurece y solo el elemento relevante se ilumina. Cero distracción.',
          speech: 'La página se oscurece y solo el elemento relevante se ilumina. Este overlay usa máscaras SVG para un efecto suave y profesional.'
        }
      }
    },
    // 6 — Government use case
    {
      element: '#uc-gov',
      title: 'Government portals',
      text: 'Tax filing, immigration, social security — guide citizens through bureaucratic UIs.',
      speech: 'Think about government portals. Tax filing, immigration forms, social security. CastFlow can guide citizens step by step, reducing support calls dramatically.',
      i18n: {
        'es-ES': {
          title: 'Portales gubernamentales',
          text: 'Hacienda, inmigración, Seguridad Social — guía a ciudadanos por interfaces burocráticas.',
          speech: 'Piensa en los portales del gobierno. Hacienda, inmigración, Seguridad Social. CastFlow puede guiar a los ciudadanos paso a paso, reduciendo llamadas de soporte drásticamente.'
        }
      }
    },
    // 7 — Cloud use case
    {
      element: '#uc-cloud',
      title: 'Cloud & SaaS',
      text: 'Azure, AWS, Salesforce — onboard developers and admins in minutes.',
      speech: 'Cloud platforms like Azure and AWS have hundreds of settings. CastFlow onboards developers and admins in minutes instead of days.',
      i18n: {
        'es-ES': {
          title: 'Cloud y SaaS',
          text: 'Azure, AWS, Salesforce — incorpora desarrolladores y admins en minutos.',
          speech: 'Plataformas cloud como Azure y AWS tienen cientos de ajustes. CastFlow incorpora desarrolladores y administradores en minutos en vez de días.'
        }
      }
    },
    // 8 — Marketing use case
    {
      element: '#uc-marketing',
      title: 'Marketing platforms',
      text: 'Meta Ads, Google Ads, TikTok — teach marketing teams on the real UI.',
      speech: 'Marketing platforms like Meta Ads and Google Analytics are powerful but confusing. Create tours that teach your team directly on the live interface.',
      i18n: {
        'es-ES': {
          title: 'Plataformas de marketing',
          text: 'Meta Ads, Google Ads, TikTok — enseña a equipos de marketing en la UI real.',
          speech: 'Plataformas de marketing como Meta Ads y Google Analytics son potentes pero confusas. Crea tours que enseñen a tu equipo directamente en la interfaz real.'
        }
      }
    },
    // 9 — How it works — Step 1
    {
      element: '#step-1',
      title: 'Step 1: Define scenes',
      text: 'Write a simple JSON with target elements, titles, and narration text.',
      speech: 'Creating a tour is simple. Step one: define your scenes in a JSON array. Each scene has a target element, title, and narration text.',
      cursorClick: true,
      i18n: {
        'es-ES': {
          title: 'Paso 1: Define escenas',
          text: 'Escribe un JSON sencillo con elementos objetivo, títulos y texto de narración.',
          speech: 'Crear un tour es sencillo. Paso uno: define tus escenas en un array JSON. Cada escena tiene un elemento objetivo, título y texto de narración.'
        }
      }
    },
    // 10 — Extension
    {
      element: '#ext-visual',
      title: 'The Chrome Extension',
      text: 'Inject tours on ANY website — no source code access needed. This is the game changer.',
      speech: 'And here\'s the game changer. The Chrome extension lets you inject tours on any website. Azure, Hacienda, Shopify — you don\'t need to touch their source code. Perfect for consultants, trainers, and agencies.',
      i18n: {
        'es-ES': {
          title: 'La extensión de Chrome',
          text: 'Inyecta tours en CUALQUIER web — sin necesidad de acceder al código fuente. Esto lo cambia todo.',
          speech: 'Y aquí está lo que lo cambia todo. La extensión de Chrome te permite inyectar tours en cualquier web. Azure, Hacienda, Shopify — no necesitas tocar su código fuente. Perfecto para consultores, formadores y agencias.'
        }
      }
    },
    // 11 — Comparison table
    {
      element: '#comp-table',
      title: 'Not just tooltips',
      text: 'CastFlow combines the best of video tutorials and tooltip libraries — with none of the downsides.',
      speech: 'CastFlow is not just another tooltip library. It combines voice narration from video tutorials with the interactivity of guided tours — and works on third party sites via the extension.',
      i18n: {
        'es-ES': {
          title: 'No son solo tooltips',
          text: 'CastFlow combina lo mejor de los videotutoriales y las librerías de tooltips — sin los inconvenientes.',
          speech: 'CastFlow no es solo otra librería de tooltips. Combina la narración por voz de los videotutoriales con la interactividad de los tours guiados — y funciona en sitios de terceros gracias a la extensión.'
        }
      }
    },
    // 12 — Final CTA
    {
      element: '#cta',
      title: 'Ready to start?',
      text: 'Open source, free forever. Start building tours today.',
      speech: 'That\'s CastFlow. Open source, zero dependencies, free forever. Start building tours that actually help your users. Thanks for watching!',
      i18n: {
        'es-ES': {
          title: '¿Listo para empezar?',
          text: 'Open source, gratis para siempre. Empieza a crear tours hoy.',
          speech: 'Eso es CastFlow. Open source, cero dependencias, gratis para siempre. Empieza a crear tours que realmente ayuden a tus usuarios. ¡Gracias por ver el tour!'
        }
      }
    }
  ];

  // ---- Detect language (syncs with i18n toggle) ----
  function getTourLang() {
    return window._castflowLandingLang ||
      (navigator.language && navigator.language.startsWith('es') ? 'es-ES' : 'en-US');
  }

  // ---- Start tour function ----
  function startTour() {
    // Scroll to top first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(function () {
      var lang = getTourLang();
      var tour = new CastFlow({
        scenes: scenes,
        lang: lang,
        autoPlay: true,
        speed: 1.25,
        showCursor: true,
        theme: 'light',
        startCollapsed: false,
        sceneDelay: 600,
        padding: 16,
        overlayColor: 'rgba(0, 0, 0, 0.55)',
        defaultVoices: {
          'es-ES': 'Microsoft Alvaro Online (Natural) - Spanish (Spain)',
          'en-US': 'Google UK English Male'
        },
        onComplete: function () {
          // Scroll back up gracefully
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
      tour.start();
    }, 400);
  }

  // ---- Bind all tour buttons ----
  var tourButtons = ['btn-start-tour', 'btn-hero-tour', 'btn-ext-tour', 'btn-cta-tour'];
  tourButtons.forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        startTour();
      });
    }
  });

})();
