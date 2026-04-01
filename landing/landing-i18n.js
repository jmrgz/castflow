/**
 * CastFlow Landing — i18n system
 * Client-side language switcher (EN / ES).
 * Reads data-i18n (textContent) and data-i18n-html (innerHTML) attributes.
 */
(function () {
  'use strict';

  // ---- Translations ----
  var T = {
    en: {
      // Nav
      'nav.features': 'Features',
      'nav.usecases': 'Use Cases',
      'nav.how': 'How It Works',
      'nav.extension': 'Extension',
      'nav.tour': 'Watch the Tour',

      // Hero
      'hero.badge': 'Open Source \u00b7 Zero Dependencies \u00b7 Works Everywhere',
      'hero.title': 'Turn any website into an<br /><span class="gradient-text">interactive guided tour</span>',
      'hero.subtitle': 'Voice narration, animated cursor, spotlight overlay \u2014 like someone is teaching you live. Works on <strong>any site</strong> via a Chrome extension. No code access needed.',
      'hero.cta': 'See It In Action',
      'hero.stat1': 'dependencies',
      'hero.stat3': 'languages',

      // Features
      'features.tag': 'Features',
      'features.title': 'Everything you need.<br class="hide-mobile" /> Nothing you don\'t.',
      'features.desc': 'Pure vanilla JS. No build tools, no frameworks, no conflicts.',
      'feat.tts.title': 'Voice Narration (TTS)',
      'feat.tts.desc': 'Natural text-to-speech in 8+ languages with voice & speed control. Users <em>listen</em> instead of reading walls of text.',
      'feat.cursor.title': 'Animated Cursor',
      'feat.cursor.desc': 'A fake cursor moves to each element and clicks \u2014 exactly like a screen recording, but live and always up-to-date.',
      'feat.spotlight.title': 'Spotlight Overlay',
      'feat.spotlight.desc': 'SVG mask-based cutout with pulsating ring. Dims the page, highlights what matters. Zero distraction.',
      'feat.player.title': 'Video-like Player Bar',
      'feat.player.desc': 'Play/pause, timeline scrubber, speed control, scene counter. Users already know how to use a video player.',
      'feat.actions.title': 'Scene Actions',
      'feat.actions.desc': 'Click buttons, open modals, toggle menus \u2014 the tour interacts with the real UI, not just points at it.',
      'feat.i18n.title': 'Multi-language (i18n)',
      'feat.i18n.desc': 'Each scene supports localized text and speech. One tour serves global audiences with a language switcher.',

      // Use Cases
      'uc.tag': 'Use Cases',
      'uc.title': 'Where CastFlow shines',
      'uc.desc': 'Complex interfaces + occasional users + high cost of error = massive value.',
      'uc.gov.title': 'Government & Public Services',
      'uc.gov.desc': 'Tax filing, immigration forms, social security portals. Guide citizens through bureaucratic UI step by step \u2014 reduce support calls by 80%.',
      'uc.cloud.title': 'Cloud Platforms & SaaS',
      'uc.cloud.desc': 'Azure, AWS, GCP \u2014 hundreds of settings, IAM roles, billing dashboards. Onboard developers in minutes, not days.',
      'uc.mkt.title': 'Marketing & Ads Platforms',
      'uc.mkt.desc': 'Create campaigns, set up pixels, build audiences. Teach marketing teams to use Meta Ads, Google Ads or LinkedIn \u2014 live on the real UI.',
      'uc.ecom.title': 'E-commerce Admin Panels',
      'uc.ecom.desc': 'Shopify, WooCommerce, Amazon Seller Central \u2014 help merchants configure their stores, payments, and shipping without support tickets.',
      'uc.ent.title': 'Enterprise Onboarding',
      'uc.ent.desc': 'ERPs, CRMs, HR tools \u2014 train new employees on internal systems without scheduling a single meeting. Interactive, self-paced, repeatable.',
      'uc.edu.title': 'Education & LMS',
      'uc.edu.desc': 'Guide teachers through course creation and students through enrollment. Works on Moodle, Canvas, Google Classroom \u2014 unchanged.',

      // How It Works
      'how.tag': 'How It Works',
      'how.title': 'Three steps. That\'s it.',
      'how.s1.title': 'Define your scenes',
      'how.s1.desc': 'Write a JSON array of steps: target element, title, narration text, and optional actions.',
      'how.s2.title': 'Load CastFlow',
      'how.s2.desc': 'Include the JS + CSS (15KB total), or install the Chrome extension for third-party sites.',
      'how.s3.title': 'Watch it play',
      'how.s3.desc': 'Voice narration, animated cursor, spotlight \u2014 your users get a live, interactive walkthrough.',

      // Extension
      'ext.tag': 'Chrome Extension',
      'ext.title': 'Guide users on sites <em>you don\'t own</em>',
      'ext.desc': 'The CastFlow extension injects tours on <strong>any webpage</strong>. Create guided walkthroughs for Azure, Hacienda, Meta Ads, Shopify \u2014 without touching their source code.',
      'ext.f1': '\u2713 Works on any URL \u2014 no code access needed',
      'ext.f2': '\u2713 Share tours as JSON files with your team',
      'ext.f3': '\u2713 Perfect for consultants, trainers, and agencies',
      'ext.f4': '\u2713 One-click inject from the browser toolbar',
      'ext.cta': 'Take the Tour',

      // Comparison
      'comp.tag': 'Why CastFlow?',
      'comp.title': 'Not just a tooltip library',
      'comp.h.video': 'Video tutorials',
      'comp.h.tooltip': 'Tooltip tours',
      'comp.r1.label': 'Always up-to-date',
      'comp.r1.video': '\u2717 Re-record on every UI change',
      'comp.r2.label': 'Voice narration',
      'comp.r2.cf': '\u2713 TTS in 8 languages',
      'comp.r3.label': 'Interactive',
      'comp.r3.video': '\u2717 Passive watching',
      'comp.r3.tooltip': '~ Click to advance',
      'comp.r3.cf': '\u2713 Clicks, modals, actions',
      'comp.r4.label': 'Works on 3rd-party sites',
      'comp.r4.video': '\u2713 Screen record anything',
      'comp.r4.tooltip': '\u2717 Needs code access',
      'comp.r4.cf': '\u2713 Chrome extension',
      'comp.r5.label': 'Zero dependencies',
      'comp.r5.tooltip': '~ Most need npm',

      // CTA
      'cta.title': 'Ready to guide your users?',
      'cta.desc': 'Start building tours in minutes. Open source, free forever.',
      'cta.tour': 'Watch the Tour Again',
      'cta.github': 'Get Started on GitHub \u2192',

      // Footer
      'footer.text': 'Open source \u00b7 MIT License \u00b7 Made with \u2615 and vanilla JS'
    },

    es: {
      // Nav
      'nav.features': 'Funcionalidades',
      'nav.usecases': 'Casos de uso',
      'nav.how': 'C\u00f3mo funciona',
      'nav.extension': 'Extensi\u00f3n',
      'nav.tour': 'Ver el Tour',

      // Hero
      'hero.badge': 'Open Source \u00b7 Cero dependencias \u00b7 Funciona en todas partes',
      'hero.title': 'Convierte cualquier web en un<br /><span class="gradient-text">tour guiado interactivo</span>',
      'hero.subtitle': 'Narraci\u00f3n por voz, cursor animado, spotlight \u2014 como si alguien te ense\u00f1ara en directo. Funciona en <strong>cualquier sitio</strong> con una extensi\u00f3n de Chrome. Sin acceso al c\u00f3digo.',
      'hero.cta': 'Verlo en acci\u00f3n',
      'hero.stat1': 'dependencias',
      'hero.stat3': 'idiomas',

      // Features
      'features.tag': 'Funcionalidades',
      'features.title': 'Todo lo que necesitas.<br class="hide-mobile" /> Nada que no.',
      'features.desc': 'Vanilla JS puro. Sin build tools, sin frameworks, sin conflictos.',
      'feat.tts.title': 'Narraci\u00f3n por voz (TTS)',
      'feat.tts.desc': 'Texto a voz natural en 8+ idiomas con control de voz y velocidad. Los usuarios <em>escuchan</em> en vez de leer muros de texto.',
      'feat.cursor.title': 'Cursor animado',
      'feat.cursor.desc': 'Un cursor falso se mueve a cada elemento y hace clic \u2014 exactamente como un screencast, pero en vivo y siempre actualizado.',
      'feat.spotlight.title': 'Overlay con spotlight',
      'feat.spotlight.desc': 'Recorte basado en m\u00e1scaras SVG con anillo pulsante. Oscurece la p\u00e1gina, ilumina lo que importa. Cero distracci\u00f3n.',
      'feat.player.title': 'Barra tipo reproductor',
      'feat.player.desc': 'Play/pausa, barra de progreso, control de velocidad, contador de escenas. Los usuarios ya saben usar un reproductor de v\u00eddeo.',
      'feat.actions.title': 'Acciones en escena',
      'feat.actions.desc': 'Pulsa botones, abre modales, despliega men\u00fas \u2014 el tour interact\u00faa con la UI real, no solo se\u00f1ala.',
      'feat.i18n.title': 'Multi-idioma (i18n)',
      'feat.i18n.desc': 'Cada escena soporta texto y voz localizados. Un solo tour sirve a audiencias globales con un selector de idioma.',

      // Use Cases
      'uc.tag': 'Casos de uso',
      'uc.title': 'Donde CastFlow brilla',
      'uc.desc': 'Interfaces complejas + usuarios ocasionales + alto coste de error = valor enorme.',
      'uc.gov.title': 'Gobierno y servicios p\u00fablicos',
      'uc.gov.desc': 'Declaraci\u00f3n de la renta, formularios de inmigraci\u00f3n, portales de la Seguridad Social. Gu\u00eda a los ciudadanos paso a paso \u2014 reduce las llamadas de soporte un 80%.',
      'uc.cloud.title': 'Plataformas cloud y SaaS',
      'uc.cloud.desc': 'Azure, AWS, GCP \u2014 cientos de ajustes, roles IAM, dashboards de facturaci\u00f3n. Incorpora desarrolladores en minutos, no en d\u00edas.',
      'uc.mkt.title': 'Plataformas de marketing y ads',
      'uc.mkt.desc': 'Crea campa\u00f1as, configura p\u00edxeles, construye audiencias. Ense\u00f1a a los equipos de marketing a usar Meta Ads, Google Ads o LinkedIn \u2014 en la UI real.',
      'uc.ecom.title': 'Paneles de e-commerce',
      'uc.ecom.desc': 'Shopify, WooCommerce, Amazon Seller Central \u2014 ayuda a los comerciantes a configurar sus tiendas, pagos y env\u00edos sin tickets de soporte.',
      'uc.ent.title': 'Onboarding empresarial',
      'uc.ent.desc': 'ERPs, CRMs, herramientas de RRHH \u2014 forma a nuevos empleados en sistemas internos sin agendar ni una reuni\u00f3n. Interactivo, a su ritmo, repetible.',
      'uc.edu.title': 'Educaci\u00f3n y LMS',
      'uc.edu.desc': 'Gu\u00eda a profesores en la creaci\u00f3n de cursos y a estudiantes en la matr\u00edcula. Funciona en Moodle, Canvas, Google Classroom \u2014 sin cambios.',

      // How It Works
      'how.tag': 'C\u00f3mo funciona',
      'how.title': 'Tres pasos. Nada m\u00e1s.',
      'how.s1.title': 'Define tus escenas',
      'how.s1.desc': 'Escribe un array JSON de pasos: elemento objetivo, t\u00edtulo, texto de narraci\u00f3n y acciones opcionales.',
      'how.s2.title': 'Carga CastFlow',
      'how.s2.desc': 'Incluye JS + CSS (15KB total), o instala la extensi\u00f3n de Chrome para sitios de terceros.',
      'how.s3.title': 'Mira c\u00f3mo funciona',
      'how.s3.desc': 'Narraci\u00f3n por voz, cursor animado, spotlight \u2014 tus usuarios reciben una gu\u00eda interactiva en vivo.',

      // Extension
      'ext.tag': 'Extensi\u00f3n de Chrome',
      'ext.title': 'Gu\u00eda usuarios en sitios <em>que no son tuyos</em>',
      'ext.desc': 'La extensi\u00f3n de CastFlow inyecta tours en <strong>cualquier p\u00e1gina web</strong>. Crea gu\u00edas para Azure, Hacienda, Meta Ads, Shopify \u2014 sin tocar su c\u00f3digo fuente.',
      'ext.f1': '\u2713 Funciona en cualquier URL \u2014 sin acceso al c\u00f3digo',
      'ext.f2': '\u2713 Comparte tours como archivos JSON con tu equipo',
      'ext.f3': '\u2713 Perfecto para consultores, formadores y agencias',
      'ext.f4': '\u2713 Inyecci\u00f3n con un clic desde la barra del navegador',
      'ext.cta': 'Ver el Tour',

      // Comparison
      'comp.tag': '\u00bfPor qu\u00e9 CastFlow?',
      'comp.title': 'No es solo una librer\u00eda de tooltips',
      'comp.h.video': 'V\u00eddeo tutoriales',
      'comp.h.tooltip': 'Tours con tooltips',
      'comp.r1.label': 'Siempre actualizado',
      'comp.r1.video': '\u2717 Re-grabar con cada cambio de UI',
      'comp.r2.label': 'Narraci\u00f3n por voz',
      'comp.r2.cf': '\u2713 TTS en 8 idiomas',
      'comp.r3.label': 'Interactivo',
      'comp.r3.video': '\u2717 Visionado pasivo',
      'comp.r3.tooltip': '~ Clic para avanzar',
      'comp.r3.cf': '\u2713 Clics, modales, acciones',
      'comp.r4.label': 'Funciona en sitios de terceros',
      'comp.r4.video': '\u2713 Grabar pantalla de cualquier cosa',
      'comp.r4.tooltip': '\u2717 Necesita acceso al c\u00f3digo',
      'comp.r4.cf': '\u2713 Extensi\u00f3n de Chrome',
      'comp.r5.label': 'Cero dependencias',
      'comp.r5.tooltip': '~ La mayor\u00eda necesitan npm',

      // CTA
      'cta.title': '\u00bfListo para guiar a tus usuarios?',
      'cta.desc': 'Empieza a crear tours en minutos. Open source, gratis para siempre.',
      'cta.tour': 'Ver el Tour otra vez',
      'cta.github': 'Empezar en GitHub \u2192',

      // Footer
      'footer.text': 'Open source \u00b7 Licencia MIT \u00b7 Hecho con \u2615 y vanilla JS'
    }
  };

  // ---- State ----
  var LANG_KEY = 'castflow-landing-lang';
  var currentLang = localStorage.getItem(LANG_KEY) ||
    (navigator.language && navigator.language.startsWith('es') ? 'es' : 'en');

  // ---- Apply translations ----
  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    var dict = T[lang] || T.en;

    // data-i18n → textContent
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.textContent = dict[key];
    });

    // data-i18n-html → innerHTML (only for trusted, hardcoded strings)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (dict[key] != null) el.innerHTML = dict[key];
    });

    // Update toggle button
    var flagEl = document.querySelector('[data-lang-flag]');
    var codeEl = document.querySelector('[data-lang-code]');
    if (flagEl) flagEl.textContent = lang === 'es' ? '\ud83c\uddea\ud83c\uddf8' : '\ud83c\uddfa\ud83c\uddf8';
    if (codeEl) codeEl.textContent = lang === 'es' ? 'ES' : 'EN';

    // Update html lang
    document.documentElement.lang = lang === 'es' ? 'es' : 'en';

    // Expose to tour
    window._castflowLandingLang = lang === 'es' ? 'es-ES' : 'en-US';
  }

  // ---- Toggle handler ----
  var toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      applyLang(currentLang === 'en' ? 'es' : 'en');
    });
  }

  // ---- Init ----
  applyLang(currentLang);

  // Expose for external use
  window._castflowI18n = { applyLang: applyLang, getLang: function () { return currentLang; } };

})();
