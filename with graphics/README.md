# Form or Fail — A Bureaucracy Hangman Game

![Game Screenshot](./assets/screenshots/game-cover.png)

## Overview

**Form or Fail** is an interactive web-based game that combines the classic Hangman gameplay with a unique bureaucratic form validation theme. Guide a hapless office worker through 8 levels of increasingly complex form validation challenges. Every incorrect submission adds a rejected paper to the pile — collect 6 papers and it's game over!

A clever, gamified twist on learning real-world form validation rules through engaging, story-driven scenarios.

---

## Game Concept

### Theme: Corporate Bureaucracy
The game immerses players in a humorous corporate world where:
- **The Hero**: An office worker buried under mounting paperwork
- **The Challenge**: Fill out forms correctly according to strict validation rules
- **The Stakes**: 6 lives (rejected papers) before game over
- **The Prize**: Progress through 8 themed levels from basic Authentication to the ultimate Boss Level

### Core Mechanic: Smart Hangman
Instead of guessing letters, players validate form fields by entering data that satisfies real-world validation rules (email formats, password requirements, postal codes, etc.). Wrong entries cost lives; mastery earns bonuses and streaks.

---

## Features

✨ **8 Progressive Levels**
- Level 1: Authentication (Email, Password)
- Level 2: Personal Info (First Name, Last Name, Date of Birth)
- Level 3: Contact Details (Phone, Postal Code)
- Level 4: Regional (Belgian VAT, Bank, GST)
- Level 5: Finance (Currency, Account Numbers)
- Level 6: Addresses (Street, City, Country)
- Level 7: Advanced Validation (File uploads, Gender, Title)
- Level 8: Boss Level (The Ultimate Chaos — Mix of everything)

⚙️ **Sophisticated Validation Rules**
- Email, passwords (complex), names, dates, birthdates
- Phone numbers (Belgian format)
- VAT/Tax IDs (EU & International)
- Currency formats (EUR, USD)
- File extensions (images, documents, video, audio)
- Custom confirmations (e.g., password matching)

🎮 **Interactive Gameplay**
- 6 lives per level
- Real-time score tracking with multipliers
- Achievement system (streaks, perfect levels)
- 3 Smart Lifelines:
  - **Show Rule**: Displays validation rules
  - **Show Format**: Shows correct format example
  - **Skip Field**: Passes current field
- Animated paper pile that grows with each wrong answer
- Music toggle and sound effects

🎨 **Polished UI/UX**
- Dark corporate navy + gold accent theme
- Smooth animations and transitions
- Responsive carousel for level selection
- Accessibility-first design (ARIA labels, semantic HTML)
- Whimsical floating background decorations
- SVG-rendered character and paper pile animations

📱 **Responsive Design**
- Works on desktop, tablet, and mobile
- Touch-friendly carousel navigation
- Scalable vector graphics

---

## Technologies Used

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic markup, accessibility (ARIA) |
| **CSS3** | Modern layout (Flexbox, Grid), animations, theming |
| **Vanilla JavaScript (ES6)** | Game logic, state management, DOM manipulation |
| **SVG** | Animated character and paper pile graphics |
| **Web Audio API** | Sound effects and music |
| **Google Fonts** | Inter (UI) and JetBrains Mono (code/hints) |

No frameworks, no build tools — pure, clean, modular JavaScript.

---

## Project Structure

```
with graphics/
├── index.html              # Main game HTML
├── css/
│   └── game.css           # All styling (variables, responsive)
├── js/
│   ├── game.js            # Core game logic, state, scoring
│   ├── hangman.js         # Paper pile animation & SVG rendering
│   ├── fields.js          # All validation rules & field definitions
│   └── sound.js           # Sound effects & music management
└── assets/
    └── sounds/            # Audio files (music, SFX)
        ├── background-music.mp3
        ├── correct.mp3
        ├── wrong.mp3
        ├── level-complete.mp3
        ├── game-over.mp3
        └── game-win.mp3
```

---

## File Descriptions

### `index.html`
Main game interface with:
- Start / Main Menu screen (level selection carousel)
- Game screen (HUD + form fields + paper pile)
- Level Complete screen
- Game Over screen
- Win screen
- Semantic HTML with full ARIA accessibility

