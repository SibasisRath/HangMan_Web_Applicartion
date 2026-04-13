
// ============================================================
// game.js — Core Game Logic, Lives, Scoring, State
// ============================================================

const Game = (() => {
  // ── STATE ───────────────────────────────────────────────────
  let state = {
    currentLevel: 0,       // index into LEVELS
    currentFieldIndex: 0,  // index into current level's fields
    lives: 6,
    score: 0,
    streak: 0,
    multiplier: 1,
    lifelines: { showRule: 3, showFormat: 3, skipField: 3 },
    attemptsOnField: 0,    // how many wrong tries on this field
    fieldContext: {},       // cross-field data (e.g. newPassword)
    completedLevels: [],
    gameStarted: false,
    gameOver: false,
    levelComplete: false,
    allLevelsComplete: false,
  };

  // ── SCORING ──────────────────────────────────────────────────
  const POINTS = {
    firstTry: 100,
    secondTry: 50,
    levelBonus: 200,
    perfectBonus: 300,
    hintPenalty: -30,
    streakThreshold: 3,
    streakMultiplier: 1.5,
  };

  // ── DOM HELPERS ──────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const show = (id) => { const el = $(id); if(el) el.classList.remove('hidden'); };
  const hide = (id) => { const el = $(id); if(el) el.classList.add('hidden'); };
  const setText = (id, text) => { const el = $(id); if(el) el.textContent = text; };
  const setHTML = (id, html) => { const el = $(id); if(el) el.innerHTML = html; };

  // ── SCREENS ──────────────────────────────────────────────────
  function showScreen(name) {
    ['screen-start','screen-game','screen-level-complete','screen-game-over','screen-win'].forEach(hide);
    show('screen-' + name);
  }

  // ── INIT ──────────────────────────────────────────────────────
  function init() {
    renderLevelSelect();
    showScreen('start');
    PaperPile.init();
    bindEvents();
    initCarouselDrag();
  }

  // ── CAROUSEL: VIRTUAL INFINITE SCROLL ────────────────────────
  // Uses an unbounded virtual position (vScroll) normalized via
  // modular arithmetic so right-drag can NEVER hit a hard boundary.
  function initCarouselDrag() {
    const grid = $('level-select-grid');
    if (!grid) return;

    const SPEED   = 0.7;    // px per frame for auto-scroll
    let vScroll   = 0;      // virtual position — unbounded, can be negative
    let initialized = false;

    let isPaused   = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragVStart = 0;     // vScroll value at the moment mousedown fires

    // ── Core: normalize vScroll → scrollLeft ─────────────────
    // Uses JS modulo trick so any positive/negative number maps cleanly
    // into [0, half).  Works for dragging in BOTH directions.
    function applyScroll(v) {
      const h = grid.scrollWidth / 2;
      if (!h) return;
      // ((v % h) + h) % h handles negatives correctly in JS
      const pos = ((v % h) + h) % h;
      grid.scrollLeft = pos;
      vScroll = pos;        // keep vScroll in sync with normalized position
    }

    // ── RAF tick (auto-scroll + one-time init) ────────────────
    function tick() {
      if (!initialized) {
        const h = grid.scrollWidth / 2;
        if (h > 0) {
          // Start at midpoint of duplicated content
          vScroll = h;
          grid.scrollLeft = h;
          initialized = true;
        }
      }

      if (initialized && !isPaused && !isDragging) {
        vScroll += SPEED;
        applyScroll(vScroll);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // ── Hover: pause / resume ─────────────────────────────────
    grid.addEventListener('mouseenter', () => { isPaused = true; });
    // Only resume auto-scroll if the user isn't still holding the mouse
    grid.addEventListener('mouseleave', () => { if (!isDragging) isPaused = false; });

    // ── Mouse drag ────────────────────────────────────────────
    grid.addEventListener('mousedown', (e) => {
      isDragging  = true;
      grid._wasDragging = false;
      grid.classList.add('dragging');
      dragStartX  = e.clientX;
      dragVStart  = vScroll;   // capture normalized position at drag start
    });

    // Attached to document so fast sweeps outside the grid don't drop the drag
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.clientX - dragStartX;
      // dragVStart - dx can go NEGATIVE → applyScroll wraps seamlessly
      applyScroll(dragVStart - dx);
      if (Math.abs(dx) > 4) grid._wasDragging = true;
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      isPaused   = false;         // cursor still on grid → mouseenter already set true; mouseup overrides
      grid.classList.remove('dragging');
      // Re-check if cursor is still inside the grid to reset isPaused
      setTimeout(() => {
        grid._wasDragging = false;
        // If mouse is still hovering keep paused — mouseenter already fired
      }, 50);
    });

    // ── Touch drag ────────────────────────────────────────────
    let touchStartX = 0;
    let touchVStart = 0;

    grid.addEventListener('touchstart', (e) => {
      isPaused    = true;
      touchStartX = e.touches[0].clientX;
      touchVStart = vScroll;
    }, { passive: true });

    grid.addEventListener('touchmove', (e) => {
      const dx = touchStartX - e.touches[0].clientX;
      // Same modulo approach — works in both touch directions
      applyScroll(touchVStart + dx);
    }, { passive: true });

    grid.addEventListener('touchend', () => {
      isPaused = false;
    });
  }

  function renderLevelSelect() {
    const grid = $('level-select-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Build one set of cards, then duplicate it for seamless infinite scroll.
    // The CSS animation scrolls translateX(0) → translateX(-50%) then resets.
    function makeCard(lvl, i) {
      const div = document.createElement('div');
      div.className = 'level-card' + (state.completedLevels.includes(i) ? ' completed' : '');
      div.innerHTML = `
        <span class="level-icon">${lvl.icon}</span>
        <span class="level-num">Level ${lvl.id}</span>
        <span class="level-title-card">${lvl.title}</span>
        ${lvl.isBoss ? '<span class="boss-badge">BOSS</span>' : ''}
        ${state.completedLevels.includes(i) ? '<span class="done-badge">✓</span>' : ''}
      `;
      return div;
    }

    // Original set — has real click listeners
    LEVELS.forEach((lvl, i) => {
      const card = makeCard(lvl, i);
      card.addEventListener('click', () => {
        // Ignore click if it was the end of a drag
        if (grid._wasDragging) return;
        startLevel(i);
      });
      grid.appendChild(card);
    });

    // Duplicate set — identical visually but no click listeners needed
    // (user will have looped back to originals before clicking)
    LEVELS.forEach((lvl, i) => {
      const clone = makeCard(lvl, i);
      clone.setAttribute('aria-hidden', 'true');
      clone.addEventListener('click', () => {
        if (grid._wasDragging) return;
        startLevel(i);
      });
      grid.appendChild(clone);
    });
  }

  // ── START LEVEL ──────────────────────────────────────────────
  function startLevel(levelIndex) {
    state.currentLevel = levelIndex;
    state.currentFieldIndex = 0;
    state.lives = 6;
    state.score = 0;
    state.streak = 0;
    state.multiplier = 1;
    state.lifelines = { showRule: 3, showFormat: 3, skipField: 3 };
    state.attemptsOnField = 0;
    state.fieldContext = {};
    state.gameOver = false;
    state.levelComplete = false;

    const level = LEVELS[levelIndex];
    PaperPile.reset();

    // Set level header
    setText('current-level-label', `Level ${level.id} — ${level.title}`);
    setText('level-subtitle', level.subtitle);
    setText('scenario-text', level.scenario);
    updateHUD();
    updateLifelines();

    showScreen('game');
    renderField();
  }

  // ── RENDER FIELD ─────────────────────────────────────────────
  function renderField() {
    const level = LEVELS[state.currentLevel];
    const field = level.fields[state.currentFieldIndex];
    const total = level.fields.length;
    const current = state.currentFieldIndex + 1;

    // Progress bar
    const pct = ((current - 1) / total) * 100;
    const bar = $('field-progress-bar');
    if (bar) bar.style.width = pct + '%';
    setText('field-counter', `Field ${current} of ${total}`);

    // Difficulty badge
    const diffMap = { easy: { label: '🟢 Easy', cls: 'diff-easy' }, medium: { label: '🟡 Medium', cls: 'diff-medium' }, hard: { label: '🔴 Hard', cls: 'diff-hard' } };
    const diff = diffMap[field.difficulty] || diffMap.easy;
    const badge = $('difficulty-badge');
    if (badge) { badge.textContent = diff.label; badge.className = 'difficulty-badge ' + diff.cls; }

    // Field label
    setText('field-label', field.label);

    // Field input
    const inputArea = $('field-input-area');
    if (inputArea) {
      let inputHTML = '';
      if (field.type === 'password') {
        inputHTML = `<div class="pw-wrap"><input id="field-input" type="password" placeholder="${field.placeholder}" autocomplete="off" spellcheck="false"><button type="button" id="toggle-pw" class="pw-toggle" aria-label="Toggle password">👁</button></div>`;
      } else {
        inputHTML = `<input id="field-input" type="text" placeholder="${field.placeholder}" autocomplete="off" spellcheck="false">`;
      }
      inputArea.innerHTML = inputHTML;

      const input = $('field-input');
      if (input) {
        input.focus();
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitField(); });
      }
      const togglePw = $('toggle-pw');
      if (togglePw) {
        togglePw.addEventListener('click', () => {
          const inp = $('field-input');
          if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
        });
      }
    }

    // Clear feedback
    const feedback = $('field-feedback');
    if (feedback) { feedback.textContent = ''; feedback.className = 'field-feedback'; }

    // Hide hint by default
    const hintBox = $('hint-box');
    if (hintBox) hintBox.classList.add('hidden');

    // Update points preview
    setText('field-points', `+${field.points} pts`);
  }

  // ── SUBMIT FIELD ─────────────────────────────────────────────
  function submitField() {
    const level = LEVELS[state.currentLevel];
    const field = level.fields[state.currentFieldIndex];
    const input = $('field-input');
    const val = input ? input.value : '';

    // Validate
    let isValid = false;
    try {
      isValid = field.validate(val, state.fieldContext);
    } catch(e) {
      isValid = false;
    }

    if (isValid) {
      // Save context
      if (field.onValidate) field.onValidate(val, state.fieldContext);
      else if (field.id === 'newPassword') state.fieldContext.newPassword = val;

      onCorrect(field);
    } else {
      onWrong(field, val);
    }
  }

  function onCorrect(field) {
    state.streak++;
    if (state.streak >= POINTS.streakThreshold) state.multiplier = POINTS.streakMultiplier;
    const pts = state.attemptsOnField === 0 ? POINTS.firstTry : POINTS.secondTry;
    const earned = Math.round(pts * state.multiplier) + (state.attemptsOnField === 0 ? field.points - 100 : 0);
    addScore(Math.max(earned, 10));
    state.attemptsOnField = 0;

    // Feedback
    showFeedback('✅ Correct! +' + Math.round(pts * state.multiplier) + ' pts', 'correct');

    // Flash HUD
    flashScore();

    // Move to next field after short delay
    setTimeout(() => {
      state.currentFieldIndex++;
      if (state.currentFieldIndex >= LEVELS[state.currentLevel].fields.length) {
        onLevelComplete();
      } else {
        renderField();
      }
    }, 900);
  }

  function onWrong(field, val) {
    state.streak = 0;
    state.multiplier = 1;
    state.attemptsOnField++;

    // Lose a life
    state.lives--;
    PaperPile.addPaper();
    updateHUD();
    shakePaperPanel();

    // Determine error
    let msg = '';
    if (!val || val.trim() === '') {
      msg = field.requiredMsg || 'This field is required.';
    } else {
      msg = field.invalidMsg || 'Incorrect format.';
    }
    showFeedback('❌ ' + msg, 'wrong');

    if (state.lives <= 0) {
      setTimeout(onGameOver, 1200);
    }
  }

  // ── LEVEL COMPLETE ────────────────────────────────────────────
  function onLevelComplete() {
    const level = LEVELS[state.currentLevel];
    const wasPerfect = state.lives === 6;

    // Bonuses
    let bonus = POINTS.levelBonus;
    if (wasPerfect) bonus += POINTS.perfectBonus;
    addScore(bonus);

    if (!state.completedLevels.includes(state.currentLevel)) {
      state.completedLevels.push(state.currentLevel);
    }

    // Update complete screen
    setText('complete-level-title', `✅ ${level.title}`);
    setText('complete-bonus', `+${bonus} bonus pts`);
    setText('complete-score', `Score: ${state.score}`);
    setText('complete-lives', `Lives remaining: ${'❤️'.repeat(state.lives)}`);
    setText('complete-perfect', wasPerfect ? '🏆 Perfect Run! +300 bonus!' : '');

    const nextBtn = $('btn-next-level');
    if (nextBtn) {
      if (state.currentLevel + 1 < LEVELS.length) {
        nextBtn.textContent = `Next: Level ${LEVELS[state.currentLevel + 1].id} ${LEVELS[state.currentLevel + 1].icon}`;
        nextBtn.onclick = () => startLevel(state.currentLevel + 1);
      } else {
        nextBtn.textContent = '🏆 See Final Results';
        nextBtn.onclick = onAllComplete;
      }
    }

    showScreen('level-complete');
  }

  // ── GAME OVER ─────────────────────────────────────────────────
  function onGameOver() {
    const level = LEVELS[state.currentLevel];
    setText('gameover-level', `Failed at: Level ${level.id} — ${level.title}`);
    setText('gameover-score', `Final Score: ${state.score}`);
    setText('gameover-msg', '📄 You\'ve been buried under rejected forms. The pile won.');
    showScreen('game-over');
  }

  // ── ALL LEVELS COMPLETE ───────────────────────────────────────
  function onAllComplete() {
    setText('win-score', `Final Score: ${state.score}`);
    setText('win-levels', `All ${LEVELS.length} levels complete!`);
    showScreen('win');
  }

  // ── LIFELINES ─────────────────────────────────────────────────
  function useShowRule() {
    if (state.lifelines.showRule <= 0) return;
    state.lifelines.showRule--;
    addScore(POINTS.hintPenalty);
    updateLifelines();
    updateHUD();

    const field = LEVELS[state.currentLevel].fields[state.currentFieldIndex];
    showHint('📖 Rule: ' + field.hint);
  }

  function useShowFormat() {
    if (state.lifelines.showFormat <= 0) return;
    state.lifelines.showFormat--;
    addScore(POINTS.hintPenalty);
    updateLifelines();
    updateHUD();

    const field = LEVELS[state.currentLevel].fields[state.currentFieldIndex];
    showHint('👁 Valid Example: ' + field.example);
  }

  function useSkipField() {
    if (state.lifelines.skipField <= 0) return;
    state.lifelines.skipField--;
    updateLifelines();

    showFeedback('⏭️ Field skipped. No points.', 'skip');
    state.attemptsOnField = 0;
    state.streak = 0;
    state.multiplier = 1;

    setTimeout(() => {
      state.currentFieldIndex++;
      if (state.currentFieldIndex >= LEVELS[state.currentLevel].fields.length) {
        onLevelComplete();
      } else {
        renderField();
      }
    }, 700);
  }

  function showHint(text) {
    const box = $('hint-box');
    const content = $('hint-content');
    if (box && content) {
      content.textContent = text;
      box.classList.remove('hidden');
    }
  }

  // ── HUD / UI UPDATES ──────────────────────────────────────────
  function updateHUD() {
    // Lives hearts
    const livesEl = $('lives-display');
    if (livesEl) {
      livesEl.innerHTML = '';
      for (let i = 0; i < 6; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart ' + (i < state.lives ? 'heart-alive' : 'heart-lost');
        heart.textContent = i < state.lives ? '❤️' : '🖤';
        livesEl.appendChild(heart);
      }
    }
    setText('score-display', state.score.toLocaleString());
    setText('streak-display', state.streak > 0 ? `🔥 x${state.streak}` : '—');
  }

  function updateLifelines() {
    setText('ll-rule-count', state.lifelines.showRule);
    setText('ll-format-count', state.lifelines.showFormat);
    setText('ll-skip-count', state.lifelines.skipField);

    ['btn-show-rule','btn-show-format','btn-skip'].forEach(id => {
      const btn = $(id);
      if (!btn) return;
      btn.disabled = false;
    });
    if (state.lifelines.showRule <= 0) { const b = $('btn-show-rule'); if(b) b.disabled = true; }
    if (state.lifelines.showFormat <= 0) { const b = $('btn-show-format'); if(b) b.disabled = true; }
    if (state.lifelines.skipField <= 0) { const b = $('btn-skip'); if(b) b.disabled = true; }
  }

  function showFeedback(msg, type) {
    const el = $('field-feedback');
    if (!el) return;
    el.textContent = msg;
    el.className = 'field-feedback fb-' + type;

    // Shake input on wrong
    if (type === 'wrong') {
      const input = $('field-input');
      if (input) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 600);
      }
    }
  }

  function addScore(pts) {
    state.score = Math.max(0, state.score + pts);
    setText('score-display', state.score.toLocaleString());
  }

  function flashScore() {
    const el = $('score-display');
    if (el) {
      el.classList.add('score-flash');
      setTimeout(() => el.classList.remove('score-flash'), 500);
    }
  }

  function shakePaperPanel() {
    const panel = $('paper-panel');
    if (panel) {
      panel.classList.add('shake-panel');
      setTimeout(() => panel.classList.remove('shake-panel'), 500);
    }
  }

  // ── EVENT BINDING ─────────────────────────────────────────────
  function bindEvents() {
    const sb = $('btn-submit-field');
    if (sb) sb.addEventListener('click', submitField);

    const ruleBtn = $('btn-show-rule');
    if (ruleBtn) ruleBtn.addEventListener('click', useShowRule);

    const fmtBtn = $('btn-show-format');
    if (fmtBtn) fmtBtn.addEventListener('click', useShowFormat);

    const skipBtn = $('btn-skip');
    if (skipBtn) skipBtn.addEventListener('click', useSkipField);

    const startBtn = $('btn-start');
    if (startBtn) startBtn.addEventListener('click', () => startLevel(0));

    const retryBtn = $('btn-retry');
    if (retryBtn) retryBtn.addEventListener('click', () => startLevel(state.currentLevel));

    const menuBtn1 = $('btn-menu-go');
    if (menuBtn1) menuBtn1.addEventListener('click', () => { renderLevelSelect(); showScreen('start'); });

    const menuBtnComplete = $('btn-menu-from-complete');
    if (menuBtnComplete) menuBtnComplete.addEventListener('click', () => { renderLevelSelect(); showScreen('start'); });

    const menuBtn2 = $('btn-menu-from-over');
    if (menuBtn2) menuBtn2.addEventListener('click', () => { renderLevelSelect(); showScreen('start'); });

    const menuBtn3 = $('btn-menu-from-win');
    if (menuBtn3) menuBtn3.addEventListener('click', () => { renderLevelSelect(); showScreen('start'); });

    const playAgain = $('btn-play-again');
    if (playAgain) playAgain.addEventListener('click', () => {
      state.completedLevels = [];
      state.score = 0;
      renderLevelSelect();
      showScreen('start');
    });

    const closeHint = $('btn-close-hint');
    if (closeHint) closeHint.addEventListener('click', () => {
      const box = $('hint-box');
      if (box) box.classList.add('hidden');
    });
  }

  // ── PUBLIC ────────────────────────────────────────────────────
  return { init };
})();

// ── BOOT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
