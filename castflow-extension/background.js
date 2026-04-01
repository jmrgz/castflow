/**
 * CastFlow Extension — Background Service Worker
 * Handles tour injection via chrome.scripting (CSP-safe), badge updates, and sample tours.
 */

const SAMPLE_TOURS = [
  {
    id: 'google-search-demo',
    name: 'Google Search Tour',
    urlPattern: '*://www.google.com/*',
    lang: 'en-US',
    speed: 1,
    defaultVoices: {},
    scenes: [
      {
        title: 'The Search Box',
        text: 'This is the main search input. Type any query here to search the web.',
        speech: 'This is the main search input. Type any query here to search the web.',
        element: 'textarea[name="q"], input[name="q"]',
        position: 'bottom'
      },
      {
        title: 'Search Button',
        text: 'Click this button or press Enter to perform your search.',
        element: 'input[name="btnK"], button[type="submit"]',
        position: 'bottom'
      },
      {
        title: 'Feeling Lucky',
        text: 'This button takes you directly to the first search result, bypassing the results page.',
        element: 'input[name="btnI"]',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'github-repo-demo',
    name: 'GitHub Repository Tour',
    urlPattern: '*://github.com/*/*',
    lang: 'en-US',
    speed: 1,
    defaultVoices: {},
    scenes: [
      {
        title: 'Repository Name',
        text: 'This shows the owner and repository name. Click the owner to see their profile.',
        speech: 'This shows the owner and repository name. Click the owner name to visit their profile page.',
        element: '#repository-container-header strong a, [itemprop="name"] a',
        position: 'bottom'
      },
      {
        title: 'Code Tab',
        text: 'The Code tab shows the repository files, README, and the main branch.',
        speech: 'The Code tab is the default view. It shows the file tree, the README, and which branch you\'re on.',
        element: '#code-tab, a[data-tab-item="code-tab"]',
        position: 'bottom'
      },
      {
        title: 'Issues',
        text: 'Issues track bugs, feature requests, and discussions about the project.',
        speech: 'Issues are how the community reports bugs, requests features, and discusses the project. The counter shows how many are open.',
        element: '#issues-tab, a[data-tab-item="issues-tab"]',
        position: 'bottom'
      },
      {
        title: 'Pull Requests',
        text: 'Pull requests propose changes to the codebase. Collaborators review and merge them.',
        speech: 'Pull requests propose code changes. Maintainers review the diff, leave comments, and merge when ready.',
        element: '#pull-requests-tab, a[data-tab-item="pull-requests-tab"]',
        position: 'bottom'
      },
      {
        title: 'Actions',
        text: 'GitHub Actions automates CI/CD workflows — run tests, build, and deploy on every push.',
        speech: 'GitHub Actions automates your CI CD workflows. You can run tests, build your project, and deploy — all triggered by pushes or pull requests.',
        element: '#actions-tab, a[data-tab-item="actions-tab"]',
        position: 'bottom'
      },
      {
        title: 'File Browser',
        text: 'Browse the repository files here. Click any folder to navigate, or any file to view its contents.',
        speech: 'Browse the repository files here. Click any folder to navigate into it, or click a file to view its contents with syntax highlighting.',
        element: '.react-directory-truncate, .js-navigation-container, [aria-labelledby="files"]',
        position: 'left'
      },
      {
        title: 'Branch Selector',
        text: 'Switch between branches and tags. The default branch is usually "main" or "master".',
        speech: 'Use the branch selector to switch between branches and tags. The default branch is usually main or master.',
        element: '#branch-select-menu, [data-hotkey="w"], .branch-select-menu',
        position: 'bottom'
      },
      {
        title: 'Star the Repo',
        text: 'Click the star button to bookmark this repository. It helps the project gain visibility!',
        speech: 'Star the repository to bookmark it and show your support. Stars help projects gain visibility in the community.',
        element: '.starring-container button, [data-view-component="true"].btn-sm.BtnGroup-item',
        position: 'left'
      },
      {
        title: 'Fork',
        text: 'Forking creates your own copy of the repository where you can make changes freely.',
        speech: 'Forking creates your own copy of the repository under your account. You can make changes freely and submit them back as pull requests.',
        element: '.forks a, #fork-button, [href*="/fork"]',
        position: 'bottom'
      },
      {
        title: 'README',
        text: 'The README is the project\'s front page — it explains what the project does, how to install it, and how to contribute.',
        speech: 'The README is the project\'s front page. It explains what it does, how to install and use it, and how to contribute. A good README is essential for any open source project.',
        element: '#readme, .markdown-body',
        position: 'top'
      }
    ]
  },
  {
    id: 'wikipedia-navigation-demo',
    name: 'Wikipedia — How to Navigate',
    urlPattern: '*://*.wikipedia.org/*',
    lang: 'en-US',
    speed: 1,
    defaultVoices: {},
    scenes: [
      {
        title: 'Welcome to Wikipedia',
        text: 'Wikipedia is the world\'s largest free encyclopedia. Let me show you how to navigate it effectively.',
        speech: 'Wikipedia is the world\'s largest free encyclopedia. Let me show you how to navigate it effectively.',
        element: '#mp-topbanner, .mw-logo, #p-logo',
        position: 'bottom'
      },
      {
        title: 'Search for anything',
        text: 'Use the search box to find any article. Type a topic and press Enter or select a suggestion.',
        speech: 'Use the search box to find any article. Type a topic and press Enter, or select a suggestion from the dropdown.',
        element: '#searchInput, #searchform, .cdx-text-input__input',
        position: 'bottom'
      },
      {
        title: 'Table of Contents',
        text: 'Long articles have a table of contents. Click any section to jump directly to it.',
        speech: 'Long articles have a table of contents. Click any section heading to jump directly to that part of the article.',
        element: '#toc, .vector-toc, #mw-panel-toc',
        position: 'right'
      },
      {
        title: 'References & Citations',
        text: 'Blue numbered links in the text are references. Click them to see the source at the bottom of the page.',
        speech: 'Blue numbered links in the text are references. Click them to see the source citation at the bottom of the page. This is how Wikipedia maintains accuracy.',
        element: '#catlinks, .mw-body-content',
        position: 'top'
      },
      {
        title: 'Language Switcher',
        text: 'Articles are available in many languages. Use the language links to read the same article in another language.',
        speech: 'Articles are available in dozens of languages. Use the language links on the sidebar to read the same article in another language.',
        element: '#p-lang-btn, .interlanguage-links-anchor, #p-lang',
        position: 'left'
      }
    ]
  },
  {
    id: 'stackoverflow-demo',
    name: 'Stack Overflow — Find Answers',
    urlPattern: '*://stackoverflow.com/*',
    lang: 'en-US',
    speed: 1,
    defaultVoices: {},
    scenes: [
      {
        title: 'Welcome to Stack Overflow',
        text: 'Stack Overflow is the largest Q&A community for developers. Let me show you how to find answers efficiently.',
        speech: 'Stack Overflow is the largest question and answer community for developers. Let me show you how to find answers efficiently.',
        element: '.s-topbar--logo, .-logo',
        position: 'bottom'
      },
      {
        title: 'Search for Questions',
        text: 'Use the search bar to find questions about any programming topic. You can use tags like [javascript] or [python] to narrow results.',
        speech: 'Use the search bar to find questions on any programming topic. You can use square bracket tags like javascript or python to narrow down the results.',
        element: '.s-topbar--searchbar, #search',
        position: 'bottom'
      },
      {
        title: 'Question List',
        text: 'Here you see the list of questions. Each shows the title, vote count, answer count, and tags.',
        speech: 'Here you see the list of questions. Each one shows the title, how many votes and answers it has, and the relevant tags.',
        element: '#questions, #question-mini-list, .s-post-summary',
        position: 'right'
      },
      {
        title: 'Votes & Answers',
        text: 'The vote score shows community quality rating. A green checkmark means the question has an accepted answer.',
        speech: 'The vote score shows the community quality rating. A green checkmark means the question author accepted one answer as the solution.',
        element: '.s-post-summary--stats, .js-post-summary-stats',
        position: 'right'
      },
      {
        title: 'Tags',
        text: 'Tags categorize questions by technology. Click any tag to see all questions with that tag.',
        speech: 'Tags categorize questions by technology. Click any tag to browse all questions in that category. Popular tags include JavaScript, Python, React, and SQL.',
        element: '.js-tags, .s-post-summary--meta-tags, #left-sidebar',
        position: 'right'
      }
    ]
  },
  {
    id: 'mdn-docs-demo',
    name: 'MDN Web Docs — Learn Web Development',
    urlPattern: '*://developer.mozilla.org/*',
    lang: 'en-US',
    speed: 1,
    defaultVoices: {},
    scenes: [
      {
        title: 'Welcome to MDN',
        text: 'MDN Web Docs is the definitive reference for web technologies — HTML, CSS, JavaScript, and Web APIs.',
        speech: 'MDN Web Docs is the definitive reference for web technologies. HTML, CSS, JavaScript, and Web APIs — all documented here.',
        element: '.top-navigation-main, .main-menu',
        position: 'bottom'
      },
      {
        title: 'Search the Docs',
        text: 'Use the search box to find documentation for any web API, CSS property, or JavaScript method.',
        speech: 'Use the search box to find documentation for any web API, CSS property, or JavaScript method. Just start typing and you\'ll see instant results.',
        element: '#top-nav-search-input, .search-widget, .header-search',
        position: 'bottom'
      },
      {
        title: 'Article Content',
        text: 'Each documentation page includes syntax, parameters, return values, examples, and browser compatibility.',
        speech: 'Each documentation page is thoughtfully organized with syntax, parameters, return values, live examples, and detailed browser compatibility tables.',
        element: '#content, .main-page-content, article',
        position: 'top'
      },
      {
        title: 'Browser Compatibility',
        text: 'Scroll down to find the browser compatibility table — it shows exactly which browsers support each feature.',
        speech: 'Scroll down to find the browser compatibility table. It shows exactly which browsers and versions support each feature — including Chrome, Firefox, Safari, and Edge.',
        element: '.bc-table, table.bc-table-web',
        position: 'top'
      },
      {
        title: 'Sidebar Navigation',
        text: 'The sidebar lets you browse related APIs and properties. It\'s the fastest way to explore a topic area.',
        speech: 'The sidebar lets you browse related APIs and properties. It\'s the fastest way to explore an entire topic area without going back to search.',
        element: '.sidebar, #sidebar-quicklinks, .document-toc',
        position: 'right'
      }
    ]
  },
  {
    id: 'azure-appservice-tour',
    name: 'Azure App Service — Web App Tour',
    urlPattern: '*://portal.azure.com/*/appServices*',
    lang: 'en-US',
    speed: 1.25,
    defaultVoices: { 'en-US': 'Google UK English Male' },
    translations: {
      'es-ES': {
        name: 'Azure App Service — Tour de Web App',
        lang: 'es-ES',
        speed: 1.25,
        defaultVoices: { 'es-ES': 'Microsoft Alvaro Online (Natural) - Spanish (Spain)' },
        scenes: [
          { title: 'Bienvenido a Azure App Service', text: 'Esta es la página de Información general de tu Web App en Azure. Aquí puedes ver de un vistazo la información esencial de tu aplicación: su estado, detalles del hospedaje y enlaces rápidos a las secciones principales. Vamos a recorrerlo todo.' },
          { title: 'Buscar en la barra lateral', text: 'Usa este cuadro de búsqueda para encontrar rápidamente cualquier opción del menú lateral. Solo escribe una palabra clave como "Configuration", "Logs" o "Scale" y se filtrarán las opciones al instante.' },
          { title: 'Acceso rápido — Información general', text: 'El elemento Overview es tu panel principal. Muestra el panel de Essentials con el grupo de recursos, estado, ubicación, suscripción, dominio predeterminado y más. Es siempre tu punto de partida.' },
          { title: 'Registro de actividad', text: 'El Activity Log registra todas las operaciones de administración realizadas en este recurso: despliegues, reinicios, cambios de configuración y más. Muy útil para auditoría y resolución de problemas.' },
          { title: 'Control de acceso (IAM)', text: 'Gestiona quién tiene acceso a esta Web App. Puedes asignar roles de Azure como Propietario, Colaborador o Lector a usuarios, grupos y entidades de servicio. Aquí es donde aplicas el principio de mínimo privilegio.' },
          { title: 'Etiquetas', text: 'Las etiquetas permiten organizar tus recursos de Azure con pares clave-valor como "environment:production" o "project:webapp". Son esenciales para la gestión de costes, gobernanza y filtrado de recursos.' },
          { title: 'Diagnosticar y resolver problemas', text: 'La herramienta de diagnóstico integrada de Azure. Puede detectar automáticamente problemas en tu app: alto uso de CPU, fugas de memoria, respuestas lentas, errores HTTP y más. Es el primer sitio al que acudir cuando algo falla.' },
          { title: 'Microsoft Defender for Cloud', text: 'Revisa la postura de seguridad de tu Web App. Defender for Cloud ofrece recomendaciones de seguridad, detección de amenazas y evaluaciones de vulnerabilidades específicas para App Service.' },
          { title: 'Flujo de registros', text: 'Visualiza los logs de la aplicación en tiempo real directamente en el navegador. Extremadamente útil durante el desarrollo y depuración: puedes ver stdout, stderr y los logs de aplicación conforme ocurren.' },
          { title: 'Grupo de implementación', text: 'Esta sección contiene todo lo relacionado con el despliegue de tu código. Veamos los dos elementos clave: los Slots de implementación y el Centro de implementación.' },
          { title: 'Slots de implementación', text: 'Los slots de implementación permiten ejecutar diferentes versiones de tu app en entornos separados (por ejemplo, staging y producción). Puedes intercambiar slots sin tiempo de inactividad, haciendo los lanzamientos seguros y reversibles.' },
          { title: 'Centro de implementación', text: 'Configura tu pipeline de CI/CD aquí. Conéctalo a GitHub, Azure DevOps, Bitbucket o Git local. Gestiona y monitoriza todos los despliegues a tu Web App de forma automática.' },
          { title: 'Grupo de configuración', text: 'El grupo de Settings es una de las secciones más importantes. Contiene variables de entorno, autenticación, redes, copias de seguridad, dominios personalizados, certificados y más.' },
          { title: 'Variables de entorno', text: 'Gestiona las variables de entorno y cadenas de conexión de tu app. Aquí configuras claves de API, conexiones a bases de datos y feature flags sin modificar tu código.' },
          { title: 'Configuración (Preview)', text: 'La nueva experiencia de configuración. Ofrece una vista unificada de ajustes generales como la pila del runtime, configuración de la plataforma, documentos predeterminados, mapeos de rutas y handlers.' },
          { title: 'Autenticación', text: 'Habilita autenticación integrada en tu app sin escribir código. Soporta Azure AD, cuentas Microsoft, Google, Facebook, Twitter y proveedores OpenID Connect personalizados.' },
          { title: 'Identidad', text: 'La Identidad Administrada permite que tu app se autentique en otros servicios de Azure como Key Vault, Storage o SQL Database sin almacenar credenciales en tu código. Muy recomendado por seguridad.' },
          { title: 'Copias de seguridad', text: 'Configura copias de seguridad automáticas de tu app y sus bases de datos. Puedes programar backups periódicos y restaurar a cualquier punto anterior. Esencial para la planificación de recuperación ante desastres.' },
          { title: 'Dominios personalizados', text: 'Asocia tus propios nombres de dominio a esta Web App. Puedes añadir dominios personalizados, configurar registros DNS y gestionar la verificación de dominio desde este blade.' },
          { title: 'Certificados', text: 'Gestiona certificados SSL/TLS para tus dominios personalizados. Puedes subir tus propios certificados, crear certificados gratuitos administrados por App Service o importarlos desde Key Vault.' },
          { title: 'Redes', text: 'Configura funciones de red como VNet Integration, Private Endpoints, restricciones de acceso y Hybrid Connections. Aquí controlas el tráfico de red entrante y saliente.' },
          { title: 'Conector de servicios', text: 'Conecta fácilmente tu app a otros servicios de Azure como bases de datos, almacenamiento o mensajería. Service Connector se encarga de la configuración de conexión y autenticación por ti.' },
          { title: 'Plan de App Service', text: 'El Plan de App Service define los recursos de cómputo para tu app: el tamaño de VM, la región y el nivel de precios. Esta sección te permite ver y cambiar tu plan de hospedaje.' },
          { title: 'Escalar verticalmente', text: 'Scale Up cambia el tamaño de la VM y el nivel de precios. Mueve entre los niveles Free, Shared, Basic, Standard, Premium e Isolated para obtener más CPU, RAM, almacenamiento y funcionalidades.' },
          { title: 'Escalar horizontalmente', text: 'Scale Out añade más instancias de tu app. Puedes configurar el escalado manual o definir reglas de autoescalado basadas en métricas como porcentaje de CPU o longitud de la cola HTTP.' },
          { title: 'Grupo de monitorización', text: 'La sección de Monitoring contiene todas las herramientas para observar la salud, rendimiento y comportamiento de tu app: alertas, métricas, logs, health checks y configuración de diagnósticos.' },
          { title: 'Alertas', text: 'Crea reglas de alerta que te notifiquen cuando las métricas superen umbrales, por ejemplo, cuando la CPU supere el 80%, el tiempo de respuesta pase de 5 segundos o se disparen los errores HTTP 500.' },
          { title: 'Métricas', text: 'Explora las métricas de la plataforma en gráficos interactivos. Monitoriza solicitudes, tiempos de respuesta, porcentaje de CPU y memoria, datos de entrada y salida, tasas de errores HTTP y mucho más en tiempo real.' },
          { title: 'Health Check', text: 'Configura un endpoint de health check que Azure consulta periódicamente. Si una instancia falla la comprobación, se elimina automáticamente del balanceador de carga hasta que se recupere.' },
          { title: 'Logs de App Service', text: 'Habilita y configura el registro de la aplicación, registro del servidor web y mensajes de error detallados. Los logs se pueden almacenar en el sistema de archivos o enviar a Azure Blob Storage.' },
          { title: 'Herramientas de desarrollo', text: 'Herramientas para desarrolladores: acceso por consola SSH, herramientas avanzadas de Kudu y servicios recomendados para mejorar tu app.' },
          { title: 'Consola SSH', text: 'Abre una sesión SSH directa al contenedor de tu app. Muy útil para depuración, inspeccionar archivos, verificar procesos y ejecutar comandos directamente en el servidor.' },
          { title: 'Herramientas avanzadas (Kudu)', text: 'Kudu es el potente motor detrás de App Service. Ofrece un explorador de archivos web, explorador de procesos, visor de variables de entorno, volcados de diagnóstico y una consola de depuración.' },
          { title: 'Sección de API', text: 'Si tu app expone APIs, esta sección te permite gestionar la integración con API Management, definiciones de API (Swagger/OpenAPI) y configuración de CORS (Cross-Origin Resource Sharing).' },
          { title: 'Configuración de CORS', text: 'Configura qué dominios externos pueden realizar solicitudes cross-origin a tu API. Esto es esencial cuando tu frontend está alojado en un dominio diferente al de tu backend.' },
          { title: 'Panel de Essentials', text: 'En esta área de contenido verás el panel de Essentials con la información principal de un vistazo: Grupo de recursos, Estado (Running/Stopped), Ubicación, Suscripción, Dominio predeterminado, Plan de App Service, Sistema operativo y estado del Health Check.' },
          { title: 'Pestañas Properties y Monitoring', text: 'Debajo de Essentials encontrarás varias pestañas. Properties muestra el nombre de tu app, modelo de publicación, pila del runtime y versión, dominios y hospedaje. Monitoring muestra gráficos de rendimiento en vivo: solicitudes HTTP, errores, transferencia de datos y tiempos de respuesta. También puedes cambiar a Logs, Capabilities, Notifications y Recommendations.' },
          { title: 'Tarjetas de resumen', text: 'Bajando por la pestaña Properties verás tarjetas resumen: Web App (nombre, runtime, estado de salud), Domains (dominio predeterminado y personalizados), Hosting (plan, SO, SKU), Deployment Center (proveedor, último despliegue, logs) y Networking (IP virtual, IPs de salida, integración VNet). Cada tarjeta tiene enlaces para ir a su configuración completa.' },
          { title: '¡Tour completado!', text: '¡Ya conoces a fondo una Web App de Azure App Service! Has visto los essentials del Overview, la navegación del menú lateral con Deployment, Settings, Escalado, Monitoring y Herramientas de desarrollo. Explora cada sección para dominar la gestión de tus aplicaciones en la nube.' }
        ]
      }
    },
    scenes: [
      // ========= OVERVIEW / ESSENTIALS =========
      {
        title: 'Welcome to Azure App Service',
        text: 'This is the Overview page of your Azure Web App. Here you can see at a glance the essential information about your application, its status, hosting details, and quick links to key sections. Let me walk you through everything.',
        element: '.fxs-part-content',
        position: 'right'
      },
      {
        title: 'Search the sidebar',
        text: 'Use this search box to quickly find any menu item in the left sidebar. Just start typing a keyword like "Configuration", "Logs", or "Scale" and it will filter the options instantly.',
        element: '.fxc-menu-search',
        position: 'right'
      },
      {
        title: 'Quick Access — Overview',
        text: 'The Overview item is your main dashboard. It shows the Essentials panel with resource group, status, location, subscription, default domain, and more. This is always your starting point.',
        element: '[data-telemetryname="Menu-appServices"]',
        position: 'right'
      },
      {
        title: 'Activity Log',
        text: 'The Activity Log tracks all management operations performed on this resource — deployments, restarts, configuration changes, and more. Very useful for auditing and troubleshooting.',
        element: '[data-telemetryname="Menu-eventlogs"]',
        position: 'right'
      },
      {
        title: 'Access Control (IAM)',
        text: 'Manage who has access to this Web App. You can assign Azure roles like Owner, Contributor, or Reader to users, groups, and service principals. This is where you enforce the principle of least privilege.',
        element: '[data-telemetryname="Menu-users"]',
        position: 'right'
      },
      {
        title: 'Tags',
        text: 'Tags let you organize your Azure resources with key-value pairs like "environment:production" or "project:webapp". They are essential for cost management, governance, and filtering resources.',
        element: '[data-telemetryname="Menu-tags"]',
        position: 'right'
      },
      {
        title: 'Diagnose and Solve Problems',
        text: 'Azure\'s built-in diagnostic tool. It can automatically detect issues with your app — high CPU, memory leaks, slow responses, HTTP errors, and more. A great first stop when something goes wrong.',
        element: '[data-telemetryname="Menu-troubleshoot"]',
        position: 'right'
      },
      {
        title: 'Microsoft Defender for Cloud',
        text: 'Review the security posture of your Web App. Defender for Cloud provides security recommendations, threat detection, and vulnerability assessments specific to App Service resources.',
        element: '[data-telemetryname="Menu-securitycenter"]',
        position: 'right'
      },
      {
        title: 'Log Stream',
        text: 'View real-time application logs directly in the browser. This is extremely useful during development and debugging — you can see stdout, stderr, and application-level logs as they happen.',
        element: '[data-telemetryname="Menu-logStream-quickstart"]',
        position: 'right'
      },
      // ========= DEPLOYMENT GROUP =========
      {
        title: 'Deployment Group',
        text: 'This section contains everything related to deploying your code. Let\'s look at the two key items: Deployment Slots and the Deployment Center.',
        element: '.azc-group-appdeployment',
        position: 'right',
        action: { type: 'click', selector: '.azc-group-appdeployment > button[aria-expanded=false]' }
      },
      {
        title: 'Deployment Slots',
        text: 'Deployment slots let you run different versions of your app in separate environments (e.g., staging, production). You can swap slots with zero downtime, making releases safe and reversible.',
        element: '[data-telemetryname="Menu-deploymentSlotsV2"]',
        position: 'right'
      },
      {
        title: 'Deployment Center',
        text: 'Configure your CI/CD pipeline here. Connect to GitHub, Azure DevOps, Bitbucket, or set up local Git. It manages and monitors all deployments to your Web App automatically.',
        element: '[data-telemetryname="Menu-vstscd"]',
        position: 'right'
      },
      // ========= SETTINGS GROUP =========
      {
        title: 'Settings Group',
        text: 'The Settings group is one of the most important sections. It contains environment variables, authentication, networking, backups, custom domains, certificates, and more.',
        element: '.azc-group-managementgroup',
        position: 'right',
        action: { type: 'click', selector: '.azc-group-managementgroup > button[aria-expanded=false]' }
      },
      {
        title: 'Environment Variables',
        text: 'Manage your app\'s environment variables and connection strings. This is where you configure API keys, database connections, and feature flags without modifying your code.',
        element: '[data-telemetryname="Menu-environmentVariables"]',
        position: 'right'
      },
      {
        title: 'Configuration (Preview)',
        text: 'The new configuration experience. It provides a unified view of general settings like the runtime stack, platform settings, default documents, path mappings, and handler mappings.',
        element: '[data-telemetryname="Menu-configuration"]',
        position: 'right'
      },
      {
        title: 'Authentication',
        text: 'Enable built-in authentication for your app without writing any code. Supports Azure AD, Microsoft accounts, Google, Facebook, Twitter, and custom OpenID Connect providers.',
        element: '[data-telemetryname="Menu-eauth"]',
        position: 'right'
      },
      {
        title: 'Identity',
        text: 'Managed Identity allows your app to authenticate to other Azure services like Key Vault, Storage, or SQL Database without storing credentials in your code. Highly recommended for security.',
        element: '[data-telemetryname="Menu-msi"]',
        position: 'right'
      },
      {
        title: 'Backups',
        text: 'Configure automatic backups of your app and its databases. You can schedule periodic backups and restore to any previous point. Essential for disaster recovery planning.',
        element: '[data-telemetryname="Menu-backups"]',
        position: 'right'
      },
      {
        title: 'Custom Domains',
        text: 'Map your own domain names to this Web App. You can add custom domains, configure DNS records, and manage domain verification all from this blade.',
        element: '[data-telemetryname="Menu-domainsandsslv2"]',
        position: 'right'
      },
      {
        title: 'Certificates',
        text: 'Manage SSL/TLS certificates for your custom domains. You can upload your own certificates, create free App Service Managed Certificates, or import from Key Vault.',
        element: '[data-telemetryname="Menu-certificatesReact"]',
        position: 'right'
      },
      {
        title: 'Networking',
        text: 'Configure networking features like VNet Integration, Private Endpoints, Access Restrictions, and Hybrid Connections. This is where you control inbound and outbound network traffic.',
        element: '[data-telemetryname="Menu-networkingHub"]',
        position: 'right'
      },
      {
        title: 'Service Connector',
        text: 'Easily connect your app to other Azure services like databases, storage, or messaging. Service Connector handles the connection configuration and authentication for you.',
        element: '[data-telemetryname="Menu-serviceConnector"]',
        position: 'right'
      },
      // ========= APP SERVICE PLAN =========
      {
        title: 'App Service Plan',
        text: 'The App Service Plan defines the compute resources for your app — the VM size, region, and pricing tier. This section lets you view and change your hosting plan.',
        element: '.azc-group-appserviceplan',
        position: 'right',
        action: { type: 'click', selector: '.azc-group-appserviceplan > button[aria-expanded=false]' }
      },
      {
        title: 'Scale Up (Vertical)',
        text: 'Scale Up changes the VM size and pricing tier. Move between Free, Shared, Basic, Standard, Premium, and Isolated tiers to get more CPU, RAM, storage, and features.',
        element: '[data-telemetryname="Menu-scaleup"]',
        position: 'right'
      },
      {
        title: 'Scale Out (Horizontal)',
        text: 'Scale Out adds more instances of your app. You can configure manual scaling or set autoscale rules based on metrics like CPU percentage or HTTP queue length.',
        element: '[data-telemetryname="Menu-scale"]',
        position: 'right'
      },
      // ========= MONITORING GROUP =========
      {
        title: 'Monitoring Group',
        text: 'The Monitoring section contains all the tools to observe your app\'s health, performance, and behavior: alerts, metrics, logs, health checks, and diagnostic settings.',
        element: '.azc-group-monitoringgroup',
        position: 'right',
        action: { type: 'click', selector: '.azc-group-monitoringgroup > button[aria-expanded=false]' }
      },
      {
        title: 'Alerts',
        text: 'Create alert rules that notify you when metrics cross thresholds — for example, when CPU exceeds 80%, response time goes above 5 seconds, or HTTP 500 errors spike.',
        element: '[data-telemetryname="Menu-alerts"]',
        position: 'right'
      },
      {
        title: 'Metrics',
        text: 'Explore platform metrics in interactive charts. Monitor requests, response times, CPU/memory percentage, data in/out, HTTP error rates, and many more in real time.',
        element: '[data-telemetryname="Menu-metrics"]',
        position: 'right'
      },
      {
        title: 'Health Check',
        text: 'Configure a health check endpoint that Azure pings periodically. If an instance fails the health check, it gets automatically removed from the load balancer until it recovers.',
        element: '[data-telemetryname="Menu-healthcheck"]',
        position: 'right'
      },
      {
        title: 'App Service Logs',
        text: 'Enable and configure application logging, web server logging, and detailed error messages. Logs can be stored in the file system or streamed to Azure Blob Storage.',
        element: '[data-telemetryname="Menu-appservicelogs"]',
        position: 'right'
      },
      // ========= DEVELOPMENT TOOLS =========
      {
        title: 'Development Tools',
        text: 'Tools for developers: SSH console access, Kudu advanced tools, and recommended services to enhance your app.',
        element: '.azc-group-developmenttoolsgroupid',
        position: 'right',
        action: { type: 'click', selector: '.azc-group-developmenttoolsgroupid > button[aria-expanded=false]' }
      },
      {
        title: 'SSH Console',
        text: 'Open a direct SSH session to your app\'s container. Very useful for debugging, inspecting files, checking processes, and running commands directly on the server.',
        element: '[data-telemetryname="Menu-ssh"]',
        position: 'right'
      },
      {
        title: 'Advanced Tools (Kudu)',
        text: 'Kudu is the powerful behind-the-scenes engine of App Service. It provides a web-based file browser, process explorer, environment variable viewer, diagnostic dumps, and a debug console.',
        element: '[data-telemetryname="Menu-kudu"]',
        position: 'right'
      },
      // ========= API =========
      {
        title: 'API Section',
        text: 'If your app exposes APIs, this section lets you manage API Management integration, API definitions (Swagger/OpenAPI), and CORS (Cross-Origin Resource Sharing) settings.',
        element: '.azc-group-api',
        position: 'right',
        action: { type: 'click', selector: '.azc-group-api > button[aria-expanded=false]' }
      },
      {
        title: 'CORS Settings',
        text: 'Configure which external domains are allowed to make cross-origin requests to your API. This is essential when your frontend is hosted on a different domain than your backend.',
        element: '[data-telemetryname="Menu-apiCors"]',
        position: 'right'
      },
      // ========= OVERVIEW CONTENT AREA (inside iframe — selectors target the iframe itself) =========
      {
        title: 'Essentials Panel',
        text: 'Inside this content area you can see the Essentials panel with the most important info at a glance: Resource Group, Status (Running or Stopped), Location, Subscription, Default Domain, App Service Plan, Operating System, and Health Check status.',
        element: 'iframe.fxs-reactview-frame-active',
        position: 'left'
      },
      {
        title: 'Properties & Monitoring Tabs',
        text: 'Below the Essentials you\'ll find several tabs. Properties shows your app\'s name, publishing model, runtime stack and version, domains, and hosting. Monitoring shows live performance charts — HTTP requests, errors, data transfer and response times. You can also switch to Logs, Capabilities, Notifications and Recommendations.',
        element: 'iframe.fxs-reactview-frame-active',
        position: 'left'
      },
      {
        title: 'Property Summary Cards',
        text: 'Scrolling down the Properties tab you\'ll see summary cards: Web App (name, runtime, health status), Domains (default and custom), Hosting (plan, OS, SKU), Deployment Center (provider, last deployment, logs), and Networking (virtual IP, outbound IPs, VNet integration). Each card has links to jump into its full configuration.',
        element: 'iframe.fxs-reactview-frame-active',
        position: 'left'
      },
      // ========= FINISH =========
      {
        title: 'Tour Complete!',
        text: 'You now know your way around an Azure App Service Web App! You\'ve seen the Overview essentials, the sidebar navigation with Deployment, Settings, Scaling, Monitoring, and Development Tools. Explore each section to master your cloud application management.',
        element: '.fxc-menu-header',
        position: 'right'
      }
    ]
  }
];

// On install, seed sample tours
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ tours: SAMPLE_TOURS });
  }
});