### `js/game.js`
**Core Game Engine**
- State management (lives, score, level, streaks)
- Scoring system with multipliers and bonuses
- Screen transitions
- Level progression
- Event binding (button clicks, form submissions)
- Carousel navigation logic

Key Classes/Modules:
- `Game` (IIFE) — Main game controller
- State object tracking: current level, lives, score, streak, multiplier, lifelines
- Scoring constants: First-try bonus, hint penalties, level bonuses

### `js/hangman.js`
**Character & Paper Pile Animation**
- SVG generation for 6-stage paper pile progression
- Character expressions that change with game state
- Desk/workspace rendering
- Paper flip & tumble animations
- Stage management and visual feedback

### `js/fields.js`
**Form Field Definitions & Validators**
- Validator functions for all field types:
  - Identity: Email, Password, Names, Dates
  - Contact: Phone, Postal Code
  - Regional: Belgian VAT, Bank IBAN, GST
  - Finance: Currency formats
  - File Uploads: Image, Document, Video, Audio
  - Special: reCAPTCHA, Gender, Title, Nationality
- 8 complete level definitions with:
  - Field configurations
  - Validation rules
  - Help text & examples
  - Points & difficulty
  - Storyline & scenario descriptions

### `js/sound.js`
**Audio Management**
- Background music playback with state persistence
- Sound effects triggering (correct/wrong/level complete/game over)
- Mute/unmute toggle
- Volume control

### `css/game.css`
**Complete Styling**
- CSS variables for theming (navy, gold, red, green colors)
- Responsive layouts (Flexbox, CSS Grid)
- Animations: paper float, flip, fade, pulse
- Component styles: buttons, modals, HUD, carousels
- Dark mode with radial gradient backgrounds
- Typography (Inter for UI, JetBrains Mono for code)

---

## How to Play

### 1. **Start the Game**
   - Open `index.html` in a web browser
   - Choose a level from the carousel or click "Start from Level 1"
   - Toggle music ON/OFF as desired

### 2. **Read the Scenario**
   - Each level opens with a story snippet describing the form context
   - Example: "Fill in your profile for system access"

### 3. **Fill Form Fields**
   - Read the field label and hint (if available)
   - Enter data matching the validation rules shown
   - Press Enter or click Submit

### 4. **Validation**
   - ✅ **Correct**: +100 points, move to next field
   - ❌ **Incorrect**: -1 life, paper added to pile, try again

### 5. **Use Lifelines Wisely** (3 of each per level)
   - **Show Rule**: Displays validation requirements
   - **Show Format**: Shows a correct example
   - **Skip Field**: Pass without answering (-30 points)

### 6. **Win & Lose Conditions**
   - **Win a Level**: Complete all fields, no lives lost = Perfect Bonus
   - **Lose a Level**: Reach 0 lives = Game Over
   - **Beat the Game**: Complete all 8 levels

### 7. **Scoring & Streaks**
   - Points vary by difficulty and attempt number
   - Correct consecutive answers = Streak multiplier (up to 1.5x)
   - Perfect levels earn 300-point bonuses

---

## Game Levels

| # | Title | Theme | Difficulty | Fields | Key Rules |
|---|-------|-------|------------|--------|-----------|
| 1 | Login to Your Account | Authentication | Medium | Email, Password | Complex passwords, email format |
| 2 | Employee Profile | Personal Info | Medium | First Name, Last Name, DoB | Letters only, age ≥ 18 |
| 3 | Contact Directory | Contact | Easy | Phone, Postal Code | Belgian phone, alphanumeric codes |
| 4 | Tax & Compliance | Regional | Hard | VAT ID, Bank IBAN, GST | EU/intl formats, checksums |
| 5 | Financial Records | Finance | Hard | Currency (EUR/USD), Amounts | Format-specific decimals |
| 6 | Address Book | Addresses | Medium | Street, Number, City, Country | Character limits, letter/number rules |
| 7 | Document Processing | Advanced | Hard | File upload type, Gender, Title | File extensions, predefined lists |
| 8 | All-Hands Meeting | Boss Level | CHAOS 🔥 | 10+ mixed fields | Every rule combination |

---

## Installation & Setup

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation needed — runs on any HTTP/HTTPS server

### Local Setup

**Option 1: Direct File Access**
```bash
# Simply open index.html in your browser
open with\ graphics/index.html
```

