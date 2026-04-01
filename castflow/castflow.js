/**
 * CastFlow.js — Video-like guided tour library with Text-to-Speech
 * 
 * Features:
 *  - TTS narration with voice & language selection
 *  - Video-like player bar (draggable, collapsible)
 *  - Fake cursor animation with click ripple
 *  - SVG spotlight with pulsating highlight ring
 *  - Smart tooltip positioning (never clips viewport)
 *  - Scene actions: real clicks, open modals, custom callbacks
 *  - Keyboard controls: arrows, space, escape
 *
 * Usage:
 *   const tour = new CastFlow({ scenes: [...] });
 *   tour.start();
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CastFlow = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ===========================================
  // ICONS (path data only — built into SVG DOM nodes by svgIcon())
  // ===========================================
  const ICON_PATHS = {
    play: 'M8 5v14l11-7z',
    pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
    prev: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
    next: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    chevronDown: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z',
    settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z',
  };

  const SVG_NS = 'http://www.w3.org/2000/svg';

  /** Create an SVG icon element (CSP-safe, no innerHTML). Returns a new node each call. */
  function svgIcon(name) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', ICON_PATHS[name]);
    svg.appendChild(path);
    return svg;
  }

  /** Create the cursor SVG icon (more complex — has fill/stroke). */
  function svgCursorIcon() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L5.85 2.36a.5.5 0 0 0-.35.85z');
    path.setAttribute('fill', '#111827');
    path.setAttribute('stroke', '#ffffff');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    return svg;
  }

  /** Set a button's contents to an icon, optionally with text. CSP-safe. */
  function setButtonIcon(btn, iconName, text, textFirst) {
    btn.textContent = '';
    if (textFirst && text) btn.appendChild(document.createTextNode(text + ' '));
    btn.appendChild(svgIcon(iconName));
    if (!textFirst && text) btn.appendChild(document.createTextNode(' ' + text));
  }

  const LANG_MAP = {
    'en-US': { flag: '🇺🇸', label: 'English' },
    'es-ES': { flag: '🇪🇸', label: 'Español' },
    'de-DE': { flag: '🇩🇪', label: 'Deutsch' },
    'fr-FR': { flag: '🇫🇷', label: 'Français' },
    'pt-BR': { flag: '🇧🇷', label: 'Português' },
    'it-IT': { flag: '🇮🇹', label: 'Italiano' },
    'ja-JP': { flag: '🇯🇵', label: '日本語' },
    'zh-CN': { flag: '🇨🇳', label: '中文' },
  };

  // ===========================================
  // UTILITY
  // ===========================================
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function ce(tag, cls, html) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html) el.innerHTML = html;
    return el;
  }

  function getRect(el) {
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===========================================
  // MAIN CLASS
  // ===========================================
  class CastFlow {
    constructor(options = {}) {
      this.scenes = options.scenes || [];
      this.lang = options.lang || 'en-US';
      this.autoPlay = options.autoPlay !== false;
      this.speed = options.speed || 1;
      this.showCursor = options.showCursor !== false;
      this.theme = options.theme || 'light';
      this.overlayColor = options.overlayColor || 'rgba(0, 0, 0, 0.55)';
      this.padding = options.padding != null ? options.padding : 12;
      this.borderRadius = options.borderRadius != null ? options.borderRadius : 8;
      this.ttsEnabled = options.ttsEnabled !== false;
      this.availableLangs = options.availableLangs || Object.keys(LANG_MAP);
      this.defaultVoices = options.defaultVoices || {}; // e.g. { 'en-US': 'Google UK English Male' }
      this.onComplete = options.onComplete || null;
      this.onSceneChange = options.onSceneChange || null;
      this.sceneDelay = options.sceneDelay || 800;
      this.startCollapsed = options.startCollapsed !== false; // bar starts collapsed

      // Internal
      this._currentIndex = -1;
      this._isPlaying = false;
      this._isPaused = false;
      this._autoTimer = null;
      this._speechUtterance = null;
      this._destroyed = false;
      this._elements = {};
      this._cursorPos = { x: -100, y: -100 };
      this._animFrame = null;
      this._speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
      this._speedIndex = this._speeds.indexOf(this.speed);
      if (this._speedIndex === -1) this._speedIndex = 2;
      this._selectedVoice = null; // user-chosen voice
      this._barCollapsed = this.startCollapsed;
      this._speechId = 0;        // guards stale onend callbacks
      this._transitionId = 0;    // guards stacked async transitions
      this._pausedSpeechText = null; // text to re-speak on resume
      this._ttsKeepAlive = null;     // interval to prevent Chrome from killing long utterances
      this._ttsWatchdog = null;      // timeout to detect silently stalled speech

      // Drag state
      this._drag = { active: false, startX: 0, startY: 0, barX: 0, barY: 0 };

      // Binds
      this._onResize = this._handleResize.bind(this);
      this._onKeydown = this._handleKeydown.bind(this);
      this._onDragMove = this._handleDragMove.bind(this);
      this._onDragEnd = this._handleDragEnd.bind(this);
    }

    // ===========================================
    // PUBLIC API
    // ===========================================
    start() {
      if (this._destroyed) return;
      this._buildDOM();
      this._bindEvents();
      this._loadVoices().then(() => {
        this._currentIndex = -1;
        this._isPlaying = true;
        this._isPaused = false;
        this._showPlayerBar();
        this._updatePlayBtn();
        this.next();
      });
    }

    next() {
      if (this._currentIndex < this.scenes.length - 1) {
        this._goToScene(this._currentIndex + 1);
      } else {
        this.stop();
      }
    }

    prev() {
      if (this._currentIndex > 0) {
        this._goToScene(this._currentIndex - 1);
      }
    }

    goTo(index) {
      if (index >= 0 && index < this.scenes.length) {
        this._goToScene(index);
      }
    }

    pause() {
      this._isPaused = true;
      this._isPlaying = false;
      clearTimeout(this._autoTimer);
      this._clearTtsTimers();
      // Cancel speech instead of using buggy speechSynthesis.pause()
      // Save current scene's speech text so resume can re-speak
      if (window.speechSynthesis.speaking || window.speechSynthesis.paused) {
        const scene = this.scenes[this._currentIndex];
        if (scene) {
          this._pausedSpeechText = this._getLocalized(scene, 'speech') || this._getLocalized(scene, 'text');
        }
        this._speechId++; // invalidate current onend
        window.speechSynthesis.cancel();
      }
      this._updatePlayBtn();
    }

    resume() {
      this._isPaused = false;
      this._isPlaying = true;
      this._updatePlayBtn();

      // Re-speak the paused text, or schedule next if nothing to say
      if (this._pausedSpeechText && this.ttsEnabled) {
        const text = this._pausedSpeechText;
        this._pausedSpeechText = null;
        const scene = this.scenes[this._currentIndex];
        try {
          this._speak(text, () => {
            if (scene && scene.afterAction) {
              this._executeAction(scene.afterAction);
            }
            if (this.autoPlay && this._isPlaying && !this._isPaused) {
              this._scheduleNext();
            }
          });
        } catch (e) {
          console.warn('CastFlow: TTS Error on resume', e);
        }
      } else if (!window.speechSynthesis.speaking) {
        this._pausedSpeechText = null;
        this._scheduleNext();
      }
    }

    togglePlay() {
      if (this._isPlaying) this.pause();
      else this.resume();
    }

    stop() {
      clearTimeout(this._autoTimer);
      this._clearTtsTimers();
      this._speechId++;       // invalidate pending callbacks
      this._transitionId++;   // abort pending transitions
      this._pausedSpeechText = null;
      window.speechSynthesis.cancel();
      this._isPlaying = false;
      this._isPaused = false;
      this._hideAll(() => {
        this._destroy();
        if (this.onComplete) this.onComplete();
      });
    }

    setLang(langCode) {
      this.lang = langCode;
      this._selectedVoice = null; // reset voice when language changes
      if (this._currentIndex >= 0) {
        window.speechSynthesis.cancel();
        this._renderScene(this._currentIndex);
      }
    }

    setSpeed(speed) {
      this.speed = speed;
      const idx = this._speeds.indexOf(speed);
      if (idx !== -1) this._speedIndex = idx;
      this._updateSpeedBtn();
    }

    // ===========================================
    // DOM CONSTRUCTION
    // ===========================================
    _buildDOM() {
      const container = ce('div', 'cf-container' + (this.theme === 'dark' ? ' cf-dark' : ''));
      container.setAttribute('role', 'dialog');
      container.setAttribute('aria-label', 'Guided tour');

      // Overlay (built with DOM API — CSP-safe)
      const overlay = ce('div', 'cf-overlay cf-active');
      const overlaySvg = document.createElementNS(SVG_NS, 'svg');
      const defs = document.createElementNS(SVG_NS, 'defs');
      const mask = document.createElementNS(SVG_NS, 'mask');
      mask.setAttribute('id', 'cf-mask');
      const maskWhite = document.createElementNS(SVG_NS, 'rect');
      maskWhite.setAttribute('x', '0'); maskWhite.setAttribute('y', '0');
      maskWhite.setAttribute('width', '100%'); maskWhite.setAttribute('height', '100%');
      maskWhite.setAttribute('fill', 'white');
      const maskHoleEl = document.createElementNS(SVG_NS, 'rect');
      maskHoleEl.setAttribute('class', 'cf-mask-hole');
      maskHoleEl.setAttribute('x', '0'); maskHoleEl.setAttribute('y', '0');
      maskHoleEl.setAttribute('width', '0'); maskHoleEl.setAttribute('height', '0');
      maskHoleEl.setAttribute('rx', String(this.borderRadius));
      maskHoleEl.setAttribute('fill', 'black');
      mask.appendChild(maskWhite);
      mask.appendChild(maskHoleEl);
      defs.appendChild(mask);
      overlaySvg.appendChild(defs);
      const overlayRect = document.createElementNS(SVG_NS, 'rect');
      overlayRect.setAttribute('x', '0'); overlayRect.setAttribute('y', '0');
      overlayRect.setAttribute('width', '100%'); overlayRect.setAttribute('height', '100%');
      overlayRect.setAttribute('fill', this.overlayColor);
      overlayRect.setAttribute('mask', 'url(#cf-mask)');
      overlaySvg.appendChild(overlayRect);
      overlay.appendChild(overlaySvg);

      // Ring
      const ring = ce('div', 'cf-highlight-ring');

      // Tooltip (built with DOM API — CSP-safe)
      const tooltip = ce('div', 'cf-tooltip');
      const progressBar = ce('div', 'cf-progress-bar');
      const progressFillDiv = ce('div', 'cf-progress-fill');
      progressFillDiv.style.width = '0%';
      progressBar.appendChild(progressFillDiv);
      tooltip.appendChild(progressBar);

      const tooltipBody = ce('div', 'cf-tooltip-body');
      tooltipBody.appendChild(ce('h3', 'cf-tooltip-title'));
      tooltipBody.appendChild(ce('p', 'cf-tooltip-text'));
      tooltip.appendChild(tooltipBody);

      tooltip.appendChild(ce('div', 'cf-step-counter'));

      const tooltipFooter = ce('div', 'cf-tooltip-footer');
      const skipBtn = ce('button', 'cf-btn cf-btn-skip');
      skipBtn.setAttribute('data-cf', 'skip');
      skipBtn.textContent = 'Skip tour';
      tooltipFooter.appendChild(skipBtn);

      const navGroup = ce('div');
      navGroup.style.display = 'flex';
      navGroup.style.gap = '8px';
      const prevBtn = ce('button', 'cf-btn cf-btn-secondary');
      prevBtn.setAttribute('data-cf', 'prev');
      setButtonIcon(prevBtn, 'prev', 'Back', false);
      navGroup.appendChild(prevBtn);
      const nextBtn = ce('button', 'cf-btn cf-btn-primary');
      nextBtn.setAttribute('data-cf', 'next');
      setButtonIcon(nextBtn, 'next', 'Next', true);
      navGroup.appendChild(nextBtn);
      tooltipFooter.appendChild(navGroup);
      tooltip.appendChild(tooltipFooter);

      // Arrow (sibling of tooltip so overflow:hidden on tooltip doesn't clip it)
      const arrow = ce('div', 'cf-tooltip-arrow');

      // Cursor
      const cursor = ce('div', 'cf-cursor');
      cursor.appendChild(svgCursorIcon());

      // Player bar
      const playerBar = ce('div', 'cf-player-bar' + (this._barCollapsed ? ' cf-collapsed' : ''));
      playerBar.appendChild(this._buildPlayerBarDOM());

      container.appendChild(overlay);
      container.appendChild(ring);
      container.appendChild(tooltip);
      container.appendChild(arrow);
      container.appendChild(cursor);
      container.appendChild(playerBar);
      document.body.appendChild(container);

      // Store refs
      this._elements = {
        container,
        overlay,
        ring,
        tooltip,
        cursor,
        playerBar,
        maskHole: qs('.cf-mask-hole', overlay),
        progressFill: qs('.cf-progress-fill', tooltip),
        title: qs('.cf-tooltip-title', tooltip),
        text: qs('.cf-tooltip-text', tooltip),
        counter: qs('.cf-step-counter', tooltip),
        prevBtn: qs('[data-cf="prev"]', tooltip),
        nextBtn: qs('[data-cf="next"]', tooltip),
        skipBtn: qs('[data-cf="skip"]', tooltip),
        arrow,
        playBtn: qs('.cf-play-btn', playerBar),
        prevNavBtn: qs('.cf-nav-btn[data-cf="bar-prev"]', playerBar),
        nextNavBtn: qs('.cf-nav-btn[data-cf="bar-next"]', playerBar),
        closeBtn: qs('.cf-close-btn', playerBar),
        collapseBtn: qs('.cf-collapse-btn', playerBar),
        speedBtn: qs('.cf-speed-btn', playerBar),
        settingsBtn: qs('.cf-settings-btn', playerBar),
        settingsDropdown: qs('.cf-settings-dropdown', playerBar),
        timeline: qs('.cf-timeline', playerBar),
        timelineProgress: qs('.cf-timeline-progress', playerBar),
        timelineMarkers: qs('.cf-timeline-markers', playerBar),
        sceneTitle: qs('.cf-scene-title-bar', playerBar),
        timeText: qs('.cf-time-current', playerBar),
        timeTotalText: qs('.cf-time-total', playerBar),
        miniCounter: qs('.cf-mini-counter', playerBar),
        miniProgressFill: qs('.cf-mini-progress-fill', playerBar),
        dragHandle: qs('.cf-drag-handle', playerBar),
      };

      this._buildTimelineMarkers();
      this._buildSettingsDropdown();
      this._wireEvents();
    }

    _buildPlayerBarDOM() {
      const langInfo = LANG_MAP[this.lang] || { flag: '🌐', label: this.lang };
      const frag = document.createDocumentFragment();

      frag.appendChild(ce('div', 'cf-drag-handle'));

      const playBtn = ce('button', 'cf-play-btn');
      playBtn.title = 'Play / Pause';
      playBtn.appendChild(svgIcon('pause'));
      frag.appendChild(playBtn);

      const miniInfo = ce('div', 'cf-mini-info');
      const miniCounter = ce('span', 'cf-mini-counter');
      miniCounter.textContent = '1/' + this.scenes.length;
      miniInfo.appendChild(miniCounter);
      const miniProg = ce('div', 'cf-mini-progress');
      const miniProgFill = ce('div', 'cf-mini-progress-fill');
      miniProgFill.style.width = '0%';
      miniProg.appendChild(miniProgFill);
      miniInfo.appendChild(miniProg);
      frag.appendChild(miniInfo);

      const expandable = ce('div', 'cf-bar-expandable');

      const barPrevBtn = ce('button', 'cf-nav-btn');
      barPrevBtn.setAttribute('data-cf', 'bar-prev');
      barPrevBtn.title = 'Previous';
      barPrevBtn.appendChild(svgIcon('prev'));
      expandable.appendChild(barPrevBtn);

      const barNextBtn = ce('button', 'cf-nav-btn');
      barNextBtn.setAttribute('data-cf', 'bar-next');
      barNextBtn.title = 'Next';
      barNextBtn.appendChild(svgIcon('next'));
      expandable.appendChild(barNextBtn);

      const tlContainer = ce('div', 'cf-timeline-container');
      const tl = ce('div', 'cf-timeline');
      const tlProgress = ce('div', 'cf-timeline-progress');
      tlProgress.style.width = '0%';
      tl.appendChild(tlProgress);
      tl.appendChild(ce('div', 'cf-timeline-markers'));
      tlContainer.appendChild(tl);

      const tlLabel = ce('div', 'cf-timeline-label');
      const timeCur = ce('span', 'cf-time-text cf-time-current');
      timeCur.textContent = '1/' + this.scenes.length;
      tlLabel.appendChild(timeCur);
      tlLabel.appendChild(ce('span', 'cf-scene-title-bar'));
      const timeTotal = ce('span', 'cf-time-text cf-time-total');
      timeTotal.textContent = this.scenes.length + ' sc.';
      tlLabel.appendChild(timeTotal);
      tlContainer.appendChild(tlLabel);
      expandable.appendChild(tlContainer);

      const speedBtn = ce('button', 'cf-speed-btn');
      speedBtn.title = 'Playback speed';
      speedBtn.textContent = this.speed + 'x';
      expandable.appendChild(speedBtn);

      const settingsWrap = ce('div');
      settingsWrap.style.position = 'relative';
      const settingsBtn = ce('button', 'cf-settings-btn');
      settingsBtn.title = 'Language & Voice';
      settingsBtn.textContent = langInfo.flag;
      settingsWrap.appendChild(settingsBtn);
      settingsWrap.appendChild(ce('div', 'cf-settings-dropdown'));
      expandable.appendChild(settingsWrap);

      frag.appendChild(expandable);

      const collapseBtn = ce('button', 'cf-collapse-btn');
      collapseBtn.title = 'Collapse';
      collapseBtn.appendChild(svgIcon('chevronDown'));
      frag.appendChild(collapseBtn);

      const closeBtn = ce('button', 'cf-close-btn');
      closeBtn.title = 'Close tour';
      closeBtn.appendChild(svgIcon('close'));
      frag.appendChild(closeBtn);

      return frag;
    }

    _wireEvents() {
      const el = this._elements;
      el.prevBtn.addEventListener('click', () => this.prev());
      el.nextBtn.addEventListener('click', () => this.next());
      el.skipBtn.addEventListener('click', () => this.stop());
      el.playBtn.addEventListener('click', () => this.togglePlay());
      el.prevNavBtn.addEventListener('click', () => this.prev());
      el.nextNavBtn.addEventListener('click', () => this.next());
      el.closeBtn.addEventListener('click', () => this.stop());
      el.speedBtn.addEventListener('click', () => this._cycleSpeed());
      el.settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleSettingsDropdown();
      });
      el.timeline.addEventListener('click', (e) => this._onTimelineClick(e));
      el.collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleCollapse();
      });

      // Click on collapsed bar expands it
      el.playerBar.addEventListener('click', (e) => {
        if (this._barCollapsed && e.target === el.playerBar) {
          this._toggleCollapse();
        }
      });

      // Drag on the handle
      el.dragHandle.addEventListener('mousedown', (e) => this._handleDragStart(e));
      el.dragHandle.addEventListener('touchstart', (e) => this._handleDragStart(e), { passive: false });

      // Close dropdown if clicking elsewhere
      document.addEventListener('click', (e) => {
        if (el.settingsDropdown && !el.settingsDropdown.contains(e.target) && e.target !== el.settingsBtn) {
          this._toggleSettingsDropdown(false);
        }
      });
    }

    _buildTimelineMarkers() {
      const container = this._elements.timelineMarkers;
      if (!container) return;
      container.innerHTML = '';
      this.scenes.forEach((_, i) => {
        const marker = ce('div', 'cf-timeline-marker');
        marker.style.left = ((i / Math.max(this.scenes.length - 1, 1)) * 100) + '%';
        container.appendChild(marker);
      });
    }

    _buildSettingsDropdown() {
      const dropdown = this._elements.settingsDropdown;
      if (!dropdown) return;
      dropdown.innerHTML = '';

      // Language section
      const langTitle = ce('div', 'cf-settings-section-title');
      langTitle.textContent = 'Language';
      dropdown.appendChild(langTitle);

      this.availableLangs.forEach(code => {
        const info = LANG_MAP[code] || { flag: '🌐', label: code };
        const btn = ce('button', 'cf-settings-option cf-lang-option' + (code === this.lang ? ' cf-active' : ''));
        btn.dataset.lang = code;
        const flagSpan = ce('span', 'cf-settings-flag');
        flagSpan.textContent = info.flag;
        btn.appendChild(flagSpan);
        const labelSpan = ce('span');
        labelSpan.textContent = info.label;
        btn.appendChild(labelSpan);
        btn.addEventListener('click', () => {
          this.setLang(code);
          this._toggleSettingsDropdown(false);
          const newInfo = LANG_MAP[code] || { flag: '🌐' };
          this._elements.settingsBtn.textContent = newInfo.flag;
          qsa('.cf-lang-option', dropdown).forEach(o => o.classList.remove('cf-active'));
          btn.classList.add('cf-active');
          // Rebuild voice section for new language
          this._rebuildVoiceSection();
        });
        dropdown.appendChild(btn);
      });

      // Divider
      dropdown.appendChild(ce('div', 'cf-settings-divider'));

      // Voice section
      const voiceContainer = ce('div', 'cf-voice-section');
      dropdown.appendChild(voiceContainer);
      this._elements.voiceSection = voiceContainer;
      this._rebuildVoiceSection();
    }

    _rebuildVoiceSection() {
      const section = this._elements.voiceSection;
      if (!section) return;
      section.innerHTML = '';

      const voiceTitle = ce('div', 'cf-settings-section-title');
      voiceTitle.textContent = 'Voice';
      section.appendChild(voiceTitle);

      const voices = window.speechSynthesis.getVoices();
      const langPrefix = this.lang.split('-')[0];

      // Filter voices matching language
      const matching = voices.filter(v => v.lang === this.lang || v.lang.startsWith(langPrefix));
      const displayVoices = matching.length > 0 ? matching : voices.slice(0, 8);

      if (displayVoices.length === 0) {
        const noVoice = ce('div', 'cf-settings-option');
        noVoice.style.color = 'rgba(255,255,255,0.35)';
        noVoice.textContent = 'No voices available';
        section.appendChild(noVoice);
        return;
      }

      displayVoices.forEach(voice => {
        const isActive = this._selectedVoice
          ? voice.name === this._selectedVoice.name
          : false;
        const btn = ce('button', 'cf-settings-option cf-voice-option' + (isActive ? ' cf-active' : ''));
        const micSpan = ce('span', 'cf-settings-flag');
        micSpan.textContent = '🎙️';
        btn.appendChild(micSpan);
        const nameSpan = ce('span', 'cf-settings-voice-name');
        nameSpan.textContent = voice.name;
        btn.appendChild(nameSpan);
        btn.addEventListener('click', () => {
          this._selectedVoice = voice;
          qsa('.cf-voice-option', section).forEach(o => o.classList.remove('cf-active'));
          btn.classList.add('cf-active');
          this._toggleSettingsDropdown(false);
        });
        section.appendChild(btn);
      });
    }

    // ===========================================
    // EVENTS
    // ===========================================
    _bindEvents() {
      window.addEventListener('resize', this._onResize);
      document.addEventListener('keydown', this._onKeydown);
    }

    _unbindEvents() {
      window.removeEventListener('resize', this._onResize);
      document.removeEventListener('keydown', this._onKeydown);
      document.removeEventListener('mousemove', this._onDragMove);
      document.removeEventListener('mouseup', this._onDragEnd);
      document.removeEventListener('touchmove', this._onDragMove);
      document.removeEventListener('touchend', this._onDragEnd);
    }

    _handleResize() {
      if (this._currentIndex >= 0) {
        this._positionElements(this._currentIndex, false);
      }
    }

    _handleKeydown(e) {
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); this.next(); break;
        case 'ArrowLeft': e.preventDefault(); this.prev(); break;
        case ' ': e.preventDefault(); this.togglePlay(); break;
        case 'Escape': this.stop(); break;
      }
    }

    // ===========================================
    // DRAG
    // ===========================================
    _handleDragStart(e) {
      e.preventDefault();
      const bar = this._elements.playerBar;
      const rect = bar.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      this._drag = {
        active: true,
        startX: clientX,
        startY: clientY,
        barStartLeft: rect.left,
        barStartTop: rect.top,
      };

      bar.classList.add('cf-dragging');
      // Switch to top/left positioning for free movement
      bar.style.left = rect.left + 'px';
      bar.style.top = rect.top + 'px';
      bar.style.bottom = 'auto';
      bar.style.transform = 'none';

      document.addEventListener('mousemove', this._onDragMove);
      document.addEventListener('mouseup', this._onDragEnd);
      document.addEventListener('touchmove', this._onDragMove, { passive: false });
      document.addEventListener('touchend', this._onDragEnd);
    }

    _handleDragMove(e) {
      if (!this._drag.active) return;
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - this._drag.startX;
      const dy = clientY - this._drag.startY;
      const bar = this._elements.playerBar;
      const barW = bar.offsetWidth;
      const barH = bar.offsetHeight;

      const newLeft = clamp(this._drag.barStartLeft + dx, 0, window.innerWidth - barW);
      const newTop = clamp(this._drag.barStartTop + dy, 0, window.innerHeight - barH);

      bar.style.left = newLeft + 'px';
      bar.style.top = newTop + 'px';
    }

    _handleDragEnd() {
      if (!this._drag.active) return;
      this._drag.active = false;
      this._elements.playerBar.classList.remove('cf-dragging');
      document.removeEventListener('mousemove', this._onDragMove);
      document.removeEventListener('mouseup', this._onDragEnd);
      document.removeEventListener('touchmove', this._onDragMove);
      document.removeEventListener('touchend', this._onDragEnd);
    }

    // ===========================================
    // COLLAPSE
    // ===========================================
    _toggleCollapse() {
      this._barCollapsed = !this._barCollapsed;
      const bar = this._elements.playerBar;
      if (this._barCollapsed) {
        bar.classList.add('cf-collapsed');
        // Keep current position — just ensure it's within viewport bounds
        this._clampBarToViewport();
      } else {
        bar.classList.remove('cf-collapsed');
        // Keep current position when expanding too
        this._clampBarToViewport();
      }
    }

    _clampBarToViewport() {
      const bar = this._elements.playerBar;
      const rect = bar.getBoundingClientRect();
      // Switch to top/left positioning if still using bottom/transform
      if (bar.style.bottom && bar.style.bottom !== 'auto') {
        bar.style.left = rect.left + 'px';
        bar.style.top = rect.top + 'px';
        bar.style.bottom = 'auto';
        bar.style.transform = 'none';
      }
      // After a frame (let CSS width transition apply), clamp within bounds
      requestAnimationFrame(() => {
        const r = bar.getBoundingClientRect();
        const maxLeft = window.innerWidth - r.width;
        const maxTop = window.innerHeight - r.height;
        bar.style.left = clamp(r.left, 0, Math.max(0, maxLeft)) + 'px';
        bar.style.top = clamp(r.top, 0, Math.max(0, maxTop)) + 'px';
      });
    }

    // ===========================================
    // SCENE NAVIGATION
    // ===========================================
    _goToScene(index) {
      clearTimeout(this._autoTimer);
      if (this._animFrame) { cancelAnimationFrame(this._animFrame); this._animFrame = null; }
      this._speechId++;           // invalidate any pending onend
      this._pausedSpeechText = null;
      window.speechSynthesis.cancel();

      const prevIndex = this._currentIndex;
      this._currentIndex = index;
      this._isPlaying = !this._isPaused;
      this._updatePlayBtn();

      if (this.onSceneChange) {
        this.onSceneChange(index, this.scenes[index]);
      }

      this._transitionToScene(index, prevIndex);
    }

    async _transitionToScene(index, prevIndex) {
      const myTransition = ++this._transitionId;
      const scene = this.scenes[index];
      let el = null;
      try { el = scene.element ? document.querySelector(scene.element) : null; } catch (e) { /* invalid selector */ }

      // 1) Hide tooltip
      this._elements.tooltip.classList.remove('cf-visible');

      // 2) Execute pre-action (e.g. click to open modal) BEFORE positioning
      if (scene.action) {
        await this._executeAction(scene.action);
        await this._wait(400); // let DOM settle
        if (this._transitionId !== myTransition) return; // abort if superseded
      }

      // Resolve target element (may have changed after action)
      const targetEl = scene.actionTarget
        ? document.querySelector(scene.actionTarget)
        : el;

      // 3) Scroll into view
      const scrollTarget = targetEl || el;
      if (scrollTarget) {
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        await this._wait(300);
        if (this._transitionId !== myTransition) return;
      }

      // 4) Animate cursor
      if (this.showCursor && scrollTarget && scene.cursorTarget !== false) {
        const cursorTarget = scene.cursorTarget
          ? document.querySelector(scene.cursorTarget)
          : scrollTarget;
        if (cursorTarget) {
          await this._animateCursor(cursorTarget, scene.cursorDuration || 800);
          if (this._transitionId !== myTransition) return;
          if (scene.cursorClick !== false) {
            this._showCursorClick();
          }
          await this._wait(200);
          if (this._transitionId !== myTransition) return;
        }
      }

      // 5) Position spotlight & tooltip
      this._positionElements(index, true);

      // 6) Show tooltip
      await this._wait(100);
      if (this._transitionId !== myTransition) return;
      this._elements.tooltip.classList.add('cf-visible');
      this._elements.ring.classList.add('cf-visible');

      // 7) Update player bar
      this._updatePlayerBar(index);

      // 8) Speak
      this._renderScene(index);
    }

    // ===========================================
    // ACTIONS (real clicks, modals, callbacks)
    // ===========================================
    async _executeAction(action) {
      if (typeof action === 'function') {
        await action();
        return;
      }
      if (typeof action === 'object') {
        // { type: 'click', selector: '#see-roles' }
        if (action.type === 'click' && action.selector) {
          const target = document.querySelector(action.selector);
          if (target) {
            // Skip click if target is already expanded (toggle menus)
            const expanded = target.getAttribute('aria-expanded');
            if (expanded === 'true') return; // already open — don't toggle closed

            // Also check if the controlled element is already visible
            const controlsId = target.getAttribute('aria-controls')
              || target.dataset.bsTarget?.replace('#', '')
              || target.getAttribute('href')?.replace('#', '');
            if (controlsId) {
              const controlled = document.getElementById(controlsId);
              if (controlled) {
                const style = getComputedStyle(controlled);
                if (style.display !== 'none' && style.visibility !== 'hidden') return; // already visible
              }
            }

            // Check sibling dropdown-menu visibility
            const siblingMenu = target.nextElementSibling;
            if (siblingMenu && siblingMenu.classList.contains('dropdown-menu')) {
              const style = getComputedStyle(siblingMenu);
              if (style.display !== 'none' && style.visibility !== 'hidden') return; // already open
            }

            target.click();
          }
        }
        // { type: 'show', selector: '#my-modal', style: 'flex' }
        if (action.type === 'show' && action.selector) {
          const target = document.querySelector(action.selector);
          if (target) {
            target.style.display = action.style || 'flex';
          }
        }
        // { type: 'hide', selector: '#my-modal' }
        if (action.type === 'hide' && action.selector) {
          const target = document.querySelector(action.selector);
          if (target) {
            target.style.display = 'none';
          }
        }
      }
    }

    _renderScene(index) {
      const scene = this.scenes[index];

      const title = this._getLocalized(scene, 'title');
      const text = this._getLocalized(scene, 'text');
      const speech = this._getLocalized(scene, 'speech') || text;

      this._elements.title.textContent = title;
      this._elements.text.textContent = text;
      this._elements.counter.textContent = `Step ${index + 1} of ${this.scenes.length}`;

      const pct = ((index + 1) / this.scenes.length) * 100;
      this._elements.progressFill.style.width = pct + '%';

      this._elements.prevBtn.style.display = index === 0 ? 'none' : '';
      if (index === this.scenes.length - 1) {
        this._elements.nextBtn.textContent = 'Finish ✓';
      } else {
        setButtonIcon(this._elements.nextBtn, 'next', 'Next', true);
      }

      if (this.ttsEnabled && speech) {
        this._speak(speech, () => {
          // Execute post-action (e.g. close modal) after speech
          if (scene.afterAction) {
            this._executeAction(scene.afterAction);
          }
          if (this.autoPlay && this._isPlaying && !this._isPaused) {
            this._scheduleNext();
          }
        });
      } else {
        if (this.autoPlay && this._isPlaying) {
          this._scheduleNext(scene.duration || 3000);
        }
      }
    }

    _scheduleNext(delayMs) {
      clearTimeout(this._autoTimer);
      const baseDelay = delayMs || this.sceneDelay;
      const delay = baseDelay / this.speed;
      this._autoTimer = setTimeout(() => {
        if (this._isPlaying && !this._isPaused) {
          this.next();
        }
      }, delay);
    }

    // ===========================================
    // POSITIONING (with edge-safe tooltip)
    // ===========================================
    _positionElements(index, animate) {
      const scene = this.scenes[index];
      const elSelector = scene.actionTarget || scene.element;
      let el = null;
      try { el = elSelector ? document.querySelector(elSelector) : null; } catch (e) { /* invalid selector */ }

      const maskHole = this._elements.maskHole;
      const ring = this._elements.ring;

      if (el) {
        const rect = getRect(el);
        const pad = scene.padding != null ? scene.padding : this.padding;
        const holeX = rect.left - pad;
        const holeY = rect.top - pad;
        const holeW = rect.width + pad * 2;
        const holeH = rect.height + pad * 2;

        if (maskHole) {
          maskHole.style.transition = animate
            ? 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'none';
          maskHole.setAttribute('x', holeX);
          maskHole.setAttribute('y', holeY);
          maskHole.setAttribute('width', holeW);
          maskHole.setAttribute('height', holeH);
        }

        if (ring) {
          Object.assign(ring.style, {
            top: holeY + 'px',
            left: holeX + 'px',
            width: holeW + 'px',
            height: holeH + 'px',
            borderRadius: this.borderRadius + 'px',
          });
        }

        this._positionTooltip(rect, pad, scene.tooltipPosition);
      } else {
        this._centerTooltip();
        if (ring) ring.classList.remove('cf-visible');
        if (maskHole) {
          maskHole.setAttribute('width', 0);
          maskHole.setAttribute('height', 0);
        }
      }
    }

    _positionTooltip(targetRect, padding, preferredPos) {
      const tooltip = this._elements.tooltip;
      const arrow = this._elements.arrow;
      const gap = 16;
      const edgeMargin = 12;

      // Reset all positioning
      tooltip.style.top = '';
      tooltip.style.left = '';
      tooltip.style.right = '';
      tooltip.style.bottom = '';
      tooltip.style.transform = '';
      arrow.style.top = '';
      arrow.style.left = '';
      arrow.style.bottom = '';
      arrow.style.right = '';
      arrow.style.display = '';

      // Measure tooltip
      tooltip.style.visibility = 'hidden';
      tooltip.style.display = 'block';
      tooltip.style.opacity = '0';
      const tRect = tooltip.getBoundingClientRect();
      tooltip.style.visibility = '';
      tooltip.style.opacity = '';

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const playerBarH = 80; // reserve space for player bar

      // Try all 4 positions in order of preference
      const positions = preferredPos ? [preferredPos, 'bottom', 'top', 'right', 'left'] : ['bottom', 'top', 'right', 'left'];
      let chosen = null;

      for (const pos of positions) {
        if (chosen) break;
        switch (pos) {
          case 'bottom':
            if (targetRect.bottom + padding + gap + tRect.height + playerBarH < vh) chosen = 'bottom';
            break;
          case 'top':
            if (targetRect.top - padding - gap - tRect.height > edgeMargin) chosen = 'top';
            break;
          case 'right':
            if (targetRect.right + padding + gap + tRect.width < vw - edgeMargin) chosen = 'right';
            break;
          case 'left':
            if (targetRect.left - padding - gap - tRect.width > edgeMargin) chosen = 'left';
            break;
        }
      }

      // Fallback: pick the position with most available space
      if (!chosen) {
        const spaces = {
          bottom: vh - targetRect.bottom - padding - gap - playerBarH,
          top: targetRect.top - padding - gap,
          right: vw - targetRect.right - padding - gap,
          left: targetRect.left - padding - gap,
        };
        chosen = Object.entries(spaces).sort((a, b) => b[1] - a[1])[0][0];
      }

      const cx = targetRect.left + targetRect.width / 2;
      const cy = targetRect.top + targetRect.height / 2;

      let tooltipLeft, tooltipTop;

      switch (chosen) {
        case 'bottom':
          tooltipTop = targetRect.bottom + padding + gap;
          tooltipLeft = clamp(cx - tRect.width / 2, edgeMargin, vw - tRect.width - edgeMargin);
          arrow.style.top = (tooltipTop - 7) + 'px';
          arrow.style.left = (tooltipLeft + clamp(cx - tooltipLeft - 8, 16, tRect.width - 32)) + 'px';
          break;
        case 'top':
          tooltipTop = targetRect.top - padding - gap - tRect.height;
          tooltipLeft = clamp(cx - tRect.width / 2, edgeMargin, vw - tRect.width - edgeMargin);
          arrow.style.top = (tooltipTop + tRect.height - 9) + 'px';
          arrow.style.left = (tooltipLeft + clamp(cx - tooltipLeft - 8, 16, tRect.width - 32)) + 'px';
          break;
        case 'right':
          tooltipLeft = targetRect.right + padding + gap;
          tooltipTop = clamp(cy - tRect.height / 2, edgeMargin, vh - tRect.height - edgeMargin - playerBarH);
          arrow.style.left = (tooltipLeft - 7) + 'px';
          arrow.style.top = (tooltipTop + clamp(cy - tooltipTop - 8, 16, tRect.height - 32)) + 'px';
          break;
        case 'left':
          tooltipLeft = targetRect.left - padding - gap - tRect.width;
          tooltipTop = clamp(cy - tRect.height / 2, edgeMargin, vh - tRect.height - edgeMargin - playerBarH);
          arrow.style.left = (tooltipLeft + tRect.width - 9) + 'px';
          arrow.style.top = (tooltipTop + clamp(cy - tooltipTop - 8, 16, tRect.height - 32)) + 'px';
          break;
      }

      // Final safety clamp
      tooltipLeft = clamp(tooltipLeft, edgeMargin, vw - tRect.width - edgeMargin);
      tooltipTop = clamp(tooltipTop, edgeMargin, vh - tRect.height - edgeMargin - playerBarH);

      tooltip.style.top = tooltipTop + 'px';
      tooltip.style.left = tooltipLeft + 'px';
    }

    _centerTooltip() {
      const tooltip = this._elements.tooltip;
      const arrow = this._elements.arrow;
      tooltip.style.top = '50%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translate(-50%, -50%) scale(1)';
      arrow.style.display = 'none';
    }

    // ===========================================
    // FAKE CURSOR
    // ===========================================
    async _animateCursor(targetEl, duration) {
      if (this._animFrame) { cancelAnimationFrame(this._animFrame); this._animFrame = null; }
      const cursor = this._elements.cursor;
      cursor.classList.add('cf-visible');

      const targetRect = getRect(targetEl);
      const targetX = targetRect.left + targetRect.width / 2 - 4;
      const targetY = targetRect.top + targetRect.height / 2 - 4;

      const startX = this._cursorPos.x;
      const startY = this._cursorPos.y;

      const effectiveStartX = startX < 0 ? targetX + 200 : startX;
      const effectiveStartY = startY < 0 ? targetY - 100 : startY;

      const adjustedDuration = duration / this.speed;

      return new Promise(resolve => {
        const startTime = performance.now();
        const animate = (time) => {
          const elapsed = time - startTime;
          const t = Math.min(elapsed / adjustedDuration, 1);
          const easedT = easeInOutCubic(t);

          const x = lerp(effectiveStartX, targetX, easedT);
          const y = lerp(effectiveStartY, targetY, easedT);

          cursor.style.transform = `translate(${x}px, ${y}px)`;
          this._cursorPos = { x, y };

          if (t < 1) {
            this._animFrame = requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        this._animFrame = requestAnimationFrame(animate);
      });
    }

    _showCursorClick() {
      const ripple = ce('div', 'cf-cursor-ripple');
      ripple.style.left = (this._cursorPos.x + 4) + 'px';
      ripple.style.top = (this._cursorPos.y + 4) + 'px';
      this._elements.container.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }

    _hideCursor() {
      this._elements.cursor.classList.remove('cf-visible');
    }

    // ===========================================
    // TEXT TO SPEECH
    // ===========================================
    _loadVoices() {
      return new Promise(resolve => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          this._watchVoiceChanges();
          resolve();
          return;
        }
        const handler = () => {
          this._watchVoiceChanges();
          resolve();
        };
        window.speechSynthesis.onvoiceschanged = handler;
        setTimeout(() => { this._watchVoiceChanges(); resolve(); }, 1000);
      });
    }

    /**
     * Keep listening for late-loading voices (Chrome loads Online/Natural
     * voices asynchronously after the initial batch).
     */
    _watchVoiceChanges() {
      if (this._voiceWatcherBound) return;
      this._voiceWatcherBound = true;
      this._onVoicesChanged = () => {
        if (this._destroyed) return;
        this._rebuildVoiceSection();
      };
      window.speechSynthesis.onvoiceschanged = this._onVoicesChanged;
    }

    _getVoice() {
      // If user selected a specific voice via dropdown, use it
      if (this._selectedVoice) return this._selectedVoice;

      const voices = window.speechSynthesis.getVoices();

      // Check defaultVoices config for current language
      const preferredName = this.defaultVoices[this.lang];
      if (preferredName) {
        const preferred = voices.find(v => v.name === preferredName);
        if (preferred) return preferred;
      }

      let voice = voices.find(v => v.lang === this.lang);
      if (!voice) {
        const prefix = this.lang.split('-')[0];
        voice = voices.find(v => v.lang.startsWith(prefix));
      }
      return voice || voices[0];
    }

    _speak(text, onEnd) {
      window.speechSynthesis.cancel();
      this._clearTtsTimers();

      const mySpeechId = ++this._speechId;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this._getVoice();
      utterance.lang = this.lang;
      utterance.rate = clamp(this.speed * 0.9, 0.5, 2);
      utterance.pitch = 1.05;
      utterance.volume = 1;

      const finish = () => {
        this._clearTtsTimers();
        this._speechUtterance = null;
        if (this._speechId !== mySpeechId) return;
        if (onEnd) onEnd();
      };

      utterance.onend = finish;

      utterance.onerror = (e) => {
        this._clearTtsTimers();
        this._speechUtterance = null;
        // 'interrupted' fires when cancel() is called — ignore stale
        if (this._speechId !== mySpeechId) return;
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        if (onEnd) onEnd();
      };

      this._speechUtterance = utterance;
      window.speechSynthesis.speak(utterance);

      // Chrome kills long utterances after ~15s of continuous speech.
      // Workaround: periodically pause/resume to reset the internal timer.
      this._ttsKeepAlive = setInterval(() => {
        if (this._speechId !== mySpeechId) { this._clearTtsTimers(); return; }
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

      // Watchdog: if speech silently dies (not speaking, no onend fired), force advance.
      this._ttsWatchdog = setInterval(() => {
        if (this._speechId !== mySpeechId) { this._clearTtsTimers(); return; }
        if (!window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          finish();
        }
      }, 2000);
    }

    _clearTtsTimers() {
      clearInterval(this._ttsKeepAlive);
      clearInterval(this._ttsWatchdog);
      this._ttsKeepAlive = null;
      this._ttsWatchdog = null;
    }

    // ===========================================
    // i18n
    // ===========================================
    _getLocalized(scene, field) {
      if (scene.i18n && scene.i18n[this.lang]) {
        return scene.i18n[this.lang][field] || '';
      }
      return scene[field] || '';
    }

    // ===========================================
    // PLAYER BAR
    // ===========================================
    _showPlayerBar() {
      const bar = this._elements.playerBar;
      // Reset to default centered position
      bar.style.left = '50%';
      bar.style.top = '';
      bar.style.bottom = '12px';
      bar.style.transform = 'translateX(-50%) translateY(calc(100% + 20px))';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.transform = 'translateX(-50%)';
          bar.classList.add('cf-visible');
        });
      });
    }

    _updatePlayerBar(index) {
      const pct = ((index) / Math.max(this.scenes.length - 1, 1)) * 100;
      this._elements.timelineProgress.style.width = pct + '%';
      this._elements.timeText.textContent = `${index + 1}/${this.scenes.length}`;

      const title = this._getLocalized(this.scenes[index], 'title');
      this._elements.sceneTitle.textContent = title;

      // Mini bar info
      if (this._elements.miniCounter) {
        this._elements.miniCounter.textContent = `${index + 1}/${this.scenes.length}`;
      }
      if (this._elements.miniProgressFill) {
        this._elements.miniProgressFill.style.width = pct + '%';
      }
    }

    _updatePlayBtn() {
      if (this._elements.playBtn) {
        this._elements.playBtn.textContent = '';
        this._elements.playBtn.appendChild(svgIcon(this._isPlaying ? 'pause' : 'play'));
      }
    }

    _updateSpeedBtn() {
      if (this._elements.speedBtn) {
        this._elements.speedBtn.textContent = this.speed + 'x';
      }
    }

    _cycleSpeed() {
      this._speedIndex = (this._speedIndex + 1) % this._speeds.length;
      this.speed = this._speeds[this._speedIndex];
      this._updateSpeedBtn();
    }

    _toggleSettingsDropdown(forceState) {
      const dd = this._elements.settingsDropdown;
      if (forceState === false) {
        dd.classList.remove('cf-visible');
      } else {
        dd.classList.toggle('cf-visible');
        // Rebuild voice options when opening
        if (dd.classList.contains('cf-visible')) {
          this._rebuildVoiceSection();
        }
      }
    }

    _onTimelineClick(e) {
      const rect = this._elements.timeline.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      const index = Math.round(pct * (this.scenes.length - 1));
      this.goTo(clamp(index, 0, this.scenes.length - 1));
    }

    // ===========================================
    // CLEANUP
    // ===========================================
    _hideAll(callback) {
      this._elements.tooltip.classList.remove('cf-visible');
      this._elements.ring.classList.remove('cf-visible');
      this._hideCursor();
      this._elements.playerBar.classList.remove('cf-visible');
      this._elements.overlay.style.opacity = '0';
      setTimeout(() => { if (callback) callback(); }, 500);
    }

    _destroy() {
      this._unbindEvents();
      cancelAnimationFrame(this._animFrame);
      clearTimeout(this._autoTimer);
      window.speechSynthesis.cancel();
      // Stop watching for voice changes
      if (this._voiceWatcherBound) {
        window.speechSynthesis.onvoiceschanged = null;
        this._voiceWatcherBound = false;
      }
      if (this._elements.container && this._elements.container.parentNode) {
        this._elements.container.parentNode.removeChild(this._elements.container);
      }
      this._destroyed = true;
    }

    _wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms / this.speed));
    }
  }

  return CastFlow;
}));