// ============================================
// MESSAGE HANDLERS
// ============================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Badge update from content script (tour ended naturally)
  if (message.type === 'tourState') {
    const tabId = sender.tab?.id || message.tabId;
    if (!tabId) return;
    updateBadge(tabId, message.playing);
  }

  // Play tour — inject CastFlow + start (from popup)
  if (message.type === 'playTour') {
    const tabId = message.tabId;
    if (!tabId) { sendResponse({ ok: false, error: 'No tabId' }); return; }
    handlePlayTour(tabId, message.tour)
      .then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true; // async
  }

  // Stop tour (from popup)
  if (message.type === 'stopTour') {
    const tabId = message.tabId;
    if (!tabId) { sendResponse({ ok: false }); return; }
    handleStopTour(tabId)
      .then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  // Get state (from popup)
  if (message.type === 'getState') {
    const tabId = message.tabId;
    if (!tabId) { sendResponse({ playing: false }); return; }
    handleGetState(tabId)
      .then(result => sendResponse(result))
      .catch(() => sendResponse({ playing: false }));
    return true;
  }

  // Extract simplified DOM from active tab
  if (message.type === 'extractDOM') {
    const tabId = message.tabId;
    if (!tabId) { sendResponse({ error: 'No tabId' }); return; }
    extractDOMInTab(tabId)
      .then(dom => sendResponse(dom))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  // Generate tour with AI
  if (message.type === 'generateTour') {
    handleGenerateTour(message)
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  // Start selector picker on page
  if (message.type === 'startPicker') {
    const tabId = message.tabId;
    if (!tabId) { sendResponse({ ok: false }); return; }
    startPickerInTab(tabId)
      .then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  // Stop selector picker
  if (message.type === 'stopPicker') {
    const tabId = message.tabId;
    if (!tabId) { sendResponse({ ok: false }); return; }
    stopPickerInTab(tabId)
      .then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  // Relay picked selector — store for popup to read when it re-opens
  if (message.type === 'selectorPicked') {
    chrome.storage.local.set({ lastPickedSelector: message.selector, pickerActive: false });
  }
});

// ============================================
// INJECTION via chrome.scripting (bypasses page CSP)
// ============================================
async function handlePlayTour(tabId, tourConfig) {
  // 1) Inject CSS
  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ['lib/castflow.css']
  });

  // 2) Inject CastFlow library into the page's main world
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['lib/castflow.js'],
    world: 'MAIN'
  });

  // 3) Start the tour (func is CSP-safe — executed by the extension API, not as inline script)
  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: (config) => {
      if (window.__castflowTour) {
        try { window.__castflowTour.stop(); } catch (e) { /* ignore */ }
      }
      config.onComplete = function () {
        window.__castflowTour = null;
        window.dispatchEvent(new CustomEvent('__castflow_ended'));
      };
      window.__castflowTour = new CastFlow(config);
      window.__castflowTour.start();
    },
    args: [tourConfig]
  });

  updateBadge(tabId, true);
}

