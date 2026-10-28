// Bus Jam Client: High-Performance Canvas 2D Renderer, Robust Bay Slot Management & Premium UI/UX
import { COLORS, MAX_BAYS, DEFAULT_BUS_CAPACITY, canBusExit, checkGameStatus, createGameState } from '../../bus-jam/engine.js';
import { LEVELS } from '../../bus-jam/levels.js';

export function createBusJamController(canvas, options = {}) {
  const ctx = canvas.getContext('2d');
  let currentLevelIndex = 0;
  let state = createGameState(LEVELS[currentLevelIndex]);

  // Fixed bay slots array of length maxBays: prevents bus slot shifting/teleporting bugs
  let baySlots = new Array(state.maxBays || MAX_BAYS).fill(null);

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

      if (type === 'blocked') {
        // Double honk beep-beep
        [0, 0.08].forEach(delay => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, t + delay);
          osc.frequency.linearRampToValueAtTime(140, t + delay + 0.06);
          gain.gain.setValueAtTime(0.12, t + delay);
          gain.gain.linearRampToValueAtTime(0.01, t + delay + 0.06);
          osc.start(t + delay);
          osc.stop(t + delay + 0.06);
        });
      } else if (type === 'slide') {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(520, t + 0.2);
        gain.gain.setValueAtTime(0.09, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
      } else if (type === 'board') {
        // Bright bell ding
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, t); // D5
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.16); // A5
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.16);
        osc.start(t);
        osc.stop(t + 0.16);
      } else if (type === 'depart') {
        // Turbo departure whoosh
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(780, t + 0.32);
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.32);
        osc.start(t);
        osc.stop(t + 0.32);
      } else if (type === 'win') {
        // Triumphant 5-note fanfare
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, i) => {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.connect(g);
          g.connect(ac.destination);
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, t + i * 0.09);
          g.gain.setValueAtTime(0.13, t + i * 0.09);
          g.gain.linearRampToValueAtTime(0.01, t + i * 0.09 + 0.24);
          o.start(t + i * 0.09);
          o.stop(t + i * 0.09 + 0.24);
        });
      } else if (type === 'lose') {
        [440, 370, 311, 261.6].forEach((freq, i) => {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.connect(g);
          g.connect(ac.destination);
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(freq, t + i * 0.12);
          g.gain.setValueAtTime(0.09, t + i * 0.12);
          g.gain.linearRampToValueAtTime(0.01, t + i * 0.12 + 0.2);
          o.start(t + i * 0.12);
          o.stop(t + i * 0.12 + 0.2);
        });
      }
    } catch (e) {}
  }

  // Animation structures
  const activeAnimations = {
    slidingBus: null,        // Bus moving from parking lot to assigned bay slot
    shakingBuses: new Map(), // busId -> remaining seconds
    boardingPassenger: null, // Passenger jumping from queue into bus seat
    departingBus: null,      // Full bus accelerating out of bay
    particles: [],           // Confetti and smoke
    floatingAlerts: []       // Toast bubbles like "Bị chặn!"
  };

  // Canvas logical layout constants
  const W = 380;
  const H = 580;

  // Grid layout in parking lot
  const gridStartX = 16;
  const gridStartY = 236;
  const gridAreaWidth = 348;
  const gridAreaHeight = 328;

  // Waiting Bays layout
  const baysY = 126;
  const bayW = 79;
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
    const startX = 34;
    const y = 92;
    const spacing = 46;
    return { x: startX + index * spacing, y };
  }

  let initialPassengerCount = 0;

  function loadLevel(index) {
    if (index < 0) index = 0;
    if (index >= LEVELS.length) index = LEVELS.length - 1;
    currentLevelIndex = index;
    state = createGameState(LEVELS[currentLevelIndex]);
    initialPassengerCount = state.queue.length;
    baySlots = new Array(state.maxBays || MAX_BAYS).fill(null);
    activeAnimations.slidingBus = null;
    activeAnimations.shakingBuses.clear();
    activeAnimations.boardingPassenger = null;
    activeAnimations.departingBus = null;
    activeAnimations.particles = [];
    activeAnimations.floatingAlerts = [];
  }

  loadLevel(currentLevelIndex);

  function spawnConfetti() {
    for (let i = 0; i < 54; i++) {
      activeAnimations.particles.push({
        x: W / 2 + (Math.random() - 0.5) * 180,
        y: H / 2 - 40 + (Math.random() - 0.5) * 90,
        vx: (Math.random() - 0.5) * 280,
        vy: -190 - Math.random() * 240,
        color: Object.values(COLORS)[Math.floor(Math.random() * 5)],
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 10,
        life: 1.2
      });
    }
  }

  function spawnExhaust(x, y) {
    for (let i = 0; i < 16; i++) {
      activeAnimations.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: -60 - Math.random() * 110,
        vy: (Math.random() - 0.5) * 45,
        color: '#CBD5E0',
        size: 4 + Math.random() * 4,
        rot: 0,
        vrot: 0,
        life: 0.45
      });
    }
  }

  function handleBusClick(clickedBus) {
    if (state.isWon || state.isGameOver) return;
    if (clickedBus.isSliding || !state.buses.some(b => b.id === clickedBus.id)) return;

    // 1. Check if the road is clear
    const canExit = canBusExit(clickedBus, state.buses, state.gridWidth, state.gridHeight);
    if (!canExit) {
      playSound('blocked');
      activeAnimations.shakingBuses.set(clickedBus.id, 0.22);
      const box = getBusParkingBox(clickedBus, state.gridWidth, state.gridHeight);
      activeAnimations.floatingAlerts.push({
        x: box.x + box.w / 2,
        y: box.y - 10,
        text: '⛔ Bị chặn!',
        life: 0.65
      });
      return;
    }

    // 2. Find open bay slot
    const slotIndex = baySlots.findIndex(slot => slot === null);
    if (slotIndex === -1) {
      playSound('blocked');
      activeAnimations.shakingBuses.set(clickedBus.id, 0.22);
      const box = getBusParkingBox(clickedBus, state.gridWidth, state.gridHeight);
      activeAnimations.floatingAlerts.push({
        x: box.x + box.w / 2,
        y: box.y - 10,
        text: '⚠️ Hết bến!',
        life: 0.65
      });
      return;
    }

    // 3. Reserve slot immediately
    clickedBus.isSliding = true;
    clickedBus.bayIndex = slotIndex;
    baySlots[slotIndex] = clickedBus;
    state.bays = baySlots.filter(Boolean);

    // Remove from parking lot immediately so other buses can pass through that space
    const bIdx = state.buses.findIndex(b => b.id === clickedBus.id);
    if (bIdx !== -1) state.buses.splice(bIdx, 1);

    playSound('slide');
    const startBox = getBusParkingBox(clickedBus, state.gridWidth, state.gridHeight);
    const targetBayBox = getBayBox(slotIndex);

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
      targetSlot: slotIndex,
      progress: 0,
      duration: 0.28
    };
  }

  // Pointer / Touch Handling
  function onPointerDown(e) {
    e.preventDefault();
    getAudio();
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const px = (clientX - rect.left) * scaleX;
    const py = (clientY - rect.top) * scaleY;

    // 1. Victory Modal Click: Generous tap target anywhere on card or button to advance
    if (state.isWon) {
      if (py >= H / 2 - 20 && py <= H / 2 + 120 && px >= W / 2 - 130 && px <= W / 2 + 130) {
        if (currentLevelIndex < LEVELS.length - 1) {
          loadLevel(currentLevelIndex + 1);
        } else {
          loadLevel(0);
        }
        return;
      }
    }

    // 2. Game Over Modal Click: Tap to retry
    if (state.isGameOver) {
      if (py >= H / 2 - 20 && py <= H / 2 + 120 && px >= W / 2 - 130 && px <= W / 2 + 130) {
        loadLevel(currentLevelIndex);
        return;
      }
    }

    // 3. Header Controls
    // Sound Button
    if (px >= 336 && px <= 376 && py >= 6 && py <= 44) {
      soundEnabled = !soundEnabled;
      try { localStorage.setItem('bus_jam_sound', String(soundEnabled)); } catch (err) {}
      return;
    }

    // Restart Button
    if (px >= 294 && px <= 334 && py >= 6 && py <= 44) {
      loadLevel(currentLevelIndex);
      return;
    }

    // Prev Level Button
    if (px >= 6 && px <= 44 && py >= 6 && py <= 44) {
      if (currentLevelIndex > 0) loadLevel(currentLevelIndex - 1);
      return;
    }

    // Next Level Button
    if (px >= 244 && px <= 286 && py >= 6 && py <= 44) {
      if (currentLevelIndex < LEVELS.length - 1) loadLevel(currentLevelIndex + 1);
      return;
    }

    // 4. Click Buses in Parking Lot
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

  // Self-Healing Continuous Update Loop
  function update(dt) {
    // 1. Shaking buses
    for (const [busId, timer] of activeAnimations.shakingBuses.entries()) {
      const nextTimer = timer - dt;
      if (nextTimer <= 0) activeAnimations.shakingBuses.delete(busId);
      else activeAnimations.shakingBuses.set(busId, nextTimer);
    }

    // 2. Floating toast alerts
    for (let i = activeAnimations.floatingAlerts.length - 1; i >= 0; i--) {
      const a = activeAnimations.floatingAlerts[i];
      a.y -= 26 * dt;
      a.life -= dt;
      if (a.life <= 0) activeAnimations.floatingAlerts.splice(i, 1);
    }

    // 3. Sliding bus into bay
    if (activeAnimations.slidingBus) {
      const anim = activeAnimations.slidingBus;
      anim.progress += dt / anim.duration;
      if (anim.progress >= 1) {
        anim.bus.isSliding = false;
        activeAnimations.slidingBus = null;
      }
    }

    // 4. Boarding passenger
    if (activeAnimations.boardingPassenger) {
      const anim = activeAnimations.boardingPassenger;
      anim.progress += dt / anim.duration;
      if (anim.progress >= 1) {
        anim.targetBus.seated = (anim.targetBus.seated || 0) + 1;
        activeAnimations.boardingPassenger = null;

        // If full (3/3), launch departure!
        if (anim.targetBus.seated >= (anim.targetBus.capacity || DEFAULT_BUS_CAPACITY)) {
          playSound('depart');
          anim.targetBus.isDeparting = true;
          const bayBox = getBayBox(anim.targetBus.bayIndex);
          spawnExhaust(bayBox.x + bayBox.w - 6, bayBox.y + bayBox.h / 2);

          activeAnimations.departingBus = {
            bus: anim.targetBus,
            slotIndex: anim.targetBus.bayIndex,
            fromX: bayBox.x + 4,
            fromY: bayBox.y + 4,
            w: bayBox.w - 8,
            h: bayBox.h - 8,
            progress: 0,
            duration: 0.32
          };
        }
      }
    }

    // 5. Departing bus zooming away
    if (activeAnimations.departingBus) {
      const anim = activeAnimations.departingBus;
      anim.progress += dt / anim.duration;
      if (anim.progress >= 1) {
        baySlots[anim.slotIndex] = null;
        state.bays = baySlots.filter(Boolean);
        state.completedBuses.push(anim.bus);
        activeAnimations.departingBus = null;
      }
    }

    // 6. CONTINUOUS ROBUST QUEUE PROCESSING
    if (!activeAnimations.boardingPassenger && !activeAnimations.departingBus) {
      if (state.queue.length > 0) {
        const nextColor = state.queue[0];
        const targetBus = baySlots.find(b =>
          b &&
          !b.isSliding &&
          !b.isDeparting &&
          b.color === nextColor &&
          (b.seated || 0) < (b.capacity || DEFAULT_BUS_CAPACITY)
        );

        if (targetBus) {
          const targetBayBox = getBayBox(targetBus.bayIndex);
          const seatIndex = targetBus.seated || 0;
          const seatDotX = targetBayBox.x + targetBayBox.w / 2 - 20 + seatIndex * 20;
          const seatDotY = targetBayBox.y + targetBayBox.h - 16;
          const startPos = getPassengerQueuePos(0);

          state.queue.shift();
          playSound('board');

          activeAnimations.boardingPassenger = {
            color: nextColor,
            fromX: startPos.x,
            fromY: startPos.y,
            toX: seatDotX,
            toY: seatDotY,
            targetBus,
            progress: 0,
            duration: 0.22
          };
        } else {
          // Check deadlock (out of slots)
          const allOccupied = baySlots.every(b => b !== null && !b.isDeparting);
          if (allOccupied && !state.isGameOver) {
            state.isGameOver = true;
            playSound('lose');
          }
        }
      } else {
        // Queue is finished! Check if all buses in parking lot & bays have departed
        const allCleared = state.buses.length === 0 &&
                           baySlots.every(b => b === null) &&
                           !activeAnimations.slidingBus &&
                           !activeAnimations.departingBus;
        if (allCleared && !state.isWon) {
          state.isWon = true;
          playSound('win');
          spawnConfetti();
        }
      }
    }

    // 7. Particles
    for (let i = activeAnimations.particles.length - 1; i >= 0; i--) {
      const p = activeAnimations.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 320 * dt;
      p.rot += (p.vrot || 0) * dt;
      p.life -= dt;
      if (p.life <= 0) activeAnimations.particles.splice(i, 1);
    }
  }

  // Draw Helpers
  function drawRoundedRect(c, x, y, w, h, r) {
    c.beginPath();
    c.roundRect(x, y, w, h, r);
  }

  function drawPassengerAvatar(c, x, y, color, isFront = false, bob = 0) {
    const hex = COLORS[color] || color || '#FFF';
    const py = y + bob;

    // Drop Shadow
    c.fillStyle = 'rgba(0, 0, 0, 0.4)';
    c.beginPath();
    c.ellipse(x, py + 16, 12, 4, 0, 0, Math.PI * 2);
    c.fill();

    // Body with 3D highlight
    c.fillStyle = hex;
    c.beginPath();
    c.roundRect(x - 10, py - 4, 20, 20, [8, 8, 4, 4]);
    c.fill();

    // Body soft inner gleam
    c.fillStyle = 'rgba(255, 255, 255, 0.25)';
    c.beginPath();
    c.roundRect(x - 7, py - 2, 14, 6, 3);
    c.fill();

    // Head
    c.fillStyle = '#FFE0BD';
    c.beginPath();
    c.arc(x, py - 10, 9, 0, Math.PI * 2);
    c.fill();

    // Cap with matching color
    c.fillStyle = hex;
    c.beginPath();
    c.arc(x, py - 12, 9, Math.PI, 0);
    c.fill();
    c.beginPath();
    c.roundRect(x - 8, py - 14, 16, 5, 2);
    c.fill();

    // Eyes
    c.fillStyle = '#1A202C';
    c.beginPath();
    c.arc(x - 3, py - 10, 1.4, 0, Math.PI * 2);
    c.arc(x + 3, py - 10, 1.4, 0, Math.PI * 2);
    c.fill();

    // Joyful smile
    c.strokeStyle = '#4A5568';
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(x, py - 9, 3, 0.15 * Math.PI, 0.85 * Math.PI);
    c.stroke();

    // Front passenger floating golden marker
    if (isFront) {
      c.fillStyle = '#FFD700';
      c.beginPath();
      const pointerY = py - 20 + Math.sin(Date.now() / 150) * 2.5;
      c.moveTo(x - 5, pointerY);
      c.lineTo(x + 5, pointerY);
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

    // Drop Shadow
    c.fillStyle = 'rgba(0, 0, 0, 0.45)';
    drawRoundedRect(c, bx + 2, by + 4, w, h, 11);
    c.fill();

    // Main Bus Chassis
    c.fillStyle = hex;
    drawRoundedRect(c, bx, by, w, h, 10);
    c.fill();

    // Glossy Top Reflection
    c.fillStyle = 'rgba(255, 255, 255, 0.26)';
    drawRoundedRect(c, bx + 3, by + 2, w - 6, Math.max(5, h * 0.22), [8, 8, 2, 2]);
    c.fill();

    // Side wheels detail
    c.fillStyle = '#1A202C';
    if (dir === 'U' || dir === 'D') {
      c.fillRect(bx - 2, by + 10, 2, 8);
      c.fillRect(bx + w, by + 10, 2, 8);
      c.fillRect(bx - 2, by + h - 18, 2, 8);
      c.fillRect(bx + w, by + h - 18, 2, 8);
    } else {
      c.fillRect(bx + 10, by - 2, 8, 2);
      c.fillRect(bx + 10, by + h, 8, 2);
      c.fillRect(bx + w - 18, by - 2, 8, 2);
      c.fillRect(bx + w - 18, by + h, 8, 2);
    }

    // Windshield & Headlights facing direction
    c.fillStyle = '#1A202C';
    let arrowAngle = 0;
    if (dir === 'U') {
      arrowAngle = -Math.PI / 2;
      drawRoundedRect(c, bx + 4, by + 3, w - 8, Math.min(13, h * 0.26), 4);
      c.fill();
      // Glowing headlights
      c.fillStyle = '#FFF9D2';
      c.fillRect(bx + 4, by + 1, 5, 2);
      c.fillRect(bx + w - 9, by + 1, 5, 2);
    } else if (dir === 'D') {
      arrowAngle = Math.PI / 2;
      drawRoundedRect(c, bx + 4, by + h - 16, w - 8, Math.min(13, h * 0.26), 4);
      c.fill();
      c.fillStyle = '#FFF9D2';
      c.fillRect(bx + 4, by + h - 3, 5, 2);
      c.fillRect(bx + w - 9, by + h - 3, 5, 2);
    } else if (dir === 'L') {
      arrowAngle = Math.PI;
      drawRoundedRect(c, bx + 3, by + 4, Math.min(13, w * 0.26), h - 8, 4);
      c.fill();
      c.fillStyle = '#FFF9D2';
      c.fillRect(bx + 1, by + 4, 2, 5);
      c.fillRect(bx + 1, by + h - 9, 2, 5);
    } else if (dir === 'R') {
      arrowAngle = 0;
      drawRoundedRect(c, bx + w - 16, by + 4, Math.min(13, w * 0.26), h - 8, 4);
      c.fill();
      c.fillStyle = '#FFF9D2';
      c.fillRect(bx + w - 3, by + 4, 2, 5);
      c.fillRect(bx + w - 3, by + h - 9, 2, 5);
    }

    const centerX = bx + w / 2;
    const centerY = by + h / 2;

    if (!inBay) {
      // 3D Direction Arrow on Roof
      c.save();
      c.translate(centerX, centerY);
      c.rotate(arrowAngle);
      c.fillStyle = 'rgba(255, 255, 255, 0.92)';
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
      // In Bay: Display Counter badge
      c.fillStyle = '#FFFFFF';
      c.font = 'bold 12px sans-serif';
      c.textAlign = 'center';
      c.fillText(`${bus.seated || 0}/${bus.capacity || DEFAULT_BUS_CAPACITY}`, centerX, centerY + 2);
    }

    // Capacity Seat Dots
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

    // Dynamic Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0F1218');
    bgGrad.addColorStop(1, '#090B0F');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 1. HUD Header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';

    // Prev Button
    ctx.fillStyle = currentLevelIndex > 0 ? '#CBD5E0' : '#4A5568';
    ctx.fillText('‹', 18, 25);

    // Level Title Badge
    ctx.fillStyle = '#FFFFFF';
    const lvlName = state.levelName || `Màn ${currentLevelIndex + 1}`;
    ctx.fillText(`MÀN ${currentLevelIndex + 1}: ${lvlName.toUpperCase()}`, 38, 25);

    // Next Button
    ctx.fillStyle = currentLevelIndex < LEVELS.length - 1 ? '#CBD5E0' : '#4A5568';
    ctx.fillText('›', 256, 25);

    // Restart Button
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillText('↺', 310, 26);

    // Sound Button
    ctx.fillText(soundEnabled ? '🔊' : '🔇', 346, 26);

    // 2. Passenger Station Platform
    drawRoundedRect(ctx, 14, 44, W - 28, 74, 12);
    ctx.fillStyle = '#1A202C';
    ctx.fill();
    ctx.strokeStyle = '#2D3748';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Safety edge line
    ctx.fillStyle = '#D69E2E';
    ctx.fillRect(16, 115, W - 32, 3);

    // Platform Label
    ctx.font = 'bold 10px -apple-system, sans-serif';
    ctx.fillStyle = '#A0AEC0';
    ctx.fillText('HÀNG CHỜ', 24, 56);

    // Remaining Passenger Counter Badge
    const totalRemaining = state.queue.length + (activeAnimations.boardingPassenger ? 1 : 0);
    drawRoundedRect(ctx, W - 92, 47, 66, 18, 9);
    ctx.fillStyle = '#2D3748';
    ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    ctx.textAlign = 'center';
    ctx.fillText(`${totalRemaining} KHÁCH`, W - 59, 60);

    // Draw Waiting Passengers
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

    // 3. Waiting Bays (Fixed Slots)
    for (let i = 0; i < (state.maxBays || MAX_BAYS); i++) {
      const box = getBayBox(i);
      drawRoundedRect(ctx, box.x, box.y, box.w, box.h, 10);
      ctx.fillStyle = 'rgba(26, 32, 44, 0.85)';
      ctx.fill();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#4A5568';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#718096';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`BẾN ${i + 1}`, box.x + box.w / 2, box.y + 14);

      // Render bus docked in this bay slot (unless it's currently zooming off)
      const busInBay = baySlots[i];
      if (busInBay && !busInBay.isSliding && (!activeAnimations.departingBus || activeAnimations.departingBus.bus.id !== busInBay.id)) {
        drawBus(ctx, box.x + 4, box.y + 4, box.w - 8, box.h - 8, busInBay, { x: 0, y: 0 }, true);
      }
    }

    // 4. Parking Lot Grid
    drawRoundedRect(ctx, gridStartX - 4, gridStartY - 4, gridAreaWidth + 8, gridAreaHeight + 8, 14);
    ctx.fillStyle = '#141721';
    ctx.fill();
    ctx.strokeStyle = '#232936';
    ctx.lineWidth = 2;
    ctx.stroke();

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

    // Render buses in Parking Lot
    for (const bus of state.buses) {
      const box = getBusParkingBox(bus, state.gridWidth, state.gridHeight);
      let shake = { x: 0, y: 0 };
      if (activeAnimations.shakingBuses.has(bus.id)) {
        const timer = activeAnimations.shakingBuses.get(bus.id);
        const amount = Math.sin((0.22 - timer) * 45) * 5;
        if (bus.direction === 'U' || bus.direction === 'D') shake.x = amount;
        else shake.y = amount;
      }
      drawBus(ctx, box.x, box.y, box.w, box.h, bus, shake, false);
    }

    // 5. Active Animations
    // Bus sliding to bay
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

    // Passenger jumping into seat
    if (activeAnimations.boardingPassenger) {
      const anim = activeAnimations.boardingPassenger;
      const t = Math.min(1, anim.progress);
      const curX = anim.fromX + (anim.toX - anim.fromX) * t;
      const arcHeight = -36 * Math.sin(t * Math.PI);
      const curY = anim.fromY + (anim.toY - anim.fromY) * t + arcHeight;
      drawPassengerAvatar(ctx, curX, curY, anim.color, false, 0);
    }

    // Full bus zooming away
    if (activeAnimations.departingBus) {
      const anim = activeAnimations.departingBus;
      const t = Math.min(1, anim.progress);
      const speed = t * t * 400;
      const curX = anim.fromX + speed;
      const curY = anim.fromY;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t * 1.2);
      drawBus(ctx, curX, curY, anim.w, anim.h, anim.bus, { x: 0, y: 0 }, true);
      ctx.restore();
    }

    // Toast alerts (e.g. "⛔ Bị chặn!")
    for (const a of activeAnimations.floatingAlerts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, a.life / 0.65);
      drawRoundedRect(ctx, a.x - 42, a.y - 12, 84, 22, 6);
      ctx.fillStyle = '#E53E3E';
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(a.text, a.x, a.y + 3);
      ctx.restore();
    }

    // Particles (confetti and exhaust)
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
      ctx.fillStyle = 'rgba(10, 14, 22, 0.9)';
      ctx.fillRect(0, 0, W, H);

      // Card Modal Box
      drawRoundedRect(ctx, 30, H / 2 - 120, W - 60, 240, 18);
      ctx.fillStyle = '#1A202C';
      ctx.fill();
      ctx.strokeStyle = '#3182CE';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Golden Trophy
      ctx.font = '44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏆', W / 2, H / 2 - 58);

      // 3 Gold Stars
      ctx.font = '20px sans-serif';
      ctx.fillText('⭐⭐⭐', W / 2, H / 2 - 24);

      // Victory Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px -apple-system, sans-serif';
      ctx.fillText('CHIẾN THẮNG!', W / 2, H / 2 + 6);

      ctx.font = '13px -apple-system, sans-serif';
      ctx.fillStyle = '#A0AEC0';
      ctx.fillText('Đã đón hết hành khách và dọn sạch bến!', W / 2, H / 2 + 28);

      // Big Vibrant Button
      drawRoundedRect(ctx, W / 2 - 100, H / 2 + 48, 200, 46, 12);
      const btnGrad = ctx.createLinearGradient(W / 2 - 100, 0, W / 2 + 100, 0);
      btnGrad.addColorStop(0, '#3182CE');
      btnGrad.addColorStop(1, '#63B3ED');
      ctx.fillStyle = btnGrad;
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px -apple-system, sans-serif';
      ctx.fillText(currentLevelIndex < LEVELS.length - 1 ? 'MÀN TIẾP THEO →' : 'CHƠI LẠI TỪ ĐẦU ↺', W / 2, H / 2 + 76);
    } else if (state.isGameOver) {
      ctx.fillStyle = 'rgba(10, 14, 22, 0.9)';
      ctx.fillRect(0, 0, W, H);

      drawRoundedRect(ctx, 30, H / 2 - 110, W - 60, 220, 18);
      ctx.fillStyle = '#1A202C';
      ctx.fill();
      ctx.strokeStyle = '#E53E3E';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️', W / 2, H / 2 - 52);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px -apple-system, sans-serif';
      ctx.fillText('HẾT CHỖ ĐỖ!', W / 2, H / 2 - 10);

      ctx.font = '12px -apple-system, sans-serif';
      ctx.fillStyle = '#CBD5E0';
      ctx.fillText('Bãi chờ đã kín mà khách không khớp màu.', W / 2, H / 2 + 14);

      drawRoundedRect(ctx, W / 2 - 90, H / 2 + 36, 180, 44, 12);
      ctx.fillStyle = '#E53E3E';
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px -apple-system, sans-serif';
      ctx.fillText('THỬ LẠI MÀN NÀY ↺', W / 2, H / 2 + 63);
    }
  }

  // Animation Loop
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
