/**
 * CastFlow Extension — Popup Logic
 * Manages tour CRUD, playback control, import/export.
 */

(() => {
  'use strict';

  // ============================================
  // ICONS (inline SVG strings)
  // ============================================
  const ICONS = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
  };

  // ============================================
  // STATE
  // ============================================
  let tours = [];
  let currentUrl = '';
  let currentTabId = null;
  let editingTourId = null;
  let playingTourId = null;
  let selectedLangs = {}; // tourId → selected language code
  let aiSettings = null;

  // ============================================
  // DOM REFS
  // ============================================
  const $ = (sel) => document.querySelector(sel);
  const viewList = $('#view-list');
  const viewEditor = $('#view-editor');
  const listMatching = $('#list-matching');
  const listAll = $('#list-all');
  const labelMatching = $('#label-matching');
  const labelAll = $('#label-all');
  const emptyState = $('#empty-state');
  const fileInput = $('#file-input');

  // Editor
  const edName = $('#ed-name');
  const edUrl = $('#ed-url');
  const edLang = $('#ed-lang');
  const edSpeed = $('#ed-speed');
  const edScenes = $('#ed-scenes');
  const edError = $('#ed-error');

  // ============================================
  // INIT
  // ============================================
  async function init() {
    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      currentUrl = tab.url || '';
      currentTabId = tab.id;
    }

    // Check if a tour is currently playing
    if (currentTabId) {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'getState', tabId: currentTabId });
        if (response && response.playing) {
          playingTourId = '__active__';
        }
      } catch (e) { /* background not ready */ }
    }

    // Load tours
    const data = await chrome.storage.local.get('tours');
    tours = data.tours || [];
    renderList();

    // Wire events
    $('#btn-new').addEventListener('click', () => openEditor(null));
    $('#btn-import').addEventListener('click', () => fileInput.click());
    $('#btn-export').addEventListener('click', exportTours);
    $('#btn-back').addEventListener('click', () => showView('list'));
    $('#btn-cancel').addEventListener('click', () => showView('list'));
    $('#btn-save').addEventListener('click', saveTour);
    $('#btn-delete').addEventListener('click', deleteTour);
    $('#btn-add-scene').addEventListener('click', addBlankScene);
    fileInput.addEventListener('change', importTours);

    // AI & Picker buttons
    $('#btn-ai-generate').addEventListener('click', () => openGenerate());
    $('#btn-ai-settings').addEventListener('click', () => openAiSettings());
    $('#btn-ai-back').addEventListener('click', () => showView('list'));
    $('#btn-ai-cancel').addEventListener('click', () => showView('list'));
    $('#btn-ai-save').addEventListener('click', () => saveAiSettings());
    $('#ai-provider').addEventListener('change', () => updateProviderHints());
    $('#btn-gen-back').addEventListener('click', () => showView('list'));
    $('#btn-gen-cancel').addEventListener('click', () => showView('list'));
    $('#btn-gen-start').addEventListener('click', () => handleGenerate());
    $('#btn-pick-selector').addEventListener('click', () => startPicker());
    $('#btn-validate-selectors').addEventListener('click', () => validateSelectors());
    $('#btn-picker-copy').addEventListener('click', () => copyPickedSelector());
    $('#btn-picker-dismiss').addEventListener('click', () => dismissPicker());

    // Load AI settings & check for picked selector
    await loadAiSettings();
    await checkPickedSelector();
  }

  // ============================================
  // URL PATTERN MATCHING
  // ============================================
  function matchesUrl(pattern, url) {
    try {
      // Convert glob pattern to regex
      let regex = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&') // escape special chars except * and ?
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      return new RegExp('^' + regex + '$', 'i').test(url);
    } catch {
      return false;
    }
  }

  // ============================================
  // RENDERING
  // ============================================
  function renderList() {
    const matching = tours.filter(t => matchesUrl(t.urlPattern, currentUrl));
    const others = tours.filter(t => !matchesUrl(t.urlPattern, currentUrl));

    listMatching.innerHTML = '';
    listAll.innerHTML = '';

    if (tours.length === 0) {
      emptyState.style.display = '';
      labelMatching.style.display = 'none';
      labelAll.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';

    // Matching tours
    if (matching.length > 0) {
      labelMatching.style.display = '';
      matching.forEach(t => listMatching.appendChild(createTourCard(t, true)));
    } else {
      labelMatching.style.display = 'none';
    }

    // All tours
    labelAll.style.display = '';
    if (others.length > 0) {
      others.forEach(t => listAll.appendChild(createTourCard(t, false)));
    } else {
      // If all match, show them all under "All"
      if (matching.length > 0) {
        labelAll.style.display = 'none';
      }
    }
  }

  function createTourCard(tour, canPlay) {
    const card = document.createElement('div');
    card.className = 'tour-card';

    const scenesCount = (tour.scenes || []).length;
    const isPlaying = playingTourId === tour.id;
    const langs = getAvailableLangs(tour);
    const selectedLang = selectedLangs[tour.id] || tour.lang || 'en-US';
    const displayName = getTranslatedName(tour, selectedLang);

    card.innerHTML = `
      <div class="tour-info">
        <div class="tour-name">${escapeHtml(displayName || 'Untitled')}</div>
        <div class="tour-meta">${escapeHtml(tour.urlPattern || '')} · ${scenesCount} scene${scenesCount !== 1 ? 's' : ''}</div>
      </div>
      <div class="tour-actions">
        ${langs.length > 1 ? `<div class="lang-switcher">${langs.map(l =>
          `<button class="lang-btn${l.code === selectedLang ? ' active' : ''}" data-action="lang" data-id="${tour.id}" data-lang="${l.code}" title="${l.label}">${l.flag}</button>`
        ).join('')}</div>` : ''}
        ${canPlay
          ? `<button class="btn-${isPlaying ? 'stop' : 'play'}" data-action="${isPlaying ? 'stop' : 'play'}" data-id="${tour.id}" title="${isPlaying ? 'Stop' : 'Play'}">${isPlaying ? ICONS.stop : ICONS.play}</button>`
          : ''
        }
        <button class="btn-edit" data-action="edit" data-id="${tour.id}" title="Edit">${ICONS.edit}</button>
      </div>
    `;

    // Wire card buttons
    card.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'play') playTour(id);
        else if (action === 'stop') stopTour();
        else if (action === 'edit') openEditor(id);
        else if (action === 'lang') {
          selectedLangs[btn.dataset.id] = btn.dataset.lang;
          renderList();
        }
      });
    });

    return card;
  }

  // ============================================
  // PLAYBACK
  // ============================================
  async function playTour(tourId) {
    const tour = tours.find(t => t.id === tourId);
    if (!tour || !currentTabId) return;

    const lang = selectedLangs[tourId] || tour.lang || 'en-US';
    const tourConfig = applyTranslation(tour, lang);

    try {
      await chrome.runtime.sendMessage({ type: 'playTour', tabId: currentTabId, tour: tourConfig });
      playingTourId = tour.id;
      renderList();
    } catch (e) {
      console.error('Failed to play tour:', e);
    }
  }

  async function stopTour() {
    if (!currentTabId) return;
    try {
      await chrome.runtime.sendMessage({ type: 'stopTour', tabId: currentTabId });
    } catch (e) { /* ignore */ }
    playingTourId = null;
    renderList();
  }

  // ============================================
  // EDITOR
  // ============================================
  function openEditor(tourId) {
    editingTourId = tourId;
    edError.textContent = '';

    if (tourId) {
      const tour = tours.find(t => t.id === tourId);
      if (!tour) return;
      $('#editor-title').textContent = 'Edit Tour';
      edName.value = tour.name || '';
      edUrl.value = tour.urlPattern || '';
      edLang.value = tour.lang || 'en-US';
      edSpeed.value = String(tour.speed || 1);
      edScenes.value = JSON.stringify(tour.scenes || [], null, 2);
      $('#btn-delete').style.display = '';
    } else {
      $('#editor-title').textContent = 'New Tour';
      edName.value = '';
      edUrl.value = guessUrlPattern(currentUrl);
      edLang.value = 'en-US';
      edSpeed.value = '1';
      edScenes.value = JSON.stringify([
        { title: 'Step 1', text: 'Description...', element: '#css-selector', position: 'bottom' }
      ], null, 2);
      $('#btn-delete').style.display = 'none';
    }

    showView('editor');
  }

  function saveTour() {
    const name = edName.value.trim();
    const urlPattern = edUrl.value.trim();
    let scenes;

    if (!name) { edError.textContent = 'Tour name is required.'; return; }
    if (!urlPattern) { edError.textContent = 'URL pattern is required.'; return; }

    try {
      scenes = JSON.parse(edScenes.value);
      if (!Array.isArray(scenes)) throw new Error('Scenes must be a JSON array.');
    } catch (e) {
      edError.textContent = 'Invalid JSON: ' + e.message;
      return;
    }

    const tourData = {
      name,
      urlPattern,
      lang: edLang.value,
      speed: parseFloat(edSpeed.value) || 1,
      scenes,
    };

    if (editingTourId) {
      // Update existing
      const idx = tours.findIndex(t => t.id === editingTourId);
      if (idx !== -1) {
        tours[idx] = { ...tours[idx], ...tourData };
      }
    } else {
      // Create new
      tourData.id = 'tour-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      tours.push(tourData);
    }

    chrome.storage.local.set({ tours });
    showView('list');
    renderList();
  }

  function deleteTour() {
    if (!editingTourId) return;
    if (!confirm('Delete this tour?')) return;

    tours = tours.filter(t => t.id !== editingTourId);
    chrome.storage.local.set({ tours });
    editingTourId = null;
    showView('list');
    renderList();
  }

  function addBlankScene() {
    try {
      const scenes = JSON.parse(edScenes.value || '[]');
      scenes.push({
        title: `Step ${scenes.length + 1}`,
        text: 'Description...',
        element: '#css-selector',
        position: 'bottom'
      });
      edScenes.value = JSON.stringify(scenes, null, 2);
      edError.textContent = '';
    } catch (e) {
      edError.textContent = 'Fix the JSON errors first.';
    }
  }

  // ============================================
  // IMPORT / EXPORT
  // ============================================
  function importTours(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) imported = [imported];

        // Validate and assign IDs
        imported.forEach(t => {
          if (!t.id) {
            t.id = 'tour-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
          }
          if (!t.name) t.name = 'Imported Tour';
          if (!t.urlPattern) t.urlPattern = '*://*/*';
          if (!t.scenes) t.scenes = [];
        });

        tours = tours.concat(imported);
        chrome.storage.local.set({ tours });
        renderList();
      } catch (err) {
        alert('Invalid JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    fileInput.value = ''; // reset
  }

  function exportTours() {
    if (tours.length === 0) {
      alert('No tours to export.');
      return;
    }
    const blob = new Blob([JSON.stringify(tours, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'castflow-tours.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ============================================
  // HELPERS
  // ============================================
  function showView(name) {
    viewList.style.display = name === 'list' ? '' : 'none';
    viewEditor.style.display = name === 'editor' ? '' : 'none';
    const vas = $('#view-ai-settings');
    const vg = $('#view-generate');
    if (vas) vas.style.display = name === 'ai-settings' ? '' : 'none';
    if (vg) vg.style.display = name === 'generate' ? '' : 'none';
    if (name === 'list') renderList();
  }

  function guessUrlPattern(url) {
    try {
      const u = new URL(url);
      return `*://${u.hostname}/*`;
    } catch {
      return '*://*/*';
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ============================================
  // MULTI-LANGUAGE SUPPORT
  // ============================================
  const LANG_META = {
    'en-US': { flag: '🇺🇸', label: 'English' },
    'es-ES': { flag: '🇪🇸', label: 'Español' },
    'de-DE': { flag: '🇩🇪', label: 'Deutsch' },
    'fr-FR': { flag: '🇫🇷', label: 'Français' },
    'pt-BR': { flag: '🇧🇷', label: 'Português' },
    'it-IT': { flag: '🇮🇹', label: 'Italiano' },
  };

  function getAvailableLangs(tour) {
    const base = tour.lang || 'en-US';
    const codes = [base, ...Object.keys(tour.translations || {})];
    return [...new Set(codes)].map(code => ({
      code,
      flag: (LANG_META[code] || {}).flag || '🌐',
      label: (LANG_META[code] || {}).label || code,
    }));
  }

  function getTranslatedName(tour, lang) {
    if (lang && tour.translations && tour.translations[lang]) {
      return tour.translations[lang].name || tour.name;
    }
    return tour.name;
  }

  function applyTranslation(tour, lang) {
    // If default language or no translation, return as-is
    if (!lang || lang === tour.lang || !tour.translations || !tour.translations[lang]) {
      return tour;
    }
    const tr = tour.translations[lang];
    const translated = {
      ...tour,
      lang: tr.lang || lang,
      speed: tr.speed || tour.speed,
      defaultVoices: tr.defaultVoices || tour.defaultVoices,
    };
    // Merge scene title+text from translation
    if (tr.scenes && Array.isArray(tr.scenes)) {
      translated.scenes = (tour.scenes || []).map((scene, i) => {
        if (tr.scenes[i]) {
          return { ...scene, title: tr.scenes[i].title || scene.title, text: tr.scenes[i].text || scene.text };
        }
        return scene;
      });
    }
    // Remove translations from injected config (not needed at runtime)
    delete translated.translations;
    return translated;
  }

  // ============================================
  // AI SETTINGS & TOUR GENERATION
  // ============================================
  const PROVIDER_DEFAULTS = {
    openai:   { endpoint: 'https://api.openai.com/v1/chat/completions',       hint: 'Standard OpenAI API', model: 'gpt-4o-mini' },
    azure:    { endpoint: 'https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=2024-02-01', hint: 'Replace <resource> and <deployment> with your Azure values', model: '' },
    gemini:   { endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', hint: 'Google AI Studio API key required', model: 'gemini-2.0-flash' },
    groq:     { endpoint: 'https://api.groq.com/openai/v1/chat/completions',   hint: 'Free tier available at console.groq.com', model: 'llama-3.3-70b-versatile' },
    mistral:  { endpoint: 'https://api.mistral.ai/v1/chat/completions',        hint: 'Mistral API key from console.mistral.ai', model: 'mistral-small-latest' },
    ollama:   { endpoint: 'http://localhost:11434/v1/chat/completions',         hint: 'Local — no API key needed', model: 'llama3.1' },
    lmstudio: { endpoint: 'http://localhost:1234/v1/chat/completions',          hint: 'Local — no API key needed', model: '' },
    custom:   { endpoint: '',                                                   hint: 'Any OpenAI-compatible endpoint', model: '' }
  };

  // No default credentials — users configure their own API key (BYOK)
  const EMPTY_SETTINGS = {
    provider: 'openai',
    endpoint: '',
    apiKey: '',
    model: ''
  };

  async function loadAiSettings() {
    const data = await chrome.storage.local.get('aiSettings');
    if (data.aiSettings && data.aiSettings.endpoint) {
      aiSettings = data.aiSettings;
    } else {
      aiSettings = EMPTY_SETTINGS;
    }
  }

  function openAiSettings() {
    const p = $('#ai-provider');
    const ep = $('#ai-endpoint');
    const key = $('#ai-key');
    const model = $('#ai-model');
    if (aiSettings) {
      p.value = aiSettings.provider || 'azure';
      ep.value = aiSettings.endpoint || '';
      key.value = aiSettings.apiKey || '';
      model.value = aiSettings.model || '';
    } else {
      p.value = 'azure';
      ep.value = '';
      key.value = '';
      model.value = '';
    }
    updateProviderHints();
    showView('ai-settings');
  }

  function updateProviderHints() {
    const prov = $('#ai-provider').value;
    const defaults = PROVIDER_DEFAULTS[prov];
    const hintEl = $('#ai-endpoint-hint');
    const ep = $('#ai-endpoint');
    const modelInput = $('#ai-model');
    if (hintEl) hintEl.textContent = defaults?.hint || '';
    // Auto-fill endpoint if empty or still a default
    if (!ep.value || Object.values(PROVIDER_DEFAULTS).some(d => d.endpoint === ep.value)) {
      ep.value = defaults?.endpoint || '';
    }
    // Auto-fill model placeholder
    if (modelInput && defaults?.model) {
      modelInput.placeholder = defaults.model || 'model name';
    }
    // Show/hide fields based on provider
    const noKeyProviders = ['ollama', 'lmstudio'];
    const noModelProviders = ['azure'];
    const keyField = $('#ai-key-field');
    const modelField = $('#ai-model-field');
    if (keyField) keyField.style.display = noKeyProviders.includes(prov) ? 'none' : '';
    if (modelField) modelField.style.display = noModelProviders.includes(prov) ? 'none' : '';
  }

  async function saveAiSettings() {
    aiSettings = {
      provider: $('#ai-provider').value,
      endpoint: $('#ai-endpoint').value.trim(),
      apiKey: $('#ai-key').value.trim(),
      model: $('#ai-model').value.trim()
    };
    await chrome.storage.local.set({ aiSettings });
    showView('list');
  }

  // --- Generate Tour ---
  function openGenerate() {
    if (!aiSettings || !aiSettings.endpoint || aiSettings.endpoint.includes('<resource>')) {
      openAiSettings();
      return;
    }
    $('#gen-prompt').value = '';
    $('#gen-error').textContent = '';
    $('#gen-status').style.display = 'none';
    $('#btn-gen-start').disabled = false;
    showView('generate');
  }

  async function handleGenerate() {
    const errorEl = $('#gen-error');
    const statusEl = $('#gen-status');
    const statusText = $('#gen-status-text');
    const startBtn = $('#btn-gen-start');

    errorEl.textContent = '';
    statusEl.style.display = 'flex';
    statusText.textContent = 'Analyzing page DOM...';
    startBtn.disabled = true;

    try {
      // Step 1: Extract DOM
      const dom = await chrome.runtime.sendMessage({ type: 'extractDOM', tabId: currentTabId });
      if (dom.error) throw new Error(dom.error);

      statusText.textContent = 'Found ' + dom.nodes.length + ' elements. Generating tour with AI...';

      // Step 2: Generate with AI
      const lang = $('#gen-lang').value;
      const result = await chrome.runtime.sendMessage({
        type: 'generateTour',
        dom,
        userPrompt: $('#gen-prompt').value.trim(),
        lang: lang || undefined
      });

      if (result.error) throw new Error(result.error);

      // Step 3: Open editor with generated scenes
      statusEl.style.display = 'none';
      openEditorWithGeneratedScenes(result.scenes, dom.url, lang);

    } catch (err) {
      statusEl.style.display = 'none';
      errorEl.textContent = err.message;
      startBtn.disabled = false;
    }
  }

  function openEditorWithGeneratedScenes(scenes, pageUrl, lang) {
    editingTourId = null;
    edError.textContent = '';
    $('#editor-title').textContent = '✨ Generated Tour';
    let host = 'New';
    try { host = new URL(pageUrl).hostname; } catch {}
    edName.value = 'Tour — ' + host;
    edUrl.value = guessUrlPattern(pageUrl);
    edLang.value = lang || 'en-US';
    edSpeed.value = '1';
    edScenes.value = JSON.stringify(scenes, null, 2);
    $('#btn-delete').style.display = 'none';
    showView('editor');
  }

  // --- Selector Validation ---
  async function validateSelectors() {
    const validationEl = $('#ed-validation');
    if (!validationEl) return;

    let scenes;
    try {
      scenes = JSON.parse(edScenes.value);
      if (!Array.isArray(scenes)) throw new Error();
    } catch {
      validationEl.style.display = '';
      validationEl.innerHTML = '<div class="val-error">Fix JSON errors first.</div>';
      return;
    }

    if (!currentTabId) {
      validationEl.style.display = '';
      validationEl.innerHTML = '<div class="val-error">No active tab to validate against.</div>';
      return;
    }

    const selectors = scenes.map(s => s.element || '');

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        world: 'MAIN',
        func: (sels) => sels.map(s => {
          if (!s) return { found: false, reason: 'empty' };
          try {
            const el = document.querySelector(s);
            if (!el) return { found: false, reason: 'not found' };
            const r = el.getBoundingClientRect();
            const visible = r.width > 0 && r.height > 0;
            return { found: true, visible, tag: el.tagName.toLowerCase(), text: (el.innerText || '').trim().substring(0, 40) };
          } catch (e) {
            return { found: false, reason: 'invalid selector' };
          }
        }),
        args: [selectors]
      });

      const checks = results?.[0]?.result || [];
      let html = '';
      let okCount = 0;

      scenes.forEach((sc, i) => {
        const check = checks[i] || { found: false, reason: 'no result' };
        if (check.found && check.visible) {
          okCount++;
          html += '<div class="val-ok">\u2705 ' + escapeHtml(sc.title || 'Scene ' + (i+1)) + ' \u2014 <code>' + escapeHtml(selectors[i]).substring(0, 50) + '</code></div>';
        } else if (check.found && !check.visible) {
          html += '<div class="val-warn">\u26a0\ufe0f ' + escapeHtml(sc.title || 'Scene ' + (i+1)) + ' \u2014 found but hidden</div>';
        } else {
          html += '<div class="val-error">\u274c ' + escapeHtml(sc.title || 'Scene ' + (i+1)) + ' \u2014 ' + (check.reason || 'not found') + '</div>';
        }
      });

      html = '<div class="val-summary">' + okCount + '/' + scenes.length + ' selectors found on page</div>' + html;
      validationEl.style.display = '';
      validationEl.innerHTML = html;
    } catch (e) {
      validationEl.style.display = '';
      validationEl.innerHTML = '<div class="val-error">Validation failed: ' + escapeHtml(e.message) + '</div>';
    }
  }

  // --- Selector Picker ---
  async function startPicker() {
    if (!currentTabId) return;
    await chrome.storage.local.set({ pickerActive: true, lastPickedSelector: null });
    await chrome.runtime.sendMessage({ type: 'startPicker', tabId: currentTabId });
    window.close(); // Popup closes; user clicks on page; result stored in storage
  }

  async function checkPickedSelector() {
    const data = await chrome.storage.local.get(['lastPickedSelector', 'pickerActive']);
    if (data.lastPickedSelector) {
      const banner = $('#picker-banner');
      const selEl = $('#picker-selector');
      if (banner && selEl) {
        banner.style.display = '';
        selEl.textContent = data.lastPickedSelector;
      }
      await chrome.storage.local.remove(['lastPickedSelector', 'pickerActive']);
    }
  }

  function dismissPicker() {
    const banner = $('#picker-banner');
    if (banner) banner.style.display = 'none';
  }

  function copyPickedSelector() {
    const selEl = $('#picker-selector');
    if (!selEl) return;
    const sel = selEl.textContent;
    navigator.clipboard.writeText(sel);
    const original = sel;
    selEl.textContent = sel + ' ✓';
    setTimeout(() => { selEl.textContent = original; }, 1500);
  }

  // ============================================
  // BOOT
  // ============================================
  init();
})();