async function handleStopTour(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => {
      if (window.__castflowTour) {
        try { window.__castflowTour.stop(); } catch (e) { /* ignore */ }
        window.__castflowTour = null;
      }
    }
  });
  updateBadge(tabId, false);
}

async function handleGetState(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => !!window.__castflowTour
  });
  return { playing: results?.[0]?.result || false };
}

function updateBadge(tabId, playing) {
  if (playing) {
    chrome.action.setBadgeText({ text: '▶', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId });
  } else {
    chrome.action.setBadgeText({ text: '', tabId });
  }
}

// ============================================
// DOM EXTRACTION (injected into page MAIN world)
// ============================================
async function extractDOMInTab(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => {
      const INTERACTIVE = new Set(['A','BUTTON','INPUT','SELECT','TEXTAREA','DETAILS','SUMMARY']);
      const HEADINGS = new Set(['H1','H2','H3','H4','H5','H6']);
      const LANDMARKS = new Set(['NAV','HEADER','FOOTER','MAIN','ASIDE','SECTION']);
      const JUNK_CLASS = /^(js-|is-|has-|ng-|_|svelte-|__cf|css-|f[0-9a-z]{4,}$|[A-Z][A-Za-z0-9]{4,}$)/;

      function isValidSelector(s) {
        try { document.querySelector(s); return true; } catch { return false; }
      }

      function isUnique(s) {
        try { return document.querySelectorAll(s).length === 1; } catch { return false; }
      }

      function getBestSelector(el) {
        // 1. ID (skip auto-generated numeric-only IDs)
        if (el.id && !/^\d+$/.test(el.id)) {
          const s = '#' + CSS.escape(el.id);
          if (isUnique(s)) return s;
        }
        // 2. Test IDs and semantic data attributes
        for (const attr of ['data-testid','data-test-id','data-cy','data-telemetryname','data-automationid']) {
          const v = el.getAttribute(attr);
          if (v) {
            const s = '[' + attr + '="' + CSS.escape(v) + '"]';
            if (isUnique(s)) return s;
          }
        }
        // 3. aria-label
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.length <= 60) {
          const s = el.tagName.toLowerCase() + '[aria-label="' + CSS.escape(ariaLabel) + '"]';
          if (isUnique(s)) return s;
        }
        // 4. name attribute
        const name = el.getAttribute('name');
        if (name) {
          const s = el.tagName.toLowerCase() + '[name="' + CSS.escape(name) + '"]';
          if (isUnique(s)) return s;
        }
        // 5. title attribute
        const title = el.getAttribute('title');
        if (title && title.length <= 40) {
          const s = el.tagName.toLowerCase() + '[title="' + CSS.escape(title) + '"]';
          if (isUnique(s)) return s;
        }
        // 6. Clean classes (max 3, skip hashes/generated class names)
        if (el.classList.length) {
          const cls = Array.from(el.classList).filter(c => !JUNK_CLASS.test(c) && c.length < 40);
          for (let count = Math.min(cls.length, 3); count >= 1; count--) {
            const s = el.tagName.toLowerCase() + '.' + cls.slice(0, count).map(c => CSS.escape(c)).join('.');
            if (isValidSelector(s) && isUnique(s)) return s;
          }
        }
        // 7. Positional path (max 4 levels)
        const parts = [];
        let cur = el;
        let depth = 0;
        while (cur && cur !== document.body && cur !== document.documentElement && depth < 4) {
          let s = cur.tagName.toLowerCase();
          if (cur.id && !/^\d+$/.test(cur.id)) { parts.unshift('#' + CSS.escape(cur.id)); break; }
          const parent = cur.parentElement;
          if (parent) {
            const sibs = Array.from(parent.children).filter(c => c.tagName === cur.tagName);
            if (sibs.length > 1) s += ':nth-of-type(' + (sibs.indexOf(cur) + 1) + ')';
          }
          parts.unshift(s);
          cur = cur.parentElement;
          depth++;
        }
        const path = parts.join(' > ');
        if (isValidSelector(path) && isUnique(path)) return path;
        // 8. Cannot build a stable selector — skip this element
        return null;
      }

      function isVisible(el) {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        // Truly hidden (visibility:hidden or opacity:0) — always skip
        if (s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return false;
        // If visible on screen, fine
        if (r.width > 0 && r.height > 0 && s.display !== 'none') return true;
        // If hidden BUT inside a menu/dropdown/collapse, still include it
        // so the AI knows about collapsed navigation items
        return isInsideMenu(el);
      }

      /** Check if el is inside a dropdown, collapse, nav menu, or popup that may be hidden */
      function isInsideMenu(el) {
        let cur = el;
        let depth = 0;
        while (cur && depth < 10) {
          if (cur.classList &&
              (cur.classList.contains('dropdown-menu') ||
               cur.classList.contains('collapse') ||
               cur.classList.contains('submenu') ||
               cur.classList.contains('nav-menu') ||
               cur.classList.contains('mega-menu'))) return true;
          const role = cur.getAttribute && cur.getAttribute('role');
          if (role === 'menu' || role === 'listbox' || role === 'tree') return true;
          if (cur.tagName === 'NAV' || cur.tagName === 'UL' && cur.closest('nav')) return true;
          cur = cur.parentElement;
          depth++;
        }
        return false;
      }

      const nodes = [];
      const seen = new Set();

      for (const el of document.querySelectorAll('*')) {
        if (!isVisible(el)) continue;
        const tag = el.tagName;
        const role = el.getAttribute('role') || '';
        const isInteractive = INTERACTIVE.has(tag)
          || ['button','link','tab','menuitem','checkbox','radio','switch','slider','combobox'].includes(role)
          || el.hasAttribute('onclick')
          || el.getAttribute('tabindex') === '0';
        const isHeading = HEADINGS.has(tag);
        const isLandmark = LANDMARKS.has(tag);

        if (!isInteractive && !isHeading && !isLandmark) continue;

        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight * 3) continue;

        const text = (el.innerText || '').trim().substring(0, 80);
        const selector = getBestSelector(el);

        if (!selector) continue; // skip elements without a stable selector
        if (selector.length > 120) continue; // skip overly long selectors
        if (seen.has(selector)) continue;
        seen.add(selector);

        const node = { tag: tag.toLowerCase(), selector };
        if (text) node.text = text;
        if (role) node.role = role;
        // Flag elements that are currently hidden (inside collapsed menus)
        const vis = getComputedStyle(el);
        if (vis.display === 'none' || (rect.width === 0 && rect.height === 0)) {
          node.hidden = true;
          // Find the toggle/trigger that opens this element's parent menu
          const menu = el.closest('.dropdown-menu, .collapse, [role="menu"], [role="listbox"]');
          if (menu) {
            // Look for the sibling toggle that controls this menu
            const toggler = menu.previousElementSibling
              || (menu.id && document.querySelector('[data-bs-target="#' + menu.id + '"],[aria-controls="' + menu.id + '"]'))
              || (menu.getAttribute('aria-labelledby') && document.getElementById(menu.getAttribute('aria-labelledby')));
            if (toggler) {
              const toggleSel = getBestSelector(toggler);
              if (toggleSel) node.parentToggle = toggleSel;
            }
          }
        }
        node.rect = {
          x: Math.round(rect.x), y: Math.round(rect.y),
          w: Math.round(rect.width), h: Math.round(rect.height)
        };
        node.type = isInteractive ? 'interactive' : isHeading ? 'heading' : 'landmark';
        nodes.push(node);

        if (nodes.length >= 200) break;
      }

      // Extract visible page text (paragraphs, lists, headings, labels, table cells)
      // to give the AI broader context about the page content
      const textEls = document.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, label, th, td, figcaption, blockquote, .card-title, .card-text, [class*="title"], [class*="description"], [class*="subtitle"]');
      const textParts = [];
      const textSeen = new Set();
      for (const el of textEls) {
        const t = (el.innerText || '').trim();
        if (!t || t.length < 4 || t.length > 300) continue;
        if (textSeen.has(t)) continue;
        textSeen.add(t);
        textParts.push(t);
        if (textParts.length >= 60) break;
      }

      return {
        url: location.href,
        title: document.title,
        viewport: { w: window.innerWidth, h: window.innerHeight },
        nodes,
        pageText: textParts.join('\n')
      };
    }
  });
  return results?.[0]?.result || { error: 'DOM extraction returned no result' };
}

