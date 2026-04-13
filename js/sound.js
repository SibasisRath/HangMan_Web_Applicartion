
// ============================================================
// sound.js — Sound Manager for Form or Fail
// Handles: bg_ambient, boss_music, button click, typing,
//          success, failure, level_win, level_fail
// ============================================================

const SoundManager = (() => {
  const BASE = 'assets/sounds/';

  // ── AUDIO INSTANCES ──────────────────────────────────────
  const sounds = {
    bg:        new Audio(BASE + 'bg_ambient.m4a'),
    boss:      new Audio(BASE + 'boss_music.m4a'),
    button:    new Audio(BASE + 'button click.wav'),
    typing:    new Audio(BASE + 'typing.wav'),
    success:   new Audio(BASE + 'success.mp3'),
    failure:   new Audio(BASE + 'failure.ogg'),
    level_win: new Audio(BASE + 'level_win.wav'),
    level_fail:new Audio(BASE + 'level_fail.ogg'),
  };

  // ── SETTINGS ─────────────────────────────────────────────
  let muted = true;   // OFF by default — player enables via Music button
  let activeBg = null;   // tracks which bg loop is currently playing

  // Configure loops
  sounds.bg.loop   = true;
  sounds.boss.loop = true;

  // Volume levels (0.0 – 1.0)
  sounds.bg.volume        = 0.25;
  sounds.boss.volume      = 0.35;
  sounds.button.volume    = 0.5;
  sounds.typing.volume    = 0.4;
  sounds.success.volume   = 0.7;
  sounds.failure.volume   = 0.65;
  sounds.level_win.volume = 0.75;
  sounds.level_fail.volume= 0.7;

  // ── HELPERS ───────────────────────────────────────────────
  function playSfx(key) {
    if (muted) return;
    const snd = sounds[key];
    if (!snd) return;
    snd.currentTime = 0;
    snd.play().catch(() => {}); // silence autoplay policy errors gracefully
  }

  function startLoop(key) {
    if (activeBg === key) return; // already playing this one
    // Stop whatever is currently looping
    if (activeBg && sounds[activeBg]) {
      sounds[activeBg].pause();
      sounds[activeBg].currentTime = 0;
    }
    activeBg = key;
    if (muted) return;
    sounds[key].currentTime = 0;
    sounds[key].play().catch(() => {});
  }

  function stopAllBg() {
    ['bg', 'boss'].forEach(k => {
      sounds[k].pause();
      sounds[k].currentTime = 0;
    });
    activeBg = null;
  }

  function applyMute() {
    Object.values(sounds).forEach(s => { s.muted = muted; });
    if (!muted && activeBg) {
      sounds[activeBg].play().catch(() => {});
    }
  }

  // ── TYPING THROTTLE ───────────────────────────────────────
  // Prevent overlapping typing clicks firing faster than ~80ms
  let lastTypingTime = 0;
  function playTyping() {
    if (muted) return;
    const now = Date.now();
    if (now - lastTypingTime < 80) return;
    lastTypingTime = now;
    playSfx('typing');
  }

  // ── PUBLIC API ────────────────────────────────────────────
  return {
    // Background music control
    startAmbient() { startLoop('bg'); },
    startBoss()    { startLoop('boss'); },
    stopBg()       { stopAllBg(); },

    // SFX
    playButton()   { playSfx('button'); },
    playTyping()   { playTyping(); },
    playSuccess()  { playSfx('success'); },
    playFailure()  { playSfx('failure'); },
    playLevelWin() { playSfx('level_win'); },
    playLevelFail(){ playSfx('level_fail'); },

    // Mute toggle — returns new muted state
    toggleMute() {
      muted = !muted;
      applyMute();
      return muted;
    },

    isMuted() { return muted; },

    // Called once on first user interaction to unlock Web Audio
    unlock() {
      Object.values(sounds).forEach(s => {
        s.play().catch(() => {});
        s.pause();
        s.currentTime = 0;
      });
    },
  };
})();
