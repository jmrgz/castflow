# CastFlow.js

A video-like guided tour library with Text-to-Speech narration, fake cursor animation, and elegant spotlight highlighting. Designed as a **video tutorial** that plays automatically with voice narration.

## Features

- **Text-to-Speech** with language + voice selection in a settings panel
- **Video-like Player Bar** — draggable, collapsible (mini mode), with play/pause, timeline scrubber, speed control
- **Fake Cursor** — animated cursor that moves to each element with click ripple
- **SVG Spotlight Overlay** — mask-based cutout with pulsating highlight ring
- **Smart Tooltip** — auto-positions to avoid viewport clipping (edge-safe)
- **Scene Actions** — perform real clicks, open/close modals, run custom callbacks
- **Multi-language i18n** per scene with language switcher
- **Keyboard Controls** — Arrow keys, Space (play/pause), Escape (close)
- **Auto-play** — advances through scenes after speech ends
- **Speed Control** — 0.5x to 2x
- **Zero Dependencies** — pure vanilla JS

## Quick Start

```html
<link rel="stylesheet" href="castflow/castflow.css" />
<script src="castflow/castflow.js"></script>

<script>
  const tour = new CastFlow({
    lang: 'en-US',
    autoPlay: true,
    scenes: [
      {
        title: 'Welcome',
        text: 'Let me show you around.',
        speech: 'Welcome! Let me show you how this works.'
      },
      {
        element: '#my-button',
        title: 'Click here',
        text: 'This performs an action.',
        action: { type: 'click', selector: '#my-button' },
        cursorClick: true
      },
      {
        element: '#open-modal-btn',
        title: 'Open Modal',
        text: 'This opens the settings panel.',
        action: { type: 'click', selector: '#open-modal-btn' },
        actionTarget: '#modal .modal-content',
        afterAction: { type: 'hide', selector: '#modal' }
      }
    ]
  });

  tour.start();
</script>
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scenes` | Array | `[]` | Array of scene objects |
| `lang` | String | `'en-US'` | Default TTS language |
| `autoPlay` | Boolean | `true` | Auto-advance after speech |
| `speed` | Number | `1` | Playback speed (0.5–2) |
| `showCursor` | Boolean | `true` | Show fake cursor |
| `ttsEnabled` | Boolean | `true` | Enable text-to-speech |
| `theme` | String | `'light'` | `'light'` or `'dark'` |
| `overlayColor` | String | `'rgba(0,0,0,0.55)'` | Overlay color |
| `padding` | Number | `12` | Padding around target |
| `sceneDelay` | Number | `800` | Delay between scenes (ms) |
| `startCollapsed` | Boolean | `true` | Player bar starts minimized |
| `availableLangs` | Array | All | Language codes for switcher |
| `onComplete` | Function | `null` | Fired when tour finishes |
| `onSceneChange` | Function | `null` | Fired on scene change |

## Scene Object

| Property | Type | Description |
|----------|------|-------------|
| `element` | String | CSS selector for the target element |
| `title` | String | Tooltip title |
| `text` | String | Tooltip body |
| `speech` | String | TTS text (fallback: `text`) |
| `tooltipPosition` | String | `'top'`, `'bottom'`, `'left'`, `'right'` |
| `cursorTarget` | String | CSS selector for cursor destination |
| `cursorClick` | Boolean | Show click ripple |
| `cursorDuration` | Number | Cursor travel time (ms) |
| `padding` | Number | Override padding |
| `duration` | Number | Duration if no speech (ms) |
| `action` | Object/Function | Pre-action before scene shows |
| `actionTarget` | String | CSS selector to highlight after action |
| `afterAction` | Object/Function | Post-action after speech ends |
| `i18n` | Object | Localized content per language |

## Actions

Actions let you interact with the page during the tour:

```js
// Click a button
action: { type: 'click', selector: '#my-btn' }

// Show a modal
action: { type: 'show', selector: '#my-modal', style: 'flex' }

// Hide an element
action: { type: 'hide', selector: '#my-modal' }

// Custom function
action: async () => { await doSomething(); }
```

Use `afterAction` to clean up (e.g., close a modal after narration finishes).

## API

```js
tour.start()       // Start
tour.next()        // Next scene
tour.prev()        // Previous scene
tour.goTo(index)   // Jump to scene
tour.pause()       // Pause
tour.resume()      // Resume
tour.togglePlay()  // Toggle
tour.stop()        // End tour
tour.setLang(code) // Change language
tour.setSpeed(n)   // Change speed
```

## License

MIT