// ============================================
// AI TOUR GENERATION
// ============================================
const AI_SYSTEM_PROMPT = `You are a CastFlow tour generator. CastFlow creates interactive guided tours on web pages with TTS narration, spotlight highlighting, and animated cursor.

Given a simplified DOM snapshot of a web page, generate a practical onboarding tour as a JSON array of scenes.

Each scene MUST follow this schema:
{
  "title": "Short step title (3-6 words)",
  "text": "Description shown in tooltip and spoken via TTS (1-2 sentences)",
  "element": "CSS selector from the DOM snapshot",
  "tooltipPosition": "top | bottom | left | right",
  "action": { "type": "click", "selector": "..." }   // OPTIONAL — see below
}

SCENE ACTIONS (the "action" field):
- CastFlow supports an optional "action" field that executes a real click on the page BEFORE the scene's spotlight appears.
- Use "action": { "type": "click", "selector": "..." } when you need to open a dropdown, expand a menu, or toggle something before highlighting a child element.
- The engine clicks the target, waits 400ms for the DOM to update, then highlights the scene's "element".

HANDLING COLLAPSED MENUS AND DROPDOWNS:
- Elements with "hidden":true are inside collapsed menus not currently visible.
- Elements with "parentToggle" tell you which button/link opens that menu.
- To guide users through a collapsed menu, use "action" on the scene:
  * "action": { "type": "click", "selector": "<the parentToggle selector>" } — this opens the menu
  * "element": "<the hidden child selector>" — this highlights the child after the menu opens
  * "text": explain what this menu option does
- IMPORTANT: Only the FIRST child of a given menu needs "action". Once the menu is open, subsequent scenes pointing at other children of the SAME menu do NOT need "action" again — the menu stays open. CastFlow is smart enough to skip the click if the menu is already expanded.
- If you move to a DIFFERENT parent menu, include "action" again for that new parent's toggle.
- NEVER generate a scene that ONLY says "click here to open this menu" without highlighting something useful inside it.

CRITICAL RULES:
1. Use ONLY the exact "selector" values from the DOM snapshot. Copy them verbatim. NEVER create, modify, or combine selectors.
2. If a selector looks fragile (long class chains, positional paths), SKIP it. Prefer short selectors (#id, [aria-label], [data-testid]).
3. Generate 5-12 scenes that teach real workflows — things a new user needs to learn.
4. NEVER point at obvious structural elements like <header>, <footer>, <nav>, <main>, <aside>, or generic containers. These add no value. Focus on actionable elements: buttons, links, form fields, menu items.
5. Order logically: start with the main purpose of the page, then walk through key actions step by step.
6. tooltipPosition: "bottom" for top elements, "top" for bottom elements, "right" for left elements, "left" for right elements. Use rect coordinates.
7. Write title and text in the same language as the page content unless instructed otherwise.
8. Keep text concise (1-2 sentences). Explain WHAT the element does and WHY the user would use it.
9. Use the "Page text content" to understand the page context and write accurate descriptions.
10. Respond ONLY with a valid JSON array. No markdown fences, no explanation, no extra text.`;

