// Bus Jam Client: Canvas 2D Renderer, Animations, Audio & Touch Interaction
import { COLORS, MAX_BAYS, DEFAULT_BUS_CAPACITY, canBusExit, checkGameStatus, createGameState } from '../../bus-jam/engine.js';
import { LEVELS } from '../../bus-jam/levels.js';

export function createBusJamController(canvas, options = {}) {
  const ctx = canvas.getContext('2d');
  let currentLevelIndex = 0;
  let state = createGameState(LEVELS[currentLevelIndex]);

  // Audio system using Web Audio API
  let soundEnabled = true;
  try {
    const saved = localStorage.getItem('bus_jam_sound');
    if (saved !== null) soundEnabled = saved === 'true';
  } catch (e) {}

  let audioCtx = null;
  function getAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!soundEnabled) return;
    try {
      const ac = getAudio();
      if (!ac) return;
      const t = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);

      if (type === 'blocked') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.linearRampToValueAtTime(80, t + 0.14);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.14);
        osc.start(t);
        osc.stop(t + 0.14);
      } else if (type === 'slide') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(480, t + 0.22);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.22);
        osc.start(t);
        osc.stop(t + 0.22);
      } else if (type === 'board') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, t);
        osc.frequency.exponentialRampToValueAtTime(780, t + 0.15);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
      } else if (type === 'depart') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, t);
        osc.frequency.exponentialRampToValueAtTime(720, t + 0.35);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.35);
        osc.start(t);
        osc.stop(t + 0.35);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.connect(g);
          g.connect(ac.destination);
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, t + i * 0.1);
          g.gain.setValueAtTime(0.1, t + i * 0.1);
          g.gain.linearRampToValueAtTime(0.01, t + i * 0.1 + 0.2);
          o.start(t + i * 0.1);
          o.stop(t + i * 0.1 + 0.2);
        });
      } else if (type === 'lose') {
        const notes = [440, 392, 349.23, 293.66];
        notes.forEach((freq, i) => {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.connect(g);
          g.connect(ac.destination);
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(freq, t + i * 0.12);
          g.gain.setValueAtTime(0.08, t + i * 0.12);
          g.gain.linearRampToValueAtTime(0.01, t + i * 0.12 + 0.2);
          o.start(t + i * 0.12);
          o.stop(t + i * 0.12 + 0.2);
        });
      }
    } catch (e) {}
  }

  // Animation structures
  const activeAnimations = {
    slidingBus: null,        // Bus currently moving from parking lot to bay
    shakingBuses: new Map(), // busId -> remaining seconds
    boardingPassenger: null, // Passenger moving from queue into bus seat
    departingBus: null,      // Bus zooming out after 3/3
    particles: []            // Visual sparks & confetti
  };

  // Canvas logical layout constants
  const W = 380;
  const H = 580;

  // Grid layout in parking lot
  const gridStartX = 18;
  const gridStartY = 236;
  const gridAreaWidth = 344;
  const gridAreaHeight = 328;

  // Waiting Bays layout
  const baysY = 126;
  const bayW = 78;
  const bayH = 88;
  const bayGap = 8;
  const baysStartX = (W - (4 * bayW + 3 * bayGap)) / 2;

  function getBayBox(bayIndex) {
    const x = baysStartX + bayIndex * (bayW + bayGap);
    const y = baysY;
    return { x, y, w: bayW, h: bayH };
  }

  function getBusParkingBox(bus, gridW = 6, gridH = 6) {
    const cellW = gridAreaWidth / gridW;
    const cellH = gridAreaHeight / gridH;
    const x = gridStartX + bus.x * cellW + 3;
    const y = gridStartY + bus.y * cellH + 3;
    const w = (bus.width || 1) * cellW - 6;
    const h = (bus.height || 1) * cellH - 6;
    return { x, y, w, h };
  }

  function getPassengerQueuePos(index) {
    const startX = 32;
    const y = 92;
    const spacing = 48;
    return { x: startX + index * spacing, y };
  }

  function loadLevel(index) {
    if (index < 0) index = 0;
    if (index >= LEVELS.length) index = LEVELS.length - 1;
    currentLevelIndex = index;
    state = createGameState(LEVELS[currentLevelIndex]);
    activeAnimations.slidingBus = null;
    activeAnimations.shakingBuses.clear();
    activeAnimations.boardingPassenger = null;
    activeAnimations.departingBus = null;
    activeAnimations.particles = [];
  }

  // Particle creators
  function spawnConfetti() {
    for (let i = 0; i < 48; i++) {
      activeAnimations.particles.push({
        x: W / 2 + (Math.random() - 0.5) * 160,
        y: H / 2 - 40 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 260,
        vy: -180 - Math.random() * 220,
        color: Object.values(COLORS)[Math.floor(Math.random() * 5)],
        size: 4 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 8,
        life: 1.0
      });
    }
  }

  function spawnExhaust(x, y) {
    for (let i = 0; i < 14; i++) {
      activeAnimations.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: -60 - Math.random() * 90,
        vy: (Math.random() - 0.5) * 40,
        color: '#A0AEC0',
        size: 3 + Math.random() * 4,
        rot: 0,
        vrot: 0,
        life: 0.5
      });
    }
  }

  // Animation Step trigger for passenger boarding
  function triggerNextQueueAction() {
    if (activeAnimations.slidingBus || activeAnimations.boardingPassenger || activeAnimations.departingBus) {
      return;
    }

    if (state.queue.length === 0) {
      checkGameStatus(state);
      if (state.isWon) {
        playSound('win');
        spawnConfetti();
      }
      return;
    }

    const nextPassengerColor = state.queue[0];
    const targetBayIndex = state.bays.findIndex(
      b => b.color === nextPassengerColor && (b.seated || 0) < (b.capacity || DEFAULT_BUS_CAPACITY)
    );

    if (targetBayIndex === -1) {
      // No bus matches or has room
      checkGameStatus(state);
      if (state.isGameOver) {
        playSound('lose');
      }
      return;
    }

    const targetBus = state.bays[targetBayIndex];
    const targetBayBox = getBayBox(targetBayIndex);
    const seatIndex = targetBus.seated || 0;
    // Calculate seat position inside the bay
    const seatDotX = targetBayBox.x + targetBayBox.w / 2 - 20 + seatIndex * 20;
    const seatDotY = targetBayBox.y + targetBayBox.h - 18;

    const startPos = getPassengerQueuePos(0);

    // Remove passenger from state queue and launch boarding animation
    state.queue.shift();
    playSound('board');

    activeAnimations.boardingPassenger = {
      color: nextPassengerColor,
      fromX: startPos.x,
      fromY: startPos.y,
      toX: seatDotX,
      toY: seatDotY,
      targetBus,
      targetBayIndex,
      progress: 0,
      duration: 0.28
    };
  }

  function handleBusClick(clickedBus) {
    if (activeAnimations.slidingBus || state.isWon || state.isGameOver) return;

    const maxBays = state.maxBays || MAX_BAYS;
    if (state.bays.length >= maxBays) {
      playSound('blocked');
      activeAnimations.shakingBuses.set(clickedBus.id, 0.2);
      return;
    }

    const canExit = canBusExit(clickedBus, state.buses, state.gridWidth, state.gridHeight);
    if (!canExit) {
      playSound('blocked');
      activeAnimations.shakingBuses.set(clickedBus.id, 0.2);
      return;
    }

    // Bus can exit!
    playSound('slide');
    const startBox = getBusParkingBox(clickedBus, state.gridWidth, state.gridHeight);
    const targetBayIndex = state.bays.length;
    const targetBayBox = getBayBox(targetBayIndex);

    // Remove from parking lot immediately so path clears for other buses
    const busIdx = state.buses.findIndex(b => b.id === clickedBus.id);
    if (busIdx !== -1) state.buses.splice(busIdx, 1);

    activeAnimations.slidingBus = {
      bus: clickedBus,
      fromX: startBox.x,
      fromY: startBox.y,
      fromW: startBox.w,
      fromH: startBox.h,
      toX: targetBayBox.x + 4,
      toY: targetBayBox.y + 4,
      toW: targetBayBox.w - 8,
      toH: targetBayBox.h - 8,
      targetBayIndex,
      progress: 0,
      duration: 0.32
    };
  }

  // Pointer/Touch handling
  function onPointerDown(e) {
    e.preventDefault();
    getAudio();
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const px = (clientX - rect.left) * scaleX;
    const py = (clientY - rect.top) * scaleY;

    // 1. Check HUD buttons
    if (px >= 336 && px <= 368 && py >= 10 && py <= 40) {
      soundEnabled = !soundEnabled;
      try { localStorage.setItem('bus_jam_sound', String(soundEnabled)); } catch (err) {}
      return;
    }

    if (px >= 298 && px <= 330 && py >= 10 && py <= 40) {
      loadLevel(currentLevelIndex);
      return;
    }

    if (px >= 12 && px <= 36 && py >= 10 && py <= 40) {
      if (currentLevelIndex > 0) loadLevel(currentLevelIndex - 1);
      return;
    }
    if (px >= 240 && px <= 268 && py >= 10 && py <= 40) {
      if (currentLevelIndex < LEVELS.length - 1) loadLevel(currentLevelIndex + 1);
      return;
    }

    // 2. Check Victory / Game Over Overlay buttons
    if (state.isWon) {
      if (px >= W / 2 - 80 && px <= W / 2 + 80 && py >= H / 2 + 30 && py <= H / 2 + 75) {
        if (currentLevelIndex < LEVELS.length - 1) loadLevel(currentLevelIndex + 1);
        else loadLevel(0);
        return;
      }
    }

    if (state.isGameOver) {
      if (px >= W / 2 - 80 && px <= W / 2 + 80 && py >= H / 2 + 30 && py <= H / 2 + 75) {
        loadLevel(currentLevelIndex);
        return;
      }
    }

    // 3. Check buses in Parking Lot
    if (py >= gridStartY && py <= gridStartY + gridAreaHeight && px >= gridStartX && px <= gridStartX + gridAreaWidth) {
      for (const bus of state.buses) {
        const box = getBusParkingBox(bus, state.gridWidth, state.gridHeight);
        if (px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h) {
          handleBusClick(bus);
          return;
        }
      }
    }
  }

  canvas.addEventListener('pointerdown', onPointerDown);

  // Update loop
  function update(dt) {
    // 1. Shaking buses
    for (const [busId, timer] of activeAnimations.shakingBuses.entries()) {
      const nextTimer = timer - dt;
      if (nextTimer <= 0) {
        activeAnimations.shakingBuses.delete(busId);
      } else {
        activeAnimations.shakingBuses.set(busId, nextTimer);
      }
    }

    // 2. Sliding bus into bay
    if (activeAnimations.slidingBus) {
      const anim = activeAnimations.slidingBus;
      anim.progress += dt / anim.duration;
      if (anim.progress >= 1) {
        state.bays.push(anim.bus);
        activeAnimations.slidingBus = null;
        triggerNextQueueAction();
      }
    }

    // 3. Boarding passenger
    if (activeAnimations.boardingPassenger) {
      const anim = activeAnimations.boardingPassenger;
      anim.progress += dt / anim.duration;
      if (anim.progress >= 1) {
        const bus = anim.targetBus;
        bus.seated = (bus.seated || 0) + 1;
        activeAnimations.boardingPassenger = null;

        if (bus.seated >= (bus.capacity || DEFAULT_BUS_CAPACITY)) {
          playSound('depart');
          const bayIndex = state.bays.findIndex(b => b.id === bus.id);
          const bayBox = getBayBox(bayIndex >= 0 ? bayIndex : 0);
          spawnExhaust(bayBox.x + bayBox.w - 10, bayBox.y + bayBox.h / 2);

          activeAnimations.departingBus = {
            bus,
            bayIndex,
            fromX: bayBox.x + 4,
            fromY: bayBox.y + 4,
            w: bayBox.w - 8,
            h: bayBox.h - 8,
            progress: 0,
            duration: 0.38
          };
        } else {
          triggerNextQueueAction();
        }
      }
    }

    // 4. Departing bus zooming away
    if (activeAnimations.departingBus) {
      const anim = activeAnimations.departingBus;
      anim.progress += dt / anim.duration;
      if (anim.progress >= 1) {
        const bIdx = state.bays.findIndex(b => b.id === anim.bus.id);
        if (bIdx !== -1) {
          state.bays.splice(bIdx, 1);
        }
        state.completedBuses.push(anim.bus);
        activeAnimations.departingBus = null;
        triggerNextQueueAction();
      }
    }

    // 5. Particles update
    for (let i = activeAnimations.particles.length - 1; i >= 0; i--) {
      const p = activeAnimations.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 320 * dt;
      p.rot += (p.vrot || 0) * dt;
      p.life -= dt;
      if (p.life <= 0) {
        activeAnimations.particles.splice(i, 1);
      }
    }
  }

  // Draw helpers
  function drawRoundedRect(c, x, y, w, h, r) {
    c.beginPath();
    c.roundRect(x, y, w, h, r);
  }

  function drawPassengerAvatar(c, x, y, color, isFront = false, bob = 0) {
    const hex = COLORS[color] || color || '#FFF';
    const py = y + bob;

    // Shadow
    c.fillStyle = 'rgba(0, 0, 0, 0.35)';
    c.beginPath();
    c.ellipse(x, py + 16, 12, 4, 0, 0, Math.PI * 2);
    c.fill();

    // Body
    c.fillStyle = hex;
    c.beginPath();
    c.roundRect(x - 10, py - 4, 20, 20, [8, 8, 4, 4]);
    c.fill();

    // Head
    c.fillStyle = '#FFE0BD';
    c.beginPath();
    c.arc(x, py - 10, 9, 0, Math.PI * 2);
    c.fill();

    // Cap / hair matching color
    c.fillStyle = hex;
    c.beginPath();
    c.arc(x, py - 12, 9, Math.PI, 0);
    c.fill();
    c.beginPath();
    c.roundRect(x - 8, py - 14, 16, 5, 2);
    c.fill();

    // Eyes
    c.fillStyle = '#222';
    c.beginPath();
    c.arc(x - 3, py - 10, 1.3, 0, Math.PI * 2);
    c.arc(x + 3, py - 10, 1.3, 0, Math.PI * 2);
    c.fill();

    // Smile
    c.strokeStyle = '#666';
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(x, py - 9, 3, 0.2 * Math.PI, 0.8 * Math.PI);
    c.stroke();

    // Pulsing indicator if front passenger
    if (isFront) {
      c.fillStyle = '#FFD700';
      c.beginPath();
      const pointerY = py - 27 + Math.sin(Date.now() / 150) * 3;
      c.moveTo(x - 4, pointerY);
      c.lineTo(x + 4, pointerY);
      c.lineTo(x, pointerY + 5);
      c.closePath();
      c.fill();
    }
  }

  function drawBus(c, x, y, w, h, bus, shakeOffset = { x: 0, y: 0 }, inBay = false) {
    const hex = COLORS[bus.color] || '#FFF';
    const bx = x + shakeOffset.x;
    const by = y + shakeOffset.y;
    const dir = (inBay ? 'U' : (bus.direction || 'U')).toUpperCase();

    // Drop shadow
    c.fillStyle = 'rgba(0, 0, 0, 0.4)';
    drawRoundedRect(c, bx + 2, by + 4, w, h, 10);
    c.fill();

    // Bus body gradient
    c.fillStyle = hex;
    drawRoundedRect(c, bx, by, w, h, 10);
    c.fill();

    // Glossy top highlight
    c.fillStyle = 'rgba(255, 255, 255, 0.22)';
    drawRoundedRect(c, bx + 2, by + 2, w - 4, Math.max(4, h * 0.2), [8, 8, 2, 2]);
    c.fill();

    // Windshield facing movement direction
    c.fillStyle = '#1A202C';
    let arrowAngle = 0;
    if (dir === 'U') {
      arrowAngle = -Math.PI / 2;
      drawRoundedRect(c, bx + 4, by + 3, w - 8, Math.min(12, h * 0.25), 4);
      c.fill();
      c.fillStyle = '#FFF9D2';
      c.fillRect(bx + 4, by + 1, 4, 2);
      c.fillRect(bx + w - 8, by + 1, 4, 2);
    } else if (dir === 'D') {
      arrowAngle = Math.PI / 2;
      drawRoundedRect(c, bx + 4, by + h - 15, w - 8, Math.min(12, h * 0.25), 4);
      c.fill();
      c.fillStyle = '#FFF9D2';
      c.fillRect(bx + 4, by + h - 3, 4, 2);
      c.fillRect(bx + w - 8, by + h - 3, 4, 2);
    } else if (dir === 'L') {
      arrowAngle = Math.PI;
      drawRoundedRect(c, bx + 3, by + 4, Math.min(12, w * 0.25), h - 8, 4);
      c.fill();
      c.fillStyle = '#FFF9D2';
      c.fillRect(bx + 1, by + 4, 2, 4);
      c.fillRect(bx + 1, by + h - 8, 2, 4);
    } else if (dir === 'R') {
      arrowAngle = 0;
      drawRoundedRect(c, bx + w - 15, by + 4, Math.min(12, w * 0.25), h - 8, 4);
      c.fill();
      c.fillStyle = '#FFF9D2';
      c.fillRect(bx + w - 3, by + 4, 2, 4);
      c.fillRect(bx + w - 3, by + h - 8, 2, 4);
    }

    const centerX = bx + w / 2;
    const centerY = by + h / 2;

    if (!inBay) {
      c.save();
      c.translate(centerX, centerY);
      c.rotate(arrowAngle);
      c.fillStyle = 'rgba(255, 255, 255, 0.88)';
      c.beginPath();
      c.moveTo(8, 0);
      c.lineTo(-4, -6);
      c.lineTo(-2, 0);
      c.lineTo(-8, 0);
      c.lineTo(-8, 0);
      c.lineTo(-2, 0);
      c.lineTo(-4, 6);
      c.closePath();
      c.fill();
      c.restore();
    } else {
      // In bay: show seated / capacity counter
      c.fillStyle = 'rgba(255, 255, 255, 0.95)';
      c.font = 'bold 12px sans-serif';
      c.textAlign = 'center';
      c.fillText(`${bus.seated || 0}/${bus.capacity || DEFAULT_BUS_CAPACITY}`, centerX, centerY + 2);
    }

    // Capacity seats dots (3 dots)
    const seatedCount = bus.seated || 0;
    const cap = bus.capacity || DEFAULT_BUS_CAPACITY;
    const dotSpacing = inBay ? 16 : 8;
    const dotRadius = inBay ? 4.5 : 2.5;
    const dotsTotalW = (cap - 1) * dotSpacing;
    const dotsStartX = centerX - dotsTotalW / 2;
    const dy = inBay ? (by + h - 14) : (centerY + (h > w ? 16 : 8));

    for (let i = 0; i < cap; i++) {
      const dx = dotsStartX + i * dotSpacing;
      c.fillStyle = i < seatedCount ? '#FFFFFF' : 'rgba(0, 0, 0, 0.45)';
      c.beginPath();
      c.arc(dx, dy, dotRadius, 0, Math.PI * 2);
      c.fill();
      if (inBay) {
        c.strokeStyle = '#FFFFFF';
        c.lineWidth = 1;
        c.stroke();
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#10141D');
    bgGrad.addColorStop(1, '#0B0D13');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 1. HUD Header (y: 0 to 45)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';

    // Prev button
    ctx.fillStyle = currentLevelIndex > 0 ? '#CBD5E0' : '#4A5568';
    ctx.fillText('‹', 18, 26);

    // Level Title
    ctx.fillStyle = '#FFFFFF';
    const lvlName = state.levelName || `Màn ${currentLevelIndex + 1}`;
    ctx.fillText(`MÀN ${currentLevelIndex + 1}: ${lvlName.toUpperCase()}`, 38, 26);

    // Next button
    ctx.fillStyle = currentLevelIndex < LEVELS.length - 1 ? '#CBD5E0' : '#4A5568';
    ctx.fillText('›', 250, 26);

    // Restart button
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillText('↺', 308, 26);

    // Sound button
    ctx.fillText(soundEnabled ? '🔊' : '🔇', 342, 26);

    // 2. Passenger Station Platform (y: 44 to 118)
    drawRoundedRect(ctx, 14, 44, W - 28, 74, 12);
    ctx.fillStyle = '#1A202C';
    ctx.fill();
    ctx.strokeStyle = '#2D3748';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Station warning strip
    ctx.fillStyle = '#D69E2E';
    ctx.fillRect(16, 115, W - 32, 3);

    // Station Label & Passenger Counter badge
    ctx.font = 'bold 10px -apple-system, sans-serif';
    ctx.fillStyle = '#A0AEC0';
    ctx.fillText('HÀNG CHỜ', 24, 56);

    const totalRemaining = state.queue.length + (activeAnimations.boardingPassenger ? 1 : 0);
    drawRoundedRect(ctx, W - 92, 47, 66, 18, 9);
    ctx.fillStyle = '#2D3748';
    ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    ctx.textAlign = 'center';
    ctx.fillText(`${totalRemaining} KHÁCH`, W - 59, 60);

    // Draw waiting passengers (up to 6)
    ctx.textAlign = 'center';
    const showCount = Math.min(6, state.queue.length);
    for (let i = 0; i < showCount; i++) {
      const pos = getPassengerQueuePos(i);
      const isFront = (i === 0);
      const bob = isFront ? Math.sin(Date.now() / 150) * 2 : 0;
      drawPassengerAvatar(ctx, pos.x, pos.y, state.queue[i], isFront, bob);
    }
    if (state.queue.length > 6) {
      const pos = getPassengerQueuePos(6);
      drawRoundedRect(ctx, pos.x - 16, pos.y - 12, 34, 24, 12);
      ctx.fillStyle = '#4A5568';
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`+${state.queue.length - 6}`, pos.x + 1, pos.y + 4);
    }

    // 3. Waiting Bays (y: 124 to 216)
    for (let i = 0; i < (state.maxBays || MAX_BAYS); i++) {
      const box = getBayBox(i);

      // Dash bordered slot
      drawRoundedRect(ctx, box.x, box.y, box.w, box.h, 10);
      ctx.fillStyle = 'rgba(26, 32, 44, 0.85)';
      ctx.fill();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#4A5568';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      // Slot index text
      ctx.fillStyle = '#718096';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`BẾN ${i + 1}`, box.x + box.w / 2, box.y + 14);

      // If a bus is in this bay
      const busInBay = state.bays[i];
      if (busInBay && (!activeAnimations.departingBus || activeAnimations.departingBus.bus.id !== busInBay.id)) {
        drawBus(ctx, box.x + 4, box.y + 4, box.w - 8, box.h - 8, busInBay, { x: 0, y: 0 }, true);
      }
    }

    // 4. Parking Lot Grid Area (y: 224 to 570)
    drawRoundedRect(ctx, gridStartX - 4, gridStartY - 4, gridAreaWidth + 8, gridAreaHeight + 8, 14);
    ctx.fillStyle = '#141721';
    ctx.fill();
    ctx.strokeStyle = '#232936';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Road grid cells and exit markings
    const cellW = gridAreaWidth / state.gridWidth;
    const cellH = gridAreaHeight / state.gridHeight;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= state.gridWidth; c++) {
      ctx.beginPath();
      ctx.moveTo(gridStartX + c * cellW, gridStartY);
      ctx.lineTo(gridStartX + c * cellW, gridStartY + gridAreaHeight);
      ctx.stroke();
    }
    for (let r = 0; r <= state.gridHeight; r++) {
      ctx.beginPath();
      ctx.moveTo(gridStartX, gridStartY + r * cellH);
      ctx.lineTo(gridStartX + gridAreaWidth, gridStartY + r * cellH);
      ctx.stroke();
    }

    // Draw buses in Parking Lot
    for (const bus of state.buses) {
      const box = getBusParkingBox(bus, state.gridWidth, state.gridHeight);
      let shake = { x: 0, y: 0 };
      if (activeAnimations.shakingBuses.has(bus.id)) {
        const timer = activeAnimations.shakingBuses.get(bus.id);
        const amount = Math.sin((0.2 - timer) * 45) * 5;
        if (bus.direction === 'U' || bus.direction === 'D') shake.x = amount;
        else shake.y = amount;
      }
      drawBus(ctx, box.x, box.y, box.w, box.h, bus, shake, false);
    }

    // 5. Active dynamic animations
    if (activeAnimations.slidingBus) {
      const anim = activeAnimations.slidingBus;
      const t = Math.min(1, anim.progress);
      const ease = t * (2 - t);
      const curX = anim.fromX + (anim.toX - anim.fromX) * ease;
      const curY = anim.fromY + (anim.toY - anim.fromY) * ease;
      const curW = anim.fromW + (anim.toW - anim.fromW) * ease;
      const curH = anim.fromH + (anim.toH - anim.fromH) * ease;
      drawBus(ctx, curX, curY, curW, curH, anim.bus, { x: 0, y: 0 }, t > 0.5);
    }

    if (activeAnimations.boardingPassenger) {
      const anim = activeAnimations.boardingPassenger;
      const t = Math.min(1, anim.progress);
      const curX = anim.fromX + (anim.toX - anim.fromX) * t;
      const arcHeight = -36 * Math.sin(t * Math.PI);
      const curY = anim.fromY + (anim.toY - anim.fromY) * t + arcHeight;
      drawPassengerAvatar(ctx, curX, curY, anim.color, false, 0);
    }

    if (activeAnimations.departingBus) {
      const anim = activeAnimations.departingBus;
      const t = Math.min(1, anim.progress);
      const speed = t * t * 380;
      const curX = anim.fromX + speed;
      const curY = anim.fromY;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t * 1.2);
      drawBus(ctx, curX, curY, anim.w, anim.h, anim.bus, { x: 0, y: 0 }, true);
      ctx.restore();
    }

    // Particles
    for (const p of activeAnimations.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot || 0);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }

    // 6. Victory & Game Over Modals
    if (state.isWon) {
      ctx.fillStyle = 'rgba(10, 14, 22, 0.88)';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#48BB78';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏆', W / 2, H / 2 - 50);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px -apple-system, sans-serif';
      ctx.fillText('XUẤT SẮC!', W / 2, H / 2 - 10);

      ctx.font = '14px -apple-system, sans-serif';
      ctx.fillStyle = '#A0AEC0';
      ctx.fillText('Bạn đã đón hết toàn bộ hành khách!', W / 2, H / 2 + 15);

      drawRoundedRect(ctx, W / 2 - 80, H / 2 + 35, 160, 42, 10);
      ctx.fillStyle = '#3182CE';
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(currentLevelIndex < LEVELS.length - 1 ? 'Màn tiếp theo →' : 'Chơi lại từ đầu ↺', W / 2, H / 2 + 61);
    } else if (state.isGameOver) {
      ctx.fillStyle = 'rgba(10, 14, 22, 0.88)';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#F56565';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️', W / 2, H / 2 - 50);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px -apple-system, sans-serif';
      ctx.fillText('HẾT CHỖ ĐỖ!', W / 2, H / 2 - 10);

      ctx.font = '13px -apple-system, sans-serif';
      ctx.fillStyle = '#CBD5E0';
      ctx.fillText('Bãi chờ đã kín mà khách không khớp màu.', W / 2, H / 2 + 15);

      drawRoundedRect(ctx, W / 2 - 80, H / 2 + 35, 160, 42, 10);
      ctx.fillStyle = '#E53E3E';
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Thử lại màn này ↺', W / 2, H / 2 + 61);
    }
  }

  // Animation frame loop
  let lastTime = performance.now();
  let animationFrameId = null;

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    render();
    animationFrameId = requestAnimationFrame(loop);
  }

  animationFrameId = requestAnimationFrame(loop);

  return {
    loadLevel,
    getState: () => state,
    destroy: () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('pointerdown', onPointerDown);
    }
  };
}
