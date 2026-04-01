# CastFlow — Guided Tours Anywhere 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-F7DF1E?logo=javascript&logoColor=000)](castflow/castflow.js)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=fff)](castflow-extension/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen)]()

CastFlow is an open-source, zero-dependency vanilla JS library and Chrome extension that turns any website into an interactive guided tour with voice narration (TTS), an animated cursor, and elegant spotlight highlighting.

It is built around a single philosophy: **Guided tours should feel like someone is live-teaching you how to use a product, with real interactions, not just static text tooltips.**

## 🌟 The Project Structure

This repository is a monorepo containing three main components:

- 📦 `/castflow` - The core vanilla JavaScript library (`castflow.js` & `castflow.css`). Less than 15KB gzipped.
- 🧩 `/castflow-extension` - The Chrome Extension allowing you to run and generate tours on *any* 3rd party website without needing code access.
- 🌐 `/landing` - The official landing page showcasing features and use cases.

---

## 📦 1. The CastFlow Library (Core)

Embed CastFlow directly into your own web applications to train and onboard your users. 

### Why CastFlow?

1. **Always up-to-date:** Unlike pre-recorded video tutorials, CastFlow tours play over your live UI. If your UI changes slightly, the tour adapts.
2. **Text-to-Speech (TTS):** Natural voice narration in 8+ languages using the browser's native capabilities. Users *listen* instead of reading walls of text.
3. **Interactive:** It clicks buttons, opens modals, and triggers events just like a real user.
4. **Zero Dependencies:** No React, Vue, jQuery, or other heavy dependencies. Just pure, fast vanilla JS.

### Quick Start (Library)

```html
<!-- 1. Include the styles and script -->
<link rel="stylesheet" href="castflow/castflow.css" />
<script src="castflow/castflow.js"></script>

<script>
  // 2. Define your scenes and start the tour!
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
        element: '#submit-btn',
        title: 'Submit button',
        text: 'Click here to save your settings.',
        action: { type: 'click', selector: '#submit-btn' },
        cursorClick: true
      }
    ]
  });

  tour.start();
</script>
```

For full library documentation, see the [Library README](./castflow/README.md).

---

## 🧩 2. The Chrome Extension + AI Builder

Want to create an onboarding tour for a website you don't own (like Azure, AWS, SAP, or Salesforce) to train your employees or clients? The **CastFlow Chrome Extension** is built exactly for this.

Not only does it inject the CastFlow engine into any page, but it also features a powerful **AI-powered Tour Builder**.

### AI Tour Generation (BYOK - Bring Your Own Key)

Writing JSON arrays by hand is for developers. With the extension, you can generate full interactive tours instantly using AI. The AI analyzes the page's visible elements and builds a logical step-by-step onboarding experience.

1. Install the extension.
2. Open the extension popup and click the ⚙ (Settings) icon.
3. Choose your preferred AI provider and enter your API Key:
   - **OpenAI** (`gpt-4o-mini`, etc.)
   - **Azure OpenAI**
   - **Google Gemini** (`gemini-2.0-flash`)
   - **Groq** (`llama-3.3-70b-versatile`)
   - **Mistral**
   - **Ollama / LM Studio** (Free, local AI generation!)
   - *Any OpenAI-compatible API endpoint.*
4. Click "✨ Generate Tour with AI" on any webpage and watch the magic happen.

*CastFlow does not collect your API keys. They are stored locally in your browser leveraging the BYOK (Bring Your Own Key) model.*

### Loading Existing Tours

You can easily export your generated tours as `.json` files and share them with your team. They can use the `Import tour JSON` feature in the extension to load and play them on the target websites.

---

## 🔧 Installation

### Library (embed in your own site)

Download `castflow.js` and `castflow.css` from the [`/castflow`](./castflow/) folder, then include them in your HTML:

```html
<link rel="stylesheet" href="castflow.css" />
<script src="castflow.js"></script>
```

### Chrome Extension (developer mode)

1. Clone this repository: `git clone https://github.com/jmrgz/castflow.git`
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the `castflow-extension/` folder
5. The CastFlow icon will appear in your toolbar — you're ready to go!

### Landing Page (local preview)

Open `landing/index.html` directly in your browser — no build step or server required.

---

## 🤝 Contributing

We welcome contributions! Whether it's adding new features, fixing bugs, or improving documentation, feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is distributed under the MIT License. You are free to use it in personal, open-source, and commercial projects. See `LICENSE` for more information.

> **Note:** We are exploring "Enterprise/Pro" pathways for cloud-hosted tours and team analytics, but the core engine and this extension will always remain open source.