async function handleGenerateTour(message) {
  const { dom, userPrompt, lang } = message;

  const data = await chrome.storage.local.get('aiSettings');
  const settings = data.aiSettings;
  if (!settings || !settings.endpoint) {
    throw new Error('AI not configured. Go to AI Settings (\u2699) and enter your API key. Supports OpenAI, Azure, Google Gemini, Groq, Mistral, Ollama, and LM Studio.');
  }

  let langNote = '';
  if (lang) {
    const langNames = { 'en-US': 'English', 'es-ES': 'Spanish', 'de-DE': 'German', 'fr-FR': 'French' };
    langNote = '\nIMPORTANT: Write all title and text fields in ' + (langNames[lang] || lang) + '.';
  }

  const systemPrompt = AI_SYSTEM_PROMPT + langNote;

  const userContent = 'Page: ' + dom.title + ' (' + dom.url + ')\n'
    + 'Viewport: ' + dom.viewport.w + '×' + dom.viewport.h + '\n\n'
    + (userPrompt ? 'User instructions: ' + userPrompt + '\n\n' : '')
    + (dom.pageText ? 'Page text content (for context):\n' + dom.pageText + '\n\n' : '')
    + 'DOM Elements (elements with hidden:true are inside collapsed menus — use parentToggle to know which button opens them):\n' + JSON.stringify(dom.nodes, null, 1);

  const content = await callAI(settings, systemPrompt, userContent);

  // Parse — handle possible markdown fences
  let scenes;
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');
    scenes = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(scenes)) throw new Error('Response is not an array');
  } catch (e) {
    throw new Error('Failed to parse AI response: ' + e.message + '\n\nRaw response:\n' + content.substring(0, 500));
  }

  return { scenes };
}