**Option 2: Local Server** (recommended for audio)
```bash
# Python 3.x
python -m http.server 8000

# Python 2.x
python -m SimpleHTTPServer 8000

# Or use any static server (Node.js http-server, etc.)
```
Then visit: `http://localhost:8000/with\ graphics/`

**Option 3: Deploy Online**
- Upload the `with graphics/` folder to any static hosting:
  - GitHub Pages
  - Vercel
  - Netlify
  - AWS S3
  - Firebase Hosting

---

## Validation Rule Examples

### Email
```
Format: name@domain.extension
Example: john.doe@company.com
Regex: ^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$
```

### Strong Password
```
Minimum: 12 characters
Must include: Uppercase, lowercase, number, special character
Example: SecurePass123!
```

### Phone (Belgian)
```
Format: +32 followed by area code + number
Example: +32 2 555 12 34
Pattern: ^\+32\s?\d{1,2}\s?\d{3}\s?\d{2}\s?\d{2}$
```

### Belgian Bank IBAN
```
Format: BE followed by 14 digits
Example: BE68539007547034
Pattern: ^BE\d{14}$
```

---

## Architecture Highlights

### Modular Design
- **IIFE Pattern**: Each module (`Game`, `PaperPile`, `Validators`) encapsulates state
- **No External Dependencies**: Pure vanilla JavaScript for maximum compatibility
- **Separation of Concerns**: Logic (game.js), UI (hangman.js), Data (fields.js), Audio (sound.js)

### State Management
Centralized state object tracks:
```javascript
{
  currentLevel,
  currentFieldIndex,
  lives,
  score,
  streak,
  multiplier,
  lifelines,
  gameStarted,
  levelComplete,
  allLevelsComplete,
  // ... more
}
```

### Event-Driven
- Button clicks trigger state changes
- Form submissions validate and score instantly
- Animations sync with state updates via `requestAnimationFrame`

### Accessibility First
- Semantic HTML (`<main>`, `<article>`, `<aside>`, `<section>`)
- ARIA labels for interactive elements
- `aria-live` updates for dynamic content
- Keyboard navigation support

---

## Extensibility

Want to add more levels or validation rules?

1. **Add a Level**: Edit `fields.js`, add an object to `LEVELS` array
2. **Add a Validator**: Create a new function in `Validators` object
3. **Add Sound Effects**: Drop .mp3 files in `assets/sounds/` and update `sound.js`
4. **Tweak Scoring**: Modify `POINTS` constants in `game.js`

---

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 60+ | ✅ Full support |
| Firefox | 55+ | ✅ Full support |
| Safari | 12+ | ✅ Full support |
| Edge | 79+ | ✅ Full support |
| IE 11 | — | ❌ Not supported |

---

## Known Limitations & Future Enhancements

### Current Scope
- Validation focused on format/pattern matching
- No backend integration (all client-side)
- No user accounts or progress saving (localStorage planned)
- Audio may require user gesture in some browsers

### Possible Enhancements
- 🔄 LocalStorage for save/resume  
- 🌍 Internationalization (French, Dutch, German)
- 🏆 Leaderboards & achievements
- 📊 Analytics dashboard
- 🎯 Difficulty modes (Easy, Normal, Hardcore)
- 🎨 Theme customization
- ♿ Enhanced screen reader support

---

## Credits

- **Game Concept & Design**: Bureaucracy meets Hangman
- **Validation Rules**: Based on real-world form standards (HTML5, EU/Belgium compliance)
- **Theme**: Dark corporate navy + gold accents
- **Accessibility**: WCAG 2.1 Level AA principles

---

## License

This project is provided as-is for educational and entertainment purposes.

---

## Getting Started Now

```bash
# Clone or download the project
cd "HangMan_Web_Applicartion/with graphics"

# Open in browser
open index.html

# Or run local server
python -m http.server 8000
# Visit: http://localhost:8000/
```

**Ready to fill some forms? The papers are waiting!** 📄  
*[Play Now](./index.html)*

---

## Changelog

**v1.0** (2026-04-14)
- Initial release with 8 complete levels
- Full validation suite
- Animations and sound effects
- Accessibility compliance

---

## Questions & Support

For issues, feature requests, or contributions, please open an issue or submit a pull request.

**Happy form-filling!** 🚀
