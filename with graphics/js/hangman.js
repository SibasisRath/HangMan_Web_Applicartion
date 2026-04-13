
// ============================================================
// hangman.js — Paper Pile Animation & Stage Management
// ============================================================

const PaperPile = (() => {
  const MAX_LIVES = 6;
  let currentStage = 0; // 0 = no papers, 6 = all papers (game over)

  // SVG paper pile stages — each stage adds one paper
  function buildSVG(stage) {
    const container = document.getElementById('hangman-svg-container');
    if (!container) return;

    // Clear
    container.innerHTML = '';

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 340 400');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.overflow = 'visible';

    // ── DESK ──────────────────────────────────────────────────
    const desk = createDesk();
    svg.appendChild(desk);

    // ── CHARACTER (always visible, buries under papers) ───────
    const character = createCharacter(stage);
    svg.appendChild(character);

    // ── PAPER PILE ────────────────────────────────────────────
    if (stage > 0) {
      const papers = createPapers(stage);
      svg.appendChild(papers);
    }

    // ── EXPRESSION BUBBLE ─────────────────────────────────────
    if (stage > 0) {
      const bubble = createBubble(stage);
      svg.appendChild(bubble);
    }

    container.appendChild(svg);

    // Trigger animation
    requestAnimationFrame(() => {
      const lastPaper = container.querySelector('.paper-new');
      if (lastPaper) {
        lastPaper.classList.add('paper-landed');
      }
    });
  }

  function createDesk() {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Desk surface
    const desk = makeSVGEl('rect', { x: 20, y: 330, width: 300, height: 18, rx: 4, fill: '#8B6F47', stroke: '#6B4F27', 'stroke-width': 2 });
    // Desk legs
    const leg1 = makeSVGEl('rect', { x: 40, y: 348, width: 16, height: 40, rx: 3, fill: '#6B4F27' });
    const leg2 = makeSVGEl('rect', { x: 284, y: 348, width: 16, height: 40, rx: 3, fill: '#6B4F27' });
    // Desk drawer
    const drawer = makeSVGEl('rect', { x: 130, y: 335, width: 80, height: 9, rx: 2, fill: '#7B5F37', stroke: '#5B3F17', 'stroke-width': 1 });
    const handle = makeSVGEl('rect', { x: 165, y: 338, width: 10, height: 3, rx: 1.5, fill: '#C9A96E' });

    g.appendChild(desk);
    g.appendChild(leg1);
    g.appendChild(leg2);
    g.appendChild(drawer);
    g.appendChild(handle);
    return g;
  }

  function createCharacter(stage) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', 'character');

    // Character sinks as papers pile up
    const offsetY = Math.min(stage * 15, 80);

    // Body
    const body = makeSVGEl('rect', { x: 148, y: 250 + offsetY * 0.3, width: 44, height: 75, rx: 8, fill: '#3B82F6', stroke: '#1D4ED8', 'stroke-width': 2 });

    // Neck
    const neck = makeSVGEl('rect', { x: 162, y: 240 + offsetY * 0.3, width: 16, height: 14, rx: 4, fill: '#FBBF24' });

    // Head — cy=212 so head bottom (212+28=240) sits flush on neck top (y=240)
    const headY = 212 + offsetY * 0.3;
    const head = makeSVGEl('ellipse', { cx: 170, cy: headY, rx: 26, ry: 28, fill: '#FBBF24', stroke: '#F59E0B', 'stroke-width': 2 });

    // Hair
    const hair = makeSVGEl('ellipse', { cx: 170, cy: headY - 20, rx: 27, ry: 14, fill: '#374151' });

    // Eyes (change based on stage)
    let eyeEl;
    if (stage >= 5) {
      // X eyes (dead/overwhelmed)
      eyeEl = createXEyes(170, headY);
    } else if (stage >= 3) {
      // Worried eyes
      eyeEl = createWorriedEyes(170, headY);
    } else {
      // Normal eyes
      eyeEl = createNormalEyes(170, headY);
    }

    // Mouth (changes)
    const mouthY = headY + 12;
    let mouth;
    if (stage === 0) {
      mouth = makeSVGEl('path', { d: `M 158 ${mouthY} Q 170 ${mouthY + 8} 182 ${mouthY}`, stroke: '#374151', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' });
    } else if (stage <= 2) {
      mouth = makeSVGEl('path', { d: `M 158 ${mouthY + 4} Q 170 ${mouthY - 2} 182 ${mouthY + 4}`, stroke: '#374151', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' });
    } else if (stage <= 4) {
      mouth = makeSVGEl('line', { x1: 160, y1: mouthY + 2, x2: 180, y2: mouthY + 2, stroke: '#374151', 'stroke-width': 2.5, 'stroke-linecap': 'round' });
    } else {
      mouth = makeSVGEl('path', { d: `M 157 ${mouthY + 6} Q 170 ${mouthY} 183 ${mouthY + 6}`, stroke: '#374151', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' });
    }

    // Tie
    const tie = makeSVGEl('polygon', { 
      points: `170,${254 + offsetY * 0.3} 163,${264 + offsetY * 0.3} 170,${295 + offsetY * 0.3} 177,${264 + offsetY * 0.3}`,
      fill: '#EF4444', stroke: '#B91C1C', 'stroke-width': 1.5
    });

    // Left arm
    const armL = makeSVGEl('rect', { x: 108, y: 258 + offsetY * 0.3, width: 40, height: 14, rx: 7, fill: '#3B82F6', stroke: '#1D4ED8', 'stroke-width': 1.5, transform: `rotate(-10, 128, 265)` });
    // Right arm
    const armR = makeSVGEl('rect', { x: 192, y: 258 + offsetY * 0.3, width: 40, height: 14, rx: 7, fill: '#3B82F6', stroke: '#1D4ED8', 'stroke-width': 1.5, transform: `rotate(10, 212, 265)` });

    // Hands
    const handL = makeSVGEl('circle', { cx: 108, cy: 264 + offsetY * 0.3, r: 9, fill: '#FBBF24' });
    const handR = makeSVGEl('circle', { cx: 232, cy: 264 + offsetY * 0.3, r: 9, fill: '#FBBF24' });

    // Legs
    const legL = makeSVGEl('rect', { x: 148, y: 318 + offsetY * 0.3, width: 18, height: 18, rx: 5, fill: '#1E3A5F', stroke: '#0F2A4F', 'stroke-width': 1.5 });
    const legR = makeSVGEl('rect', { x: 174, y: 318 + offsetY * 0.3, width: 18, height: 18, rx: 5, fill: '#1E3A5F', stroke: '#0F2A4F', 'stroke-width': 1.5 });

    g.appendChild(body);
    g.appendChild(armL);
    g.appendChild(armR);
    g.appendChild(handL);
    g.appendChild(handR);
    g.appendChild(legL);
    g.appendChild(legR);
    g.appendChild(neck);
    g.appendChild(head);
    g.appendChild(hair);
    g.appendChild(eyeEl);
    g.appendChild(mouth);
    g.appendChild(tie);

    return g;
  }

  function createNormalEyes(cx, headY) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.appendChild(makeSVGEl('circle', { cx: cx - 10, cy: headY - 5, r: 5, fill: 'white' }));
    g.appendChild(makeSVGEl('circle', { cx: cx + 10, cy: headY - 5, r: 5, fill: 'white' }));
    g.appendChild(makeSVGEl('circle', { cx: cx - 9, cy: headY - 4, r: 2.5, fill: '#1F2937' }));
    g.appendChild(makeSVGEl('circle', { cx: cx + 11, cy: headY - 4, r: 2.5, fill: '#1F2937' }));
    return g;
  }

  function createWorriedEyes(cx, headY) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.appendChild(makeSVGEl('circle', { cx: cx - 10, cy: headY - 5, r: 6, fill: 'white' }));
    g.appendChild(makeSVGEl('circle', { cx: cx + 10, cy: headY - 5, r: 6, fill: 'white' }));
    g.appendChild(makeSVGEl('circle', { cx: cx - 10, cy: headY - 4, r: 3, fill: '#1F2937' }));
    g.appendChild(makeSVGEl('circle', { cx: cx + 10, cy: headY - 4, r: 3, fill: '#1F2937' }));
    // Worried brows
    g.appendChild(makeSVGEl('path', { d: `M ${cx-16} ${headY-14} Q ${cx-10} ${headY-18} ${cx-4} ${headY-14}`, stroke: '#374151', 'stroke-width': 2.5, fill: 'none' }));
    g.appendChild(makeSVGEl('path', { d: `M ${cx+4} ${headY-14} Q ${cx+10} ${headY-18} ${cx+16} ${headY-14}`, stroke: '#374151', 'stroke-width': 2.5, fill: 'none' }));
    return g;
  }

  function createXEyes(cx, headY) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const xProps = { stroke: '#EF4444', 'stroke-width': 3, 'stroke-linecap': 'round' };
    // Left X
    g.appendChild(makeSVGEl('line', { x1: cx - 15, y1: headY - 10, x2: cx - 5, y2: headY, ...xProps }));
    g.appendChild(makeSVGEl('line', { x1: cx - 5, y1: headY - 10, x2: cx - 15, y2: headY, ...xProps }));
    // Right X
    g.appendChild(makeSVGEl('line', { x1: cx + 5, y1: headY - 10, x2: cx + 15, y2: headY, ...xProps }));
    g.appendChild(makeSVGEl('line', { x1: cx + 15, y1: headY - 10, x2: cx + 5, y2: headY, ...xProps }));
    return g;
  }

  function createPapers(stage) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', 'paper-pile');

    // Desk surface Y = 330. Papers stack upward.
    const paperHeight = 38;
    const baseY = 328; // just above the desk

    const stamps = ['REJECTED', 'INVALID', 'ERROR', 'DENIED', 'WRONG FORMAT', 'SYSTEM FAIL'];
    const colors = ['#FEFCE8', '#FEF3C7', '#ECFDF5', '#EFF6FF', '#FFF7ED', '#F0FDF4'];
    const rotations = [-4, 3, -6, 5, -2, 7];

    for (let i = 0; i < stage; i++) {
      const paperY = baseY - (i * (paperHeight - 6));
      const isNew = i === stage - 1;
      const rot = rotations[i % rotations.length];
      const paperColor = colors[i % colors.length];

      const paperG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      paperG.setAttribute('class', `paper-item ${isNew ? 'paper-new' : ''}`);
      paperG.setAttribute('transform', `rotate(${rot}, 170, ${paperY + paperHeight / 2})`);

      // Paper body
      const paper = makeSVGEl('rect', {
        x: 90, y: paperY - paperHeight + 10, width: 160, height: paperHeight + 4,
        rx: 3, fill: paperColor, stroke: '#CBD5E1', 'stroke-width': 1.5
      });

      // Lines on paper
      for (let l = 0; l < 3; l++) {
        const line = makeSVGEl('line', {
          x1: 102, y1: paperY - paperHeight + 20 + (l * 8),
          x2: 238, y2: paperY - paperHeight + 20 + (l * 8),
          stroke: '#CBD5E1', 'stroke-width': 1
        });
        paperG.appendChild(line);
      }

      // REJECTED stamp
      const stampGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      stampGroup.setAttribute('transform', `rotate(-15, 170, ${paperY - 5})`);
      const stampBg = makeSVGEl('rect', {
        x: 125, y: paperY - paperHeight + 8, width: 90, height: 20,
        rx: 3, fill: 'none', stroke: '#DC2626', 'stroke-width': 2.5
      });
      const stampText = makeSVGEl('text', {
        x: 170, y: paperY - paperHeight + 22,
        'text-anchor': 'middle', fill: '#DC2626',
        'font-size': '10', 'font-weight': '900',
        'font-family': 'Arial, sans-serif', 'letter-spacing': '1'
      });
      stampText.textContent = stamps[i % stamps.length];
      stampGroup.appendChild(stampBg);
      stampGroup.appendChild(stampText);

      paperG.appendChild(paper);
      paperG.appendChild(stampGroup);
      g.appendChild(paperG);
    }

    return g;
  }

  function createBubble(stage) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const expressions = [
      '', 
      '😰 Uh oh...', 
      '😨 Not again!', 
      '😱 REJECTED??',
      '🤯 Help me!', 
      '💀 Almost done!', 
      '☠️ Game Over!'
    ];

    const expr = expressions[Math.min(stage, 6)];
    if (!expr) return g;

    // Bubble position (top right of character, shifts as papers pile)
    const bubbleX = 200;
    const bubbleY = 150 - stage * 5;

    const bubble = makeSVGEl('rect', { x: bubbleX - 5, y: bubbleY, width: 115, height: 26, rx: 12, fill: 'white', stroke: '#E2E8F0', 'stroke-width': 1.5 });
    const tail = makeSVGEl('polygon', { points: `${bubbleX + 10},${bubbleY + 26} ${bubbleX + 5},${bubbleY + 36} ${bubbleX + 22},${bubbleY + 26}`, fill: 'white', stroke: '#E2E8F0', 'stroke-width': 1 });
    const text = makeSVGEl('text', { x: bubbleX + 52, y: bubbleY + 17, 'text-anchor': 'middle', fill: '#0F172A', 'font-size': '10', 'font-weight': '700', 'font-family': 'Arial, sans-serif' });
    text.textContent = expr;

    g.appendChild(tail);
    g.appendChild(bubble);
    g.appendChild(text);
    return g;
  }

  function makeSVGEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
    return el;
  }

  // ── PUBLIC API ───────────────────────────────────────────────
  return {
    init() {
      currentStage = 0;
      buildSVG(0);
    },
    addPaper() {
      if (currentStage < MAX_LIVES) {
        currentStage++;
        buildSVG(currentStage);
      }
      return currentStage;
    },
    reset() {
      currentStage = 0;
      buildSVG(0);
    },
    getStage() {
      return currentStage;
    },
    isGameOver() {
      return currentStage >= MAX_LIVES;
    }
  };
})();