async function callAI(settings, systemPrompt, userContent) {
  const { provider, endpoint, apiKey, model } = settings;

  const headers = { 'Content-Type': 'application/json' };
  const body = {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ],
    temperature: 0.7,
    max_tokens: 4000
  };

  // Default models per provider
  const DEFAULT_MODELS = {
    openai: 'gpt-4o-mini',
    gemini: 'gemini-2.0-flash',
    groq: 'llama-3.3-70b-versatile',
    mistral: 'mistral-small-latest',
    ollama: 'llama3.1',
    lmstudio: '',
    custom: ''
  };

  // Auth: Azure uses api-key header, local providers skip auth, rest use Bearer
  if (provider === 'azure') {
    headers['api-key'] = apiKey;
  } else if (provider !== 'ollama' && provider !== 'lmstudio') {
    if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
  }

  // Model: Azure embeds it in the URL, everyone else sends it in the body
  if (provider !== 'azure') {
    body.model = model || DEFAULT_MODELS[provider] || 'gpt-4o-mini';
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error('AI API error ' + response.status + ': ' + text.substring(0, 300));
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content in AI response');
  return content;
}

// ============================================
// SELECTOR PICKER (injected into page)
// ============================================
async function startPickerInTab(tabId) {
  await chrome.scripting.insertCSS({
    target: { tabId },
    css: `
      .__cf-picker-overlay{position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647;cursor:crosshair}
      .__cf-picker-hl{position:fixed;border:2px solid #6366f1;background:rgba(99,102,241,.12);border-radius:4px;pointer-events:none;z-index:2147483646;transition:all .1s ease;display:none}
      .__cf-picker-label{position:fixed;background:#6366f1;color:#fff;font:11px/1.4 system-ui,sans-serif;padding:2px 8px;border-radius:4px;z-index:2147483647;pointer-events:none;display:none;white-space:nowrap;max-width:400px;overflow:hidden;text-overflow:ellipsis}
    `
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => {
      if (window.__cfPicker) return;

      const JUNK_CLASS = /^(js-|is-|has-|ng-|_|svelte-|__cf|css-|f[0-9a-z]{4,}$|[A-Z][A-Za-z0-9]{4,}$)/;

      function isUnique(s) {
        try { return document.querySelectorAll(s).length === 1; } catch { return false; }
      }

      function getBestSelector(el) {
        if (el.id && !/^\d+$/.test(el.id)) {
          const s = '#' + CSS.escape(el.id);
          if (isUnique(s)) return s;
        }
        for (const attr of ['data-testid','data-test-id','data-cy','data-telemetryname','data-automationid']) {
          const v = el.getAttribute(attr);
          if (v) {
            const s = '[' + attr + '="' + CSS.escape(v) + '"]';
            if (isUnique(s)) return s;
          }
        }
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.length <= 60) {
          const s = el.tagName.toLowerCase() + '[aria-label="' + CSS.escape(ariaLabel) + '"]';
          if (isUnique(s)) return s;
        }
        const name = el.getAttribute('name');
        if (name) {
          const s = el.tagName.toLowerCase() + '[name="' + CSS.escape(name) + '"]';
          if (isUnique(s)) return s;
        }
        if (el.classList.length) {
          const cls = Array.from(el.classList).filter(c => !JUNK_CLASS.test(c) && c.length < 40);
          for (let count = Math.min(cls.length, 3); count >= 1; count--) {
            const s = el.tagName.toLowerCase() + '.' + cls.slice(0, count).map(c => CSS.escape(c)).join('.');
            try { if (isUnique(s)) return s; } catch(e) {}
          }
        }
        const parts = [];
        let cur = el;
        let depth = 0;
        while (cur && cur !== document.body && cur !== document.documentElement && depth < 4) {
          let s = cur.tagName.toLowerCase();
          if (cur.id && !/^\d+$/.test(cur.id)) { parts.unshift('#' + CSS.escape(cur.id)); break; }
          const parent = cur.parentElement;
          if (parent) {
            const sibs = Array.from(parent.children).filter(c => c.tagName === cur.tagName);
            if (sibs.length > 1) s += ':nth-of-type(' + (sibs.indexOf(cur) + 1) + ')';
          }
          parts.unshift(s);
          cur = cur.parentElement;
          depth++;
        }
        return parts.join(' > ');
      }

      const ov = document.createElement('div');
      ov.className = '__cf-picker-overlay';
      const hl = document.createElement('div');
      hl.className = '__cf-picker-hl';
      const lb = document.createElement('div');
      lb.className = '__cf-picker-label';

      document.documentElement.appendChild(hl);
      document.documentElement.appendChild(lb);
      document.documentElement.appendChild(ov);

      let currentEl = null;

      function onMove(e) {
        ov.style.pointerEvents = 'none';
        const el = document.elementFromPoint(e.clientX, e.clientY);
        ov.style.pointerEvents = '';
        if (!el || el === ov || el === hl || el === lb) return;
        currentEl = el;
        const r = el.getBoundingClientRect();
        Object.assign(hl.style, { display: '', top: r.top + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px' });
        lb.style.display = '';
        lb.style.top = Math.max(0, r.top - 22) + 'px';
        lb.style.left = r.left + 'px';
        lb.textContent = getBestSelector(el);
      }

      function onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (!currentEl) return;
        const selector = getBestSelector(currentEl);
        window.postMessage({ __castflow_picked: true, selector }, '*');
        cleanup();
      }

      function onKey(e) {
        if (e.key === 'Escape') cleanup();
      }

      function cleanup() {
        ov.remove(); hl.remove(); lb.remove();
        document.removeEventListener('keydown', onKey, true);
        window.__cfPicker = null;
      }

      ov.addEventListener('mousemove', onMove);
      ov.addEventListener('click', onClick, true);
      document.addEventListener('keydown', onKey, true);

      window.__cfPicker = { cleanup };
    }
  });
}

async function stopPickerInTab(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => {
      if (window.__cfPicker) {
        window.__cfPicker.cleanup();
        window.__cfPicker = null;
      }
    }
  });
}
