# 📄 Form or Fail — Complete Developer Documentation

> **Game:** Form or Fail — The Bureaucracy Hangman Game  
> **Stack:** Pure HTML5 · Vanilla CSS3 · Vanilla JavaScript (ES6+) · No Bootstrap · No Frameworks  
> **Author's Note:** This document explains every feature, every file, every code concept — written so you can confidently make your own changes.

---

## 📁 Table of Contents

1. [Project Overview](#1-project-overview)
2. [File Structure & Architecture](#2-file-structure--architecture)
3. [Feature Breakdown (What Exists)](#3-feature-breakdown-what-exists)
4. [Feature → Code Mapping (Who Does What)](#4-feature--code-mapping-who-does-what)
5. [HTML Deep Dive](#5-html-deep-dive)
6. [CSS Deep Dive](#6-css-deep-dive)
7. [JavaScript Deep Dive](#7-javascript-deep-dive)
8. [JS Concepts Reference Table](#8-js-concepts-reference-table)
9. [HTML Concepts Reference Table](#9-html-concepts-reference-table)
10. [CSS Concepts Reference Table](#10-css-concepts-reference-table)
11. [Bootstrap Usage Note](#11-bootstrap-usage-note)
12. [Customization Guide](#12-customization-guide)

---

## 1. 🎮 Project Overview

### What is "Form or Fail"?

**Form or Fail** is a browser-based Hangman-style game with a corporate bureaucracy theme. Instead of guessing letters, the player must correctly fill in web form fields (email, password, phone number, bank account, etc.) following strict validation rules.

### The Storyline

You are an office worker at a faceless corporation. Every level is a form you must fill. Every wrong answer stamps a paper **REJECTED** and adds it to the pile. **6 wrong answers** and your character is buried under the pile — Game Over.

### Concept Comparison

| Traditional Hangman | Form or Fail |
|---|---|
| Guess letters | Fill form fields correctly |
| Gallows drawing | Paper pile burying character |
| Wrong guess = body part | Wrong guess = rejected paper |
| Word revealed letter by letter | Form fields completed one by one |

### Theme

- 🌑 **Dark navy** corporate aesthetic
- 🏆 **Gold accents** for achievements
- 📄 **Floating paper** background animations
- 😰 **Animated SVG character** that reacts to stress  

---

## 2. 📂 File Structure & Architecture

```
HangMan_Web_Applicartion/
└── with graphics/
    ├── index.html          ← Game structure, all 5 screens in one HTML file
    ├── css/
    │   └── game.css        ← All styles: theme, layout, animations, responsive
    └── js/
        ├── fields.js       ← Data layer: all levels, fields, validation rules
        ├── hangman.js      ← SVG engine: draws & animates the character + papers
        └── game.js         ← Brain: game state, scoring, screen routing, events
```

### Script Load Order (Critical!)

```html
<!-- Bottom of index.html — ORDER MATTERS -->
<script src="js/fields.js"></script>   <!-- Must load FIRST: defines LEVELS & Validators -->
<script src="js/hangman.js"></script>  <!-- Must load SECOND: defines PaperPile -->
<script src="js/game.js"></script>    <!-- Must load LAST: uses LEVELS & PaperPile -->
```

> **Why this order?** `game.js` references `LEVELS` (from `fields.js`) and `PaperPile` (from `hangman.js`). If those load after `game.js`, JavaScript will throw a ReferenceError.

### Module Communication Diagram

```
fields.js          hangman.js          game.js
─────────          ──────────          ───────
LEVELS[]    ──────────────────────→  Game.init()
Validators  ──────────────────────→  submitField()
                                        │
            PaperPile.init()     ←──────┤
            PaperPile.addPaper() ←──────┤ onWrong()
            PaperPile.reset()    ←──────┘ startLevel()
```

---

## 3. 🚀 Feature Breakdown (What Exists)

Here is every feature in the game, explained in plain language:

### 3.1 🖥️ Multi-Screen Navigation

The game has **5 distinct screens** inside one HTML file. Only one screen is visible at a time. Others are hidden using the CSS class `.hidden { display: none !important; }`.

| Screen ID | When Shown | Purpose |
|---|---|---|
| `#screen-start` | On load / after menu | Main menu with level select |
| `#screen-game` | During play | Active gameplay |
| `#screen-level-complete` | After beating a level | Score summary + Next Level button |
| `#screen-game-over` | After 0 lives | Failure screen |
| `#screen-win` | After all 8 levels | Final victory screen |

### 3.2 ❤️ Lives System (6 Lives)

- Every level starts with **6 lives**
- Each **wrong answer** removes 1 life
- Lives are shown as ❤️ (alive) or 🖤 (lost) hearts in the HUD
- Reaching 0 lives triggers Game Over
- The paper pile visual grows with each life lost (see Section 3.7)

### 3.3 🏆 Scoring System

- **First-try correct answer:** 100 pts base (+ field-specific bonus)
- **Second-try correct answer:** 50 pts  
- **Streak bonus (3+ in a row):** 1.5× multiplier applied
- **Level completion bonus:** +200 pts
- **Perfect run bonus (all 6 lives remaining):** +300 pts
- **Hint penalty:** −30 pts per lifeline used
- Score cannot go below 0

### 3.4 🔥 Streak & Multiplier System

- Getting 3 or more correct answers **in a row without a mistake** activates a **1.5× score multiplier**
- The streak counter resets to 0 on any wrong answer or field skip
- Streak is displayed in the HUD as 🔥 x3

### 3.5 🗺️ Level Selection Grid

- The main menu shows **8 level cards** in a responsive grid
- Completed levels show a **green ✓ badge**
- The Boss Level (Level 8) shows a **pulsing BOSS badge**
- Clicking any card starts that level directly
- The "Start from Level 1" button always starts at the beginning

### 3.6 📝 Form Field System

Each level has multiple **form fields** to fill in sequence:
- Fields are shown **one at a time** (not all at once)
- Each field has: a label, an input, a difficulty badge, a points preview
- The **progress bar** shows how far through the level you are
- After a correct answer, the next field loads automatically (with a 0.9s delay)

### 3.7 📄 Paper Pile Animation (The "Hangman" Visual)

Instead of a gallows, there is an animated SVG of a character sitting at a desk:
- **Stage 0:** Happy character, empty desk
- **Stage 1–2:** First papers fall, character looks worried
- **Stage 3–4:** More papers, character sweats
- **Stage 5:** X-eyes, almost buried
- **Stage 6:** Game Over — character fully buried

Each wrong answer **drops a new paper** with a bounce animation onto the pile. Papers display stamps like: `REJECTED`, `INVALID`, `ERROR`, `DENIED`, `WRONG FORMAT`, `SYSTEM FAIL`.

### 3.8 💡 Lifeline System (3 per type, per level)

Three lifeline buttons appear at the bottom of the game screen:

| Lifeline | Effect | Cost |
|---|---|---|
| 📖 Show Rule | Reveals the validation rule for the current field | −30 pts |
| 👁 Show Format | Shows a valid example input | −30 pts |
| ⏭️ Skip Field | Skips the field, next field loads, no points earned | Free (no pts) |

- Each lifeline has **3 uses per level** (tracked individually)
- When uses reach 0, the button is **disabled** (greyed out)
- A dismissible hint box appears below the input to show the hint text

### 3.9 🔐 Password Toggle

When the field type is `password`, a 👁 toggle button appears inside the input:
- Clicking it switches the `input type` between `password` and `text`
- This lets the player see what they typed

### 3.10 🟢🟡🔴 Difficulty Badges

Every field has a difficulty label displayed next to the field name:
- 🟢 **Easy** — Simple validation (name, city)
- 🟡 **Medium** — Moderate pattern (email, birthdate)
- 🔴 **Hard** — Complex format (Belgian phone, VAT, GST)

### 3.11 📊 Progress Bar

A slim gold progress bar runs across the top of the form panel:
- Shows what percentage of the level's fields you've completed
- Updates with a smooth CSS transition on each new field

### 3.12 📣 Feedback Messages

After submitting, a colored message appears below the input:
- ✅ **Green** — Correct answer with points earned
- ❌ **Red** — Wrong answer with specific error reason
- ⏭️ **Blue** — Field skipped

The input box **shakes** on a wrong answer (CSS animation).

### 3.13 💡 Hint Box

A dismissible hint panel opens below the input when a lifeline is used:
- Shows the validation rule or a valid example
- Has an ✕ close button
- Uses `<pre>` tag to preserve formatting (like newlines in regex hints)

### 3.14 🌊 Floating Background Papers

6 semi-transparent paper shapes **float upward** continuously in the background:
- Created with pure CSS `@keyframes drift` animation
- Each has a different size, speed, and start delay
- They are purely decorative (`aria-hidden="true"`)

### 3.15 📱 Responsive Design

The game layout adapts to different screen sizes:
- **Desktop:** 2-column layout (character left | form right)
- **Tablet (≤768px):** 2-row stacked layout (character top | form bottom)
- **Mobile (≤480px):** 2-column level grid, smaller text

### 3.16 ♿ Accessibility (ARIA)

Many elements have ARIA attributes:
- `aria-live="polite"` — Score, streak, field counter updates announced to screen readers
- `aria-live="assertive"` — Game over screen announced urgently
- `role="alert"`, `role="status"`, `role="toolbar"`, `role="progressbar"`
- All buttons have `aria-label` descriptions
- Decorative elements use `aria-hidden="true"`

### 3.17 🔄 Cross-Field Validation

Level 2 (Password Recovery) includes a **Confirm Password** field that validates against the previously entered password:
- The value from "New Password" is saved to a `fieldContext` object
- The "Confirm Password" validator compares against `fieldContext.newPassword`

### 3.18 📋 Scenario Narrative Cards

Each level has a **story context card** at the top of the form panel:
- A short immersive narrative explaining the bureaucratic situation
- Styled as a document note with an italic font and a 📋 icon

### 3.19 🏅 Level Complete Screen

After finishing all fields in a level:
- Shows level bonus points, total score, lives remaining
- Shows a 🏆 "Perfect Run!" message if no lives were lost
- "Next Level" button dynamically shows the next level's name/icon

### 3.20 😱 Animated Character Expressions

The SVG character's face changes based on how many lives are lost:
- **Stage 0–2:** Normal eyes + smile → frown
- **Stage 3–4:** Worried eyes (raised eyebrows) + straight mouth
- **Stage 5–6:** X-eyes (red crossed lines) + pained mouth

### 3.21 💥 Micro-Animations

Several small animations make the game feel alive:
- **Logo emoji floats** up and down (infinite loop)
- **Score pops and scales** when you earn points
- **Paper panel shakes** left-right on wrong answer
- **Input shakes** left-right on wrong answer
- **Boss badge pulses** on the level grid
- **Result cards slide up** on screen transitions
- **Emoji bounces in** on result screens

---

## 4. 🔗 Feature → Code Mapping (Who Does What)

This section maps every feature to the exact HTML elements, CSS classes, and JavaScript functions responsible for it.

---

### 4.1 Multi-Screen Navigation

| Layer | Code | Role |
|---|---|---|
| **HTML** | `#screen-start`, `#screen-game`, `#screen-level-complete`, `#screen-game-over`, `#screen-win` | The 5 screen containers |
| **CSS** | `.hidden { display: none !important; }` | Hides inactive screens |
| **JS** | `showScreen(name)` in `game.js` | Adds/removes `.hidden` class from screens |
| **JS** | `bindEvents()` — all `btn-menu-*` listeners | Triggers `showScreen('start')` |

---

### 4.2 Lives System

| Layer | Code | Role |
|---|---|---|
| **HTML** | `#lives-display` inside `#game-hud` | Container for heart emojis |
| **CSS** | `.heart`, `.heart-alive`, `.heart-lost` (grayscale + opacity) | Heart appearance |
| **JS** | `state.lives` in `game.js` | Tracks current lives (starts at 6) |
| **JS** | `onWrong()` → `state.lives--` | Decrements lives on wrong answer |
| **JS** | `updateHUD()` → loop building 6 `.heart` spans | Re-renders the heart display |
| **JS** | `if (state.lives <= 0) setTimeout(onGameOver, 1200)` | Triggers game over |

---

### 4.3 Scoring System

| Layer | Code | Role |
|---|---|---|
| **HTML** | `#score-display` | Shows the score number |
| **CSS** | `.score-flash` + `@keyframes score-pop` | The "pop" animation on score update |
| **JS** | `const POINTS = { firstTry:100, secondTry:50, levelBonus:200, ... }` | All point values |
| **JS** | `addScore(pts)` | Adds/subtracts from `state.score`, updates display |
| **JS** | `onCorrect(field)` | Calculates earned pts, calls `addScore()` |
| **JS** | `onLevelComplete()` | Adds level bonus + perfect bonus |
| **JS** | `flashScore()` | Temporarily adds `.score-flash` class |

---

### 4.4 Streak & Multiplier

| Layer | Code | Role |
|---|---|---|
| **HTML** | `#streak-display` | Shows "🔥 x3" streak counter |
| **CSS** | color: `var(--red-500)` on `#streak-display` | Styled in orange-red |
| **JS** | `state.streak`, `state.multiplier` | Counters in state object |
| **JS** | `onCorrect()` → `state.streak++` | Increments streak |
| **JS** | `if (state.streak >= POINTS.streakThreshold)` → sets multiplier to 1.5 | Activates multiplier |
| **JS** | `onWrong()` → `state.streak = 0; state.multiplier = 1;` | Resets both |

---

### 4.5 Level Selection Grid

| Layer | Code | Role |
|---|---|---|
| **HTML** | `#level-select-grid` | Grid container |
| **CSS** | `#level-select-grid` CSS Grid, `.level-card`, `.boss-badge`, `.done-badge` | Card layout and styling |
| **JS** | `renderLevelSelect()` in `game.js` | Dynamically creates all level cards from `LEVELS[]` |
| **JS** | `LEVELS` array in `fields.js` | Level data (id, title, icon, isBoss) |
| **JS** | `state.completedLevels[]` | Tracks which levels are done |
| **JS** | `div.addEventListener('click', () => startLevel(i))` | Click to start a level |

---

### 4.6 Form Field System (One Field at a Time)

| Layer | Code | Role |
|---|---|---|
| **HTML** | `#field-card`, `#field-label`, `#field-input-area`, `#field-input` | The form field UI |
| **HTML** | `#field-counter` ("Field 1 of 3") | Field position text |
| **CSS** | `#field-input`, `#field-input:focus` styling | Input box appearance |
| **JS** | `renderField()` in `game.js` | Builds the field UI dynamically |
| **JS** | `state.currentFieldIndex` | Tracks which field we're on |
| **JS** | `LEVELS[state.currentLevel].fields[]` in `fields.js` | Field definitions |
| **JS** | `setTimeout(() => { state.currentFieldIndex++; renderField(); }, 900)` | Moves to next field |

---

### 4.7 Paper Pile Animation

| Layer | Code | Role |
|---|---|---|
| **HTML** | `#hangman-svg-container` inside `#paper-panel` | Container for SVG |
| **CSS** | `.paper-new` + `@keyframes paper-drop` | Bounce-fall animation for new papers |
| **CSS** | `.paper-item` | Base transform-origin for rotation |
| **JS (hangman.js)** | `PaperPile` IIFE module | Entire SVG management system |
| **JS** | `buildSVG(stage)` | Redraws entire SVG on each life loss |
| **JS** | `createDesk()` | Brown wooden desk at the bottom |
| **JS** | `createCharacter(stage)` | Full character (sinks with `offsetY`) |
| **JS** | `createPapers(stage)` | Generates 1 paper per life lost |
| **JS** | `createBubble(stage)` | Speech bubble expressions |
| **JS** | `requestAnimationFrame(() => ...)` | Triggers drop animation on new paper |
| **JS** | `PaperPile.addPaper()` called from `onWrong()` in game.js | Connects wrong answer to visual |

---

### 4.8 Lifelines System

| Layer | Code | Role |
|---|---|---|
| **HTML** | `#lifelines-panel`, `#btn-show-rule`, `#btn-show-format`, `#btn-skip` | Lifeline buttons |
| **HTML** | `#ll-rule-count`, `#ll-format-count`, `#ll-skip-count` | Count badges inside buttons |
| **HTML** | `#hint-box`, `#hint-content`, `#btn-close-hint` | Dismissible hint panel |
| **CSS** | `.lifeline-btn`, `.ll-count`, `.lifeline-btn:disabled` | Button and count styling |
| **CSS** | `#hint-box` + `@keyframes fadeIn` | Hint box slide-down appearance |
| **JS** | `state.lifelines = { showRule:3, showFormat:3, skipField:3 }` | Tracks uses per type |
| **JS** | `useShowRule()`, `useShowFormat()`, `useSkipField()` | Handler functions |
| **JS** | `updateLifelines()` | Updates count badges, disables buttons at 0 |
| **JS** | `showHint(text)` | Populates and shows `#hint-box` |
| **JS** | `field.hint`, `field.example` in `fields.js` | The actual hint text |

---

### 4.9 Password Toggle

| Layer | Code | Role |
|---|---|---|
| **HTML** | `#toggle-pw` button (injected dynamically) | Toggle button |
| **CSS** | `.pw-wrap`, `.pw-toggle`, `.pw-toggle:hover` | Positions the button inside the input |
| **JS** | `renderField()` — `if (field.type === 'password')` branch | Injects `<div class="pw-wrap">` with toggle button |
| **JS** | `togglePw.addEventListener('click', ...)` → `inp.type === 'password' ? 'text' : 'password'` | Switches input type |

---

### 4.10 Difficulty Badges

| Layer | Code | Role |
|---|---|---|
| **HTML** | `#difficulty-badge` span | Badge element |
| **CSS** | `.difficulty-badge`, `.diff-easy`, `.diff-medium`, `.diff-hard` | Color-coded styles |
| **JS** | `const diffMap = { easy: {...}, medium: {...}, hard: {...} }` in `renderField()` | Maps difficulty string to label + class |
| **JS (fields.js)** | `difficulty: DIFFICULTY.EASY / MEDIUM / HARD` on each field | Field data that drives the badge |

---

### 4.11 Progress Bar

| Layer | Code | Role |
|---|---|---|
| **HTML** | `#field-progress-track` (wrapper) + `#field-progress-bar` (fill) | Progress bar elements |
| **HTML** | `role="progressbar"` with `aria-valuemin/max/now` | Accessibility |
| **CSS** | `#field-progress-bar` with `transition: width 0.5s ease` | Smooth animated fill |
| **JS** | `const pct = ((current - 1) / total) * 100` | Calculates percentage |
| **JS** | `bar.style.width = pct + '%'` | Applies width dynamically |

---

### 4.12 Feedback Messages

| Layer | Code | Role |
|---|---|---|
| **HTML** | `#field-feedback` with `role="alert"` and `aria-live="assertive"` | Feedback container |
| **CSS** | `.field-feedback`, `.fb-correct`, `.fb-wrong`, `.fb-skip` | Color variants |
| **JS** | `showFeedback(msg, type)` in `game.js` | Sets text + applies CSS class |
| **JS** | `onCorrect()` → `showFeedback('✅ Correct!...', 'correct')` | Triggers success feedback |
| **JS** | `onWrong()` → `showFeedback('❌ ' + msg, 'wrong')` | Triggers error feedback |
| **JS (fields.js)** | `field.requiredMsg`, `field.invalidMsg` | The error text content |

---

### 4.13 Input Shake Animation (Wrong Answer)

| Layer | Code | Role |
|---|---|---|
| **CSS** | `@keyframes shake` + `.shake` class | Shake keyframe definition |
| **CSS** | `@keyframes shake-panel` + `.shake-panel` class | Panel-level shake |
| **JS** | `showFeedback()` → `input.classList.add('shake')` + `setTimeout remove` | Input shake on wrong |
| **JS** | `shakePaperPanel()` → `panel.classList.add('shake-panel')` | Panel shake on wrong |

---

### 4.14 Floating Background Papers

| Layer | Code | Role |
|---|---|---|
| **HTML** | `<div class="bg-papers" aria-hidden="true">` containing 6 `.bg-paper` divs | Background decoration |
| **CSS** | `.bg-papers`, `.bg-paper`, `@keyframes drift` | Fixed position, infinite float upward |
| **HTML** | Inline `style` on each `.bg-paper` for size, position, duration, delay | Custom per-paper behavior |

---

### 4.15 Responsive Design

| Layer | Code | Role |
|---|---|---|
| **CSS** | `@media (max-width: 768px)` | Tablet breakpoint |
| **CSS** | `#game-body { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }` | Stacks panels vertically |
| **CSS** | `@media (max-width: 480px)` | Mobile breakpoint |
| **CSS** | `#level-select-grid { grid-template-columns: repeat(2, 1fr); }` | 2-column grid on mobile |
| **CSS** | `font-size: clamp(2.4rem, 6vw, 4rem)` on `.logo-title` | Fluid responsive font size |

---

### 4.16 Cross-Field Validation (Confirm Password)

| Layer | Code | Role |
|---|---|---|
| **JS (fields.js)** | `onValidate: (v, ctx) => { ctx.newPassword = v; }` on the `newPassword` field | Saves typed password to context |
| **JS (fields.js)** | `Validators.confirmPassword: (v, ctx) => v === ctx.newPassword` | Compares against saved value |
| **JS (game.js)** | `state.fieldContext` object | The shared context passed to validators |
| **JS (game.js)** | `if (field.onValidate) field.onValidate(val, state.fieldContext)` | Calls the save function |
| **JS (game.js)** | `field.validate(val, state.fieldContext)` | Passes context to every validator |

---

### 4.17 Animated SVG Character Expressions

| Layer | Code | Role |
|---|---|---|
| **JS (hangman.js)** | `createNormalEyes(cx, headY)` | Stage 0–2: simple circles |
| **JS (hangman.js)** | `createWorriedEyes(cx, headY)` | Stage 3–4: arched brows added |
| **JS (hangman.js)** | `createXEyes(cx, headY)` | Stage 5–6: red X lines |
| **JS (hangman.js)** | `if (stage >= 5)` / `else if (stage >= 3)` branches | Selects which eyes to draw |
| **JS (hangman.js)** | Mouth `path`/`line` switching on stage value | Smile → frown → flat → pained |
| **JS (hangman.js)** | `const offsetY = Math.min(stage * 15, 80)` | Sinks character as papers pile |

---

### 4.18 Micro-Animations Summary

| Animation | CSS Keyframe | Triggered By |
|---|---|---|
| Logo emoji float | `@keyframes float` | Always on `.logo-emoji` |
| Score pop | `@keyframes score-pop` + `.score-flash` | `flashScore()` in `game.js` |
| Input shake | `@keyframes shake` + `.shake` | `showFeedback()` on wrong |
| Panel shake | `@keyframes shake-panel` + `.shake-panel` | `shakePaperPanel()` |
| Paper drop | `@keyframes paper-drop` + `.paper-new` | `requestAnimationFrame` in `hangman.js` |
| Boss badge pulse | `@keyframes pulse-badge` | Always on `.boss-badge` |
| Result card slide up | `@keyframes fadeInUp` | Always on `.result-card` |
| Result emoji bounce | `@keyframes bounce-in` | Always on `.result-emoji` |
| Hint box fade | `@keyframes fadeIn` | Always on `#hint-box` show |
| Background papers drift | `@keyframes drift` | Always on each `.bg-paper` |

---

## 5. 📄 HTML Deep Dive

### 5.1 Overall Page Structure

```html
<body>
  <div class="bg-papers">...</div>   <!-- Decorative background layer -->
  
  <div id="game-root">              <!-- Wraps ALL screens -->
    <main id="screen-start">...</main>               <!-- Screen 1 -->
    <section id="screen-game">                        <!-- Screen 2 -->
      <header id="game-hud">...</header>             <!-- Sticky HUD bar -->
      <div id="game-body">                           <!-- 2-panel layout -->
        <aside id="paper-panel">...</aside>          <!-- Left: SVG -->
        <article id="form-panel">...</article>       <!-- Right: Form -->
      </div>
      <footer id="lifelines-panel">...</footer>      <!-- Bottom: Lifelines -->
    </section>
    <section id="screen-level-complete">...</section> <!-- Screen 3 -->
    <section id="screen-game-over">...</section>      <!-- Screen 4 -->
    <section id="screen-win">...</section>            <!-- Screen 5 -->
  </div>
</body>
```

### 5.2 Semantic HTML Elements Used

| Element | Used For | Why Semantic |
|---|---|---|
| `<main>` | Start screen | One primary `<main>` per page, the core content |
| `<section>` | Each game screen | Groups related content with a heading |
| `<header>` | Game HUD | Top navigation/info bar of the screen |
| `<footer>` | Lifelines panel | Bottom accessory bar of the screen |
| `<aside>` | Paper/character panel | Tangentially related content (visual side) |
| `<article>` | Form field panel | Self-contained form interaction content |
| `<nav>` | Not used (SPA) | N/A |
| `<label>` | Field label | Associates label text with `for="field-input"` |
| `<pre>` | Hint content | Preserves whitespace/newlines in hints |

### 5.3 ARIA Attributes Explained

| Attribute | Where Used | What It Does |
|---|---|---|
| `aria-hidden="true"` | `.bg-papers`, decorative spans | Hides from screen readers |
| `aria-live="polite"` | Score, streak, field counter | Screen reader announces updates without interrupting |
| `aria-live="assertive"` | `#field-feedback`, `#screen-game-over` | Screen reader announces immediately |
| `aria-label="..."` | All buttons | Provides accessible button name |
| `role="main"` | `<main>` | Landmark role |
| `role="banner"` | `<header>` | Landmark role |
| `role="toolbar"` | Lifelines panel | Group of action buttons |
| `role="progressbar"` | Progress bar | With `aria-valuemin/max/now` attributes |
| `role="alert"` | Feedback div | Announced on content change |
| `role="note"` | Scenario card, hint box | Advisory content |
| `role="list"` / `role="listitem"` | Mini rules, result stats | Semantic list for non-`<ul>` groups |
| `role="img"` | SVG container | Marks SVG as an image with `aria-label` |

### 5.4 The `<head>` Section

```html
<meta charset="UTF-8" />                    <!-- Character encoding -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" /> <!-- Mobile support -->
<title>Form or Fail — ...</title>           <!-- SEO page title -->
<meta name="description" content="..." />  <!-- SEO description -->
<link rel="icon" href="data:image/svg+xml,..."> <!-- SVG emoji favicon (inline data URL) -->
<link rel="stylesheet" href="css/game.css" /> <!-- External stylesheet -->
```

### 5.5 Key HTML IDs and Their Purpose

| ID | Element | Purpose |
|---|---|---|
| `game-root` | `<div>` | Outermost game wrapper |
| `screen-start` | `<main>` | Main menu screen |
| `screen-game` | `<section>` | Gameplay screen |
| `screen-level-complete` | `<section>` | Level win screen |
| `screen-game-over` | `<section>` | Game over screen |
| `screen-win` | `<section>` | Final win screen |
| `game-hud` | `<header>` | Sticky HUD at top of game screen |
| `current-level-label` | `<span>` | "Level 1 — Login" text |
| `level-subtitle` | `<span>` | Level subtitle text |
| `lives-display` | `<div>` | Heart emojis container |
| `score-display` | `<span>` | Score number |
| `streak-display` | `<span>` | "🔥 x3" streak |
| `btn-menu-go` | `<button>` | ← Menu (during game) |
| `paper-panel` | `<aside>` | Left panel with SVG |
| `hangman-svg-container` | `<div>` | Where SVG is injected |
| `form-panel` | `<article>` | Right panel with form |
| `scenario-card` | `<div>` | Story narrative box |
| `scenario-text` | `<p>` | The scenario paragraph |
| `field-progress-track` | `<div>` | Progress bar background |
| `field-progress-bar` | `<div>` | Progress bar fill |
| `field-counter` | `<span>` | "Field 1 of 3" |
| `field-card` | `<div>` | Form field card container |
| `field-label` | `<label>` | Field name |
| `difficulty-badge` | `<span>` | 🟢/🟡/🔴 badge |
| `field-input-area` | `<div>` | Input wrapper (rebuilt per field) |
| `field-input` | `<input>` | The actual input box |
| `hint-box` | `<div>` | Hidden hint panel |
| `hint-content` | `<pre>` | Hint text |
| `btn-close-hint` | `<button>` | ✕ Dismiss hint |
| `field-feedback` | `<div>` | ✅/❌ feedback message |
| `btn-submit-field` | `<button>` | Submit Answer button |
| `field-points` | `<span>` | "+100 pts" preview |
| `lifelines-panel` | `<footer>` | Lifelines bar |
| `btn-show-rule` | `<button>` | 📖 Show Rule lifeline |
| `btn-show-format` | `<button>` | 👁 Show Format lifeline |
| `btn-skip` | `<button>` | ⏭️ Skip Field lifeline |
| `ll-rule-count` | `<span>` | "3" inside Show Rule button |
| `ll-format-count` | `<span>` | "3" inside Show Format button |
| `ll-skip-count` | `<span>` | "3" inside Skip Field button |
| `level-select-grid` | `<div>` | Level card grid (populated by JS) |
| `btn-start` | `<button>` | "Start from Level 1" |

---

## 6. 🎨 CSS Deep Dive

### 6.1 CSS Custom Properties (Variables)

Defined inside `:root {}` — these are the entire design system.

```css
:root {
  --navy-950: #020617;    /* Darkest background */
  --gold-400: #fbbf24;    /* Primary accent color */
  --red-500:  #ef4444;    /* Wrong/danger color */
  --green-400: #4ade80;   /* Correct/success color */
  --font-main: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  --radius: 12px;         /* Standard border radius */
  --shadow: 0 4px 24px rgba(0,0,0,0.4);
  --glow-gold: 0 0 20px rgba(251,191,36,0.3);
  --transition: 0.25s cubic-bezier(0.4,0,0.2,1);
}
```

**Why use variables?** Change `--gold-400` once to change the entire accent color everywhere instantly.

### 6.2 Layout: CSS Flexbox

Used for most single-axis layouts:

```css
#screen-start { display: flex; flex-direction: column; align-items: center; }
#game-hud { display: flex; align-items: center; justify-content: space-between; }
.mini-rules { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
```

- `flex-direction: column` — stacks children vertically
- `align-items: center` — centers children on the cross axis
- `justify-content: space-between` — spaces children evenly
- `flex-wrap: wrap` — allows children to wrap to the next row
- `gap: 16px` — spacing between flex/grid children

### 6.3 Layout: CSS Grid

Used for the 2-panel game layout and the level select grid:

```css
/* 2-panel layout: fixed 380px left + flexible right */
#game-body { display: grid; grid-template-columns: 380px 1fr; }

/* Auto-responsive level cards: at least 170px wide */
#level-select-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; }
```

- `repeat(auto-fill, minmax(170px, 1fr))` — magic responsive grid: fills as many 170px columns as fit

### 6.4 @keyframes Animations

All animations are defined with `@keyframes` and applied via class names:

| Keyframe | Class Applied | Effect |
|---|---|---|
| `float` | `.logo-emoji` (always) | 0px → -12px → 0px vertical float |
| `paper-drop` | `.paper-new` (triggered) | Falls from top with bounce |
| `shake` | `.shake` (JS-toggled) | Left-right wiggle |
| `shake-panel` | `.shake-panel` (JS-toggled) | Subtle panel shake |
| `score-pop` | `.score-flash` (JS-toggled) | Scale up + green flash |
| `fadeIn` | `#hint-box` (on show) | Slide down from above |
| `fadeInUp` | `.result-card` (always) | Slides up when screen appears |
| `bounce-in` | `.result-emoji` (always) | Elastic scale bounce |
| `pulse-badge` | `.boss-badge` (always) | Gentle scale pulse |
| `drift` | `.bg-paper` (always) | Float upward infinitely |

### 6.5 CSS Transitions

Transitions make changes smooth instead of instant:

```css
.level-card { transition: all var(--transition); }
/* When .level-card:hover triggers, border-color, transform, box-shadow all change smoothly */

#field-progress-bar { transition: width 0.5s ease; }
/* Progress bar width changes animate smoothly */

#field-input { transition: border-color var(--transition), box-shadow var(--transition); }
/* Input focus ring appears smoothly */
```

### 6.6 Pseudo-classes and Pseudo-elements

```css
/* Pseudo-classes */
.level-card:hover { transform: translateY(-3px); }  /* When mouse is over */
#field-input:focus { border-color: var(--gold-500); } /* When input is active */
.lifeline-btn:disabled { opacity: 0.35; }             /* When button is disabled */
.btn:active { transform: scale(0.97); }              /* When button is clicked */
.result-stat-row span:first-child { ... }            /* First child span */
.result-stat-row span:last-child { ... }             /* Last child span */
.pw-toggle:hover { color: var(--gold-400); }         /* Hover on toggle */

/* Pseudo-elements */
.level-card::before { content: ''; /* Gold shimmer overlay */ }
.btn::after { content: ''; /* White ripple overlay */ }
#paper-panel::before { content: ''; /* Gold top border line */ }
.result-card::before { content: ''; /* Colored top accent bar */ }
```

### 6.7 Special CSS Techniques

**Gradient Text (Logo Title):**
```css
.logo-title {
  background: linear-gradient(135deg, var(--gold-400) 0%, var(--white) 50%, var(--gold-400) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Sticky HUD with Blur:**
```css
#game-hud {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px); /* Glass blur effect */
}
```

**Glow Box Shadows:**
```css
.level-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.4), var(--glow-gold); }
/* --glow-gold = 0 0 20px rgba(251,191,36,0.3) → golden ambient glow */
```

**Fluid Typography:**
```css
.logo-title { font-size: clamp(2.4rem, 6vw, 4rem); }
/* min: 2.4rem | preferred: 6% viewport width | max: 4rem */
```

**Scrollbar Styling:**
```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--navy-900); }
::-webkit-scrollbar-thumb { background: var(--navy-600); border-radius: 3px; }
```

### 6.8 Responsive Media Queries

```css
/* Tablet */
@media (max-width: 768px) {
  #game-body { grid-template-columns: 1fr; } /* Stack vertically */
  #hangman-svg-container { height: 220px; }  /* Smaller SVG */
}

/* Mobile */
@media (max-width: 480px) {
  .logo-title { font-size: 2rem; }
  #level-select-grid { grid-template-columns: repeat(2, 1fr); }
}
```

---

## 7. ⚙️ JavaScript Deep Dive

### 7.1 fields.js — The Data Layer

**Purpose:** Define every game level, every field, every validator. No game logic here — just data.

#### 7.1.1 DIFFICULTY Constants

```javascript
const DIFFICULTY = { EASY: 'easy', MEDIUM: 'medium', HARD: 'hard' };
```
A simple constants object. Used to set `difficulty` on each field definition.

#### 7.1.2 The Validators Object

A plain object containing named functions for each validation type. All functions take a value `v` and return `true` (valid) or `false` (invalid).

```javascript
const Validators = {
  email: (v) => /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/.test(v.trim()),
  password: (v) => v.length >= 12 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) && /[!@#$...]/.test(v),
  ...
};
```

**Regex Patterns Explained:**

| Validator | Pattern | Meaning |
|---|---|---|
| `email` | `^([a-zA-Z0-9_\-.]+)@...` | Letters/digits/`_-.` before `@`, then domain, then 2-5 letter TLD |
| `password` | `v.length >= 12` + 4 regex tests | 12+ chars with uppercase, lowercase, digit, special char |
| `date` | `^\d{2}-\d{2}-\d{4}$` | Exactly dd-mm-yyyy format |
| `birthdate` | Same as date + age check: `y <= 2007` (18+ as of 2026) | Date + minimum age 18 |
| `phone` | `^\+32\s?\d{1,2}\s?\d{3}\s?\d{2}\s?\d{2}$` | Belgian format: +32 then groups |
| `vatBE` | `^BE\d{9,10}$` | "BE" followed by 9 or 10 digits |
| `bankBE` | `^BE\d{14}$` | "BE" followed by exactly 14 digits |
| `gst` | `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9A-Z]{1}$` | 15-char Indian GSTIN format |
| `currencyEUR` | `^EUR\s?\d{1,12}(,\d{2})?$` | "EUR" then digits with optional comma-decimal |
| `recaptcha` | `v.trim().toUpperCase() === 'HUMAN'` | Must type exactly "HUMAN" |
| `imageFile` | `/\.(png|jpeg|jpg|gif)$/i` | Filename ends in image extension |
| `confirmPassword` | `v === ctx.newPassword` | Exact string match with previously saved value |

#### 7.1.3 LEVELS Array Structure

```javascript
const LEVELS = [
  {
    id: 1,                         // Level number (displayed)
    title: 'Login to Your Account',// Short title
    subtitle: 'Level 1 — ...',     // HUD subtitle
    scenario: '...',               // Story text shown in scenario card
    icon: '🔐',                    // Emoji for level card
    isBoss: true,                  // Optional: shows BOSS badge
    fields: [                      // Array of field objects
      {
        id: 'email',               // Unique field identifier
        label: 'Email Address',    // Shown as field label
        type: 'text',              // 'text' or 'password'
        placeholder: '...',        // Input placeholder
        difficulty: DIFFICULTY.MEDIUM,
        points: 100,               // Max points for this field
        hint: '...',              // Shown by "Show Rule" lifeline
        example: '...',           // Shown by "Show Format" lifeline
        requiredMsg: '...',       // Error when field is empty
        invalidMsg: '...',        // Error when format is wrong
        validate: (v) => Validators.email(v), // Validation function
        onValidate: (v, ctx) => { ctx.newPassword = v; } // Optional: save to context
      }
    ]
  }
];
```

---

### 7.2 hangman.js — The SVG Engine

**Purpose:** Draw and animate the character and paper pile using pure SVG (no images, no canvas).

#### 7.2.1 The IIFE Pattern

```javascript
const PaperPile = (() => {
  // Private variables and functions
  let currentStage = 0;
  
  function buildSVG(stage) { ... }  // Private

  return {          // Public API
    init() { ... },
    addPaper() { ... },
    reset() { ... },
    getStage() { ... },
    isGameOver() { ... }
  };
})();
```

**IIFE = Immediately Invoked Function Expression.** The `(() => { ... })()` runs immediately and the inner function creates a **closure** — private variables like `currentStage` are hidden from the outside. Only the returned object properties are public.

#### 7.2.2 buildSVG(stage) — The Pipeline

Called every time a life is lost. Rebuilds the entire SVG fresh:

```
buildSVG(stage)
   │
   ├─ Creates <svg> element with viewBox="0 0 340 400"
   ├─ Appends createDesk()          → wooden desk at bottom
   ├─ Appends createCharacter(stage) → person (sinks over time)
   ├─ if stage > 0: Appends createPapers(stage)  → paper pile
   ├─ if stage > 0: Appends createBubble(stage)  → speech bubble
   └─ Triggers requestAnimationFrame → plays paper-drop animation
```

#### 7.2.3 makeSVGEl(tag, attrs) — The SVG Builder Helper

```javascript
function makeSVGEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}
```

- **`document.createElementNS`** — Required for SVG elements (unlike regular HTML elements, SVG needs a namespace)
- **`Object.entries(attrs)`** — Converts the attributes object to `[key, value]` pairs for the loop

#### 7.2.4 Character Sinking Effect

```javascript
const offsetY = Math.min(stage * 15, 80);
// stage 0 = offsetY 0  (normal position)
// stage 3 = offsetY 45 (sunken 45px)
// stage 6 = offsetY 80 (max sink — capped at 80px)

const body = makeSVGEl('rect', { y: 250 + offsetY * 0.3, ... });
```

The character's body, head, arms, and legs all add `offsetY * 0.3` to their `y` coordinate as stage increases — making the character appear to sink into the paper pile.

#### 7.2.5 createPapers(stage) — How Papers Stack

```javascript
const baseY = 328;         // Desk surface Y position
const paperHeight = 38;    // Each paper is 38px tall

for (let i = 0; i < stage; i++) {
  const paperY = baseY - (i * (paperHeight - 6));
  // Paper 0 is at desk level (y=328)
  // Paper 1 is 32px higher (y=296)
  // Paper 2 is 64px higher (y=264)
  // ...each paper stacks upward
  
  const isNew = i === stage - 1;  // The newest paper gets animation class
}
```

Each paper gets a `rotate()` transform with different angles from the `rotations[]` array, creating a messy pile look.

---

### 7.3 game.js — The Core Controller

**Purpose:** Manages the entire game — state, screen routing, user input, scoring, UI updates.

#### 7.3.1 The State Object

```javascript
let state = {
  currentLevel: 0,         // Which level (index into LEVELS)
  currentFieldIndex: 0,    // Which field within the level
  lives: 6,                // Remaining lives
  score: 0,                // Current score
  streak: 0,               // Consecutive correct answers
  multiplier: 1,           // Score multiplier (1 or 1.5)
  lifelines: { showRule: 3, showFormat: 3, skipField: 3 },
  attemptsOnField: 0,      // Tries on current field (for 1st/2nd try scoring)
  fieldContext: {},         // Cross-field data (e.g. saved password)
  completedLevels: [],     // Indexes of completed levels
  gameOver: false,
  levelComplete: false,
  allLevelsComplete: false,
};
```

All game data lives here. No global variables scattered around.

#### 7.3.2 DOM Helper Functions

```javascript
const $ = (id) => document.getElementById(id);       // Shortcut for getElementById
const show = (id) => $(id).classList.remove('hidden'); // Make element visible
const hide = (id) => $(id).classList.add('hidden');   // Make element invisible
const setText = (id, text) => $(id).textContent = text; // Set text content
const setHTML = (id, html) => $(id).innerHTML = html;   // Set HTML content
```

These are tiny utility functions. Instead of writing `document.getElementById('score-display').textContent = value` every time, you write `setText('score-display', value)`.

#### 7.3.3 Screen Router

```javascript
function showScreen(name) {
  ['screen-start','screen-game','screen-level-complete','screen-game-over','screen-win']
    .forEach(hide);        // Hide ALL screens
  show('screen-' + name); // Show only the requested one
}
// Usage: showScreen('game') → hides all, shows #screen-game
```

#### 7.3.4 init() — The Boot Sequence

```javascript
function init() {
  renderLevelSelect(); // Build the level grid from LEVELS data
  showScreen('start'); // Show the main menu
  PaperPile.init();    // Draw the initial empty desk SVG
  bindEvents();        // Attach all button click listeners
}

document.addEventListener('DOMContentLoaded', () => { Game.init(); });
// Runs after HTML is fully loaded
```

#### 7.3.5 submitField() — The Validation Engine

```javascript
function submitField() {
  const field = LEVELS[state.currentLevel].fields[state.currentFieldIndex];
  const val = input.value;

  let isValid = false;
  try {
    isValid = field.validate(val, state.fieldContext); // Call field's validator
  } catch(e) { isValid = false; }

  if (isValid) { onCorrect(field); }
  else { onWrong(field, val); }
}
```

#### 7.3.6 Scoring Math in onCorrect()

```javascript
function onCorrect(field) {
  state.streak++;
  if (state.streak >= 3) state.multiplier = 1.5;   // Activate streak bonus

  const pts = state.attemptsOnField === 0 
    ? POINTS.firstTry    // 100 pts on first try
    : POINTS.secondTry;  // 50 pts on second try

  // earned = base pts × multiplier, plus field-specific bonus above 100
  const earned = Math.round(pts * state.multiplier) + 
                 (state.attemptsOnField === 0 ? field.points - 100 : 0);

  addScore(Math.max(earned, 10)); // Always earn at least 10 pts
  state.attemptsOnField = 0;

  setTimeout(() => {
    state.currentFieldIndex++;
    if (state.currentFieldIndex >= LEVELS[state.currentLevel].fields.length) {
      onLevelComplete();   // All fields done → level complete
    } else {
      renderField();       // Load next field
    }
  }, 900); // 0.9 second delay so player can read the "Correct!" message
}
```

#### 7.3.7 bindEvents() — All Event Listeners

All button click handlers are set up here once at startup:

```javascript
function bindEvents() {
  $('btn-submit-field').addEventListener('click', submitField);
  $('btn-show-rule').addEventListener('click', useShowRule);
  $('btn-show-format').addEventListener('click', useShowFormat);
  $('btn-skip').addEventListener('click', useSkipField);
  $('btn-start').addEventListener('click', () => startLevel(0));
  $('btn-retry').addEventListener('click', () => startLevel(state.currentLevel));
  $('btn-menu-go').addEventListener('click', () => { renderLevelSelect(); showScreen('start'); });
  // ...etc for all menu buttons
  
  // Enter key submits field
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitField(); });
}
```

---

## 8. 📊 JS Concepts Reference Table

| Concept | Where Used | Example |
|---|---|---|
| **IIFE** (Immediately Invoked Function Expression) | `game.js`, `hangman.js` | `const Game = (() => { ... })();` |
| **Closure** | Both IIFE modules | `state` inside `game.js` is private; `currentStage` inside `hangman.js` is private |
| **Revealing Module Pattern** | `game.js` | `return { init };` — only exposes `init()` publicly |
| **Arrow Functions** | Everywhere | `const $ = (id) => document.getElementById(id)` |
| **Template Literals** | `renderLevelSelect()`, `renderField()` | `` `Level ${lvl.id}` `` |
| **Destructuring** | `fields.js` Validators loops | `for (const [k, v] of Object.entries(attrs))` |
| **Object Spread** | `hangman.js createXEyes()` | `{ x1: ..., ...xProps }` |
| **Short-Circuit Evaluation** | DOM helpers | `const el = $(id); if(el) el.classList.remove(...)` |
| **Regex (Regular Expressions)** | `Validators` in `fields.js` | `/^([a-zA-Z0-9_\-.]+)@.../` |
| **Array Methods** | `game.js`, `fields.js` | `.forEach()`, `.includes()`, `.push()` |
| **DOM Manipulation** | `game.js` helpers, `hangman.js` | `createElement`, `appendChild`, `innerHTML`, `classList` |
| **Event Listeners** | `bindEvents()` in `game.js` | `btn.addEventListener('click', fn)` |
| **setTimeout** | `onCorrect()`, `onWrong()` | `setTimeout(() => renderField(), 900)` |
| **requestAnimationFrame** | `hangman.js buildSVG()` | Triggers `.paper-new` class after paint |
| **document.createElementNS** | `hangman.js` | Creates SVG elements with SVG namespace |
| **const / let** | Global scope, function scope | `const LEVELS = [...]`; `let state = {...}` |
| **Ternary Operator** | `updateHUD()`, `onCorrect()` | `i < state.lives ? '❤️' : '🖤'` |
| **Optional Chaining (safe access)** | DOM helpers | `if(el) el.classList.remove(...)` |
| **Math.min / Math.max / Math.round** | Score, SVG offset | `Math.min(stage * 15, 80)` |
| **String methods** | Validators | `.trim()`, `.toUpperCase()`, `.toLowerCase()` |
| **Number.toLocaleString()** | Score display | `state.score.toLocaleString()` → "1,234" |
| **try/catch** | `submitField()` in `game.js` | Safely catches validator errors |
| **Modulo operator (%)** | `hangman.js` paper colors/stamps | `colors[i % colors.length]` |
| **DOMContentLoaded** | `game.js` boot | Waits for HTML to load before running `init()` |
| **Object.entries()** | `hangman.js makeSVGEl()` | Iterates over attribute key-value pairs |
| **String repeat** | Level complete lives display | `'❤️'.repeat(state.lives)` |

---

## 9. 📄 HTML Concepts Reference Table

| Concept | Where Used |
|---|---|
| **Semantic HTML5 elements** | `<main>`, `<section>`, `<header>`, `<footer>`, `<aside>`, `<article>` |
| **ARIA attributes** | `aria-live`, `aria-label`, `aria-hidden`, `role="..."` |
| **Meta tags (SEO)** | `<meta charset>`, `<meta name="description">`, `<meta name="viewport">` |
| **Data URI favicon** | `<link rel="icon" href="data:image/svg+xml,...">` — inline SVG emoji |
| **`<label for="...">` association** | `<label for="field-input">` links to `<input id="field-input">` |
| **`<pre>` element** | `#hint-content` — preserves whitespace formatting in hints |
| **`role="progressbar"` + aria values** | `#field-progress-track` with `aria-valuemin/max/now` |
| **`aria-live="polite"`** | Score, streak, field counter — non-interruptive announcements |
| **`aria-live="assertive"`** | Feedback div, game over screen — urgent announcements |
| **`autocomplete="off"`** | `#field-input` — prevents browser autofill cheating |
| **`spellcheck="false"`** | `#field-input` — prevents red squiggly lines on codes |
| **Script loading order** | `fields.js` → `hangman.js` → `game.js` (dependency order) |
| **Inline styles on elements** | `.bg-paper` elements — custom animation timing per paper |
| **Structural comments** | `<!-- SCREEN: START -->` blocks separating each screen in HTML |
| **`&middot;`** | HTML entity for the `·` dot character in logo tagline |

---

## 10. 🎨 CSS Concepts Reference Table

| Concept | Where Used |
|---|---|
| **CSS Custom Properties (Variables)** | `:root { --navy-950: ... }` — entire design system |
| **CSS Reset** | `*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }` |
| **Flexbox** | `#screen-start`, `#game-hud`, `.mini-rules`, `.hud-stats`, `.field-actions` |
| **CSS Grid** | `#game-body` (2 columns), `#level-select-grid` (auto-fill responsive) |
| **`display: none !important`** | `.hidden` utility class — removes element from layout |
| **@keyframes** | 10 named animations: `float`, `paper-drop`, `shake`, `drift`, etc |
| **CSS Transitions** | `.level-card`, `#field-input`, `#field-progress-bar` — smooth changes |
| **Pseudo-classes** | `:hover`, `:focus`, `:disabled`, `:active`, `:first-child`, `:last-child` |
| **Pseudo-elements** | `::before`, `::after` for overlay effects; `::-webkit-scrollbar` |
| **CSS Gradients** | `linear-gradient`, `radial-gradient` on body, buttons, cards |
| **Gradient Text** | `-webkit-background-clip: text` + `-webkit-text-fill-color: transparent` on logo |
| **`backdrop-filter: blur()`** | `#game-hud` — glassmorphism blur effect |
| **`filter: drop-shadow()`** | `.logo-emoji` — glow effect on emoji |
| **`filter: grayscale(1)`** | `.heart-lost` — greyscale lost hearts |
| **`box-shadow` for glow** | `var(--glow-gold)` — ambient colored glow |
| **`position: sticky`** | `#game-hud` — stays at top while scrolling |
| **`position: fixed`** | `.bg-papers` — always covers full viewport |
| **`position: absolute`** | `.done-badge`, `.pw-toggle`, `::before/after` overlays |
| **`z-index`** | `#game-hud: 100`, `.bg-papers: 0` — stacking order |
| **`clamp()`** | `.logo-title font-size` — fluid responsive scaling |
| **`min-height: 100vh`** | All screens — always fill full viewport height |
| **`overflow: hidden`** | `.level-card`, `#paper-panel`, `#game-hud` — prevents overflow |
| **`overflow-y: auto`** | `#form-panel` — scrollable when content overflows |
| **`border-radius`** | Variables `--radius`, `--radius-sm`, `--radius-lg` used throughout |
| **`letter-spacing`** | Badge labels, HUD labels — uppercase letter spacing |
| **`font-family`** | `Inter` for body text, `JetBrains Mono` for code/scores |
| **`@import url()`** | Google Fonts import at top of CSS |
| **`@media` queries** | `max-width: 768px` and `max-width: 480px` breakpoints |
| **`transform`** | `translateY`, `scale`, `rotate`, `translateX` in animations |
| **CSS animation shorthand** | `animation: float 3s ease-in-out infinite` |
| **`pointer-events: none`** | `.bg-papers`, `.confetti-bg` — decorative, not clickable |
| **`white-space: pre-wrap`** | `#hint-content` — respects newlines in hint text |
| **`animation-delay`** | `.bg-paper` inline styles — staggers paper start times |

---

## 11. 🚫 Bootstrap Usage Note

> **Bootstrap is NOT used in this project.**

All styling is written from scratch using **pure Vanilla CSS**. However, you will notice some class names that look like Bootstrap:

| Class Name | Looks Like Bootstrap? | Actually Is... |
|---|---|---|
| `.btn` | ✅ Yes | Custom CSS class in `game.css` |
| `.btn-primary` | ✅ Yes | Custom gold gradient button style |
| `.btn-secondary` | ✅ Yes | Custom dark navy button style |
| `.btn-danger` | ✅ Yes | Custom red gradient button style |
| `.btn-success` | ✅ Yes | Custom green gradient button style |
| `.btn-lg` / `.btn-sm` | ✅ Yes | Custom size modifiers |
| `.hidden` | ✅ Yes | Custom utility; Bootstrap uses `.d-none` |
| `.container` | ❌ Not used | Not present |
| `.row` / `.col-*` | ❌ Not used | Not present — uses CSS Grid instead |

**The naming is intentional** — it follows **BEM-like conventions** to be readable, not because Bootstrap is included. No `<link>` to Bootstrap CDN exists in `index.html`.

---

## 12. 🔧 Customization Guide

### 12.1 ➕ How to Add a New Level

Open `js/fields.js` and add a new object to the `LEVELS` array:

```javascript
{
  id: 9,
  title: 'My New Level',
  subtitle: 'Level 9 — My Theme',
  scenario: 'The story context for this level...',
  icon: '🌟',
  isBoss: false,          // Set true for BOSS badge
  fields: [
    {
      id: 'myField',
      label: 'My Field Label',
      type: 'text',
      placeholder: 'Enter something...',
      difficulty: DIFFICULTY.EASY,
      points: 100,
      hint: 'The validation rule explanation',
      example: 'valid_example_here',
      requiredMsg: 'This field is required.',
      invalidMsg: 'Wrong format. Try again.',
      validate: (v) => v.trim().length > 0  // Your validation logic here
    }
  ]
}
```

That's it. The level will automatically appear in the level grid.

---

### 12.2 ➕ How to Add a New Validator

Open `js/fields.js` and add to the `Validators` object:

```javascript
const Validators = {
  // ... existing validators ...
  
  // Your new validator:
  zipCode: (v) => /^\d{5}$/.test(v.trim()),  // US 5-digit zip code
};
```

Then use it in any field's `validate` property:
```javascript
validate: (v) => Validators.zipCode(v)
```

---

### 12.3 🎨 How to Change Colors

Open `css/game.css` and edit the `:root` variables:

```css
:root {
  --gold-400: #fbbf24;   /* Change this to change ALL gold accent colors */
  --navy-950: #020617;   /* Change this to change the darkest background */
  --green-400: #4ade80;  /* Change this to change all success/correct colors */
  --red-500: #ef4444;    /* Change this to change all error/danger colors */
}
```

One variable change updates every element using that color token automatically.

---

### 12.4 🏆 How to Change the Scoring System

Open `js/game.js` and edit the `POINTS` constant:

```javascript
const POINTS = {
  firstTry: 100,         // Points for correct on first attempt → change to 200 for more reward
  secondTry: 50,         // Points for correct on second attempt → change to 25 for harsher
  levelBonus: 200,       // Bonus for completing a level
  perfectBonus: 300,     // Bonus for perfect run (no lives lost)
  hintPenalty: -30,      // Penalty for using a lifeline → make 0 to remove penalty
  streakThreshold: 3,    // Answers needed to activate streak → change to 2 for easier streaks
  streakMultiplier: 1.5, // Score multiplier when streaking → change to 2.0 for bigger bonus
};
```

---

### 12.5 ❤️ How to Change the Number of Lives

Lives are hardcoded as `6` in two places. Change both:

**In `js/game.js`:**
```javascript
state.lives = 6;  // ← Change to any number (line ~11 and ~80 in startLevel)
```

**In `js/hangman.js`:**
```javascript
const MAX_LIVES = 6;  // ← Change to match (top of file)
```

Also update `createPapers()` — the `stamps` and `colors` arrays should have at least as many entries as your new MAX_LIVES count.

---

### 12.6 💡 How to Add a New Lifeline Type

**Step 1:** Add a button to `index.html` inside `#lifelines-panel`:
```html
<button id="btn-my-lifeline" class="lifeline-btn" type="button">
  🎲 My Lifeline
  <span class="ll-count" id="ll-mylifeline-count">2</span>
</button>
```

**Step 2:** Add to `state.lifelines` in `js/game.js`:
```javascript
lifelines: { showRule: 3, showFormat: 3, skipField: 3, myLifeline: 2 }
```

**Step 3:** Add the handler function in `game.js`:
```javascript
function useMyLifeline() {
  if (state.lifelines.myLifeline <= 0) return;
  state.lifelines.myLifeline--;
  updateLifelines();
  // Your logic here
}
```

**Step 4:** Add to `updateLifelines()`:
```javascript
setText('ll-mylifeline-count', state.lifelines.myLifeline);
if (state.lifelines.myLifeline <= 0) { const b = $('btn-my-lifeline'); if(b) b.disabled = true; }
```

**Step 5:** Add to `bindEvents()`:
```javascript
const myBtn = $('btn-my-lifeline');
if (myBtn) myBtn.addEventListener('click', useMyLifeline);
```

---

### 12.7 🎭 How to Change the Character's Appearance

Open `js/hangman.js` and find `createCharacter(stage)`. The character is drawn with SVG shapes:

```javascript
// Change body color (currently blue)
const body = makeSVGEl('rect', { fill: '#3B82F6', stroke: '#1D4ED8', ... });

// Change skin color (currently yellow/amber)
const head = makeSVGEl('ellipse', { fill: '#FBBF24', stroke: '#F59E0B', ... });

// Change hair color (currently dark gray)
const hair = makeSVGEl('ellipse', { fill: '#374151', ... });

// Change tie color (currently red)
const tie = makeSVGEl('polygon', { fill: '#EF4444', stroke: '#B91C1C', ... });
```

You can also modify the SVG coordinates (`x`, `y`, `cx`, `cy`, `rx`, `ry`) to reshape body parts. The viewBox is `0 0 340 400` — coordinates are within that space.

---

### 12.8 📖 How to Change Scenario Text

Open `js/fields.js` and find the level object. Change the `scenario` property:

```javascript
{
  id: 1,
  scenario: 'Your new story text here. Make it dramatic!',
  ...
}
```

---

### 12.9 🔧 How to Make a Field a Dropdown Instead of Text Input

Currently all fields use text inputs. To add a `<select>`, modify `renderField()` in `game.js`:

```javascript
// In renderField(), inside the inputArea section:
if (field.type === 'select') {
  let opts = field.options.map(o => `<option value="${o}">${o}</option>`).join('');
  inputHTML = `<select id="field-input">${opts}</select>`;
}
```

Then add to the field definition in `fields.js`:
```javascript
type: 'select',
options: ['Option A', 'Option B', 'Option C'],
validate: (v) => ['Option A', 'Option B', 'Option C'].includes(v)
```

---

*End of Documentation — Happy Hacking! 🚀*
