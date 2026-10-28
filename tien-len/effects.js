// Visual Effects (VFX) Manager for Tiến Lên Miền Nam
// Screen shake, explosive banner popups, floating money, confetti particles

export class EffectsManager {
  constructor(container) {
    this.container = container;
  }

  // Screen shake
  shakeScreen(intensity = 12, duration = 300) {
    if (!this.container) return;
    const startTime = Date.now();
    const originalTransform = this.container.style.transform || '';

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(interval);
        this.container.style.transform = originalTransform;
        return;
      }
      const decay = 1 - elapsed / duration;
      const dx = (Math.random() * 2 - 1) * intensity * decay;
      const dy = (Math.random() * 2 - 1) * intensity * decay;
      this.container.style.transform = `translate(${dx}px, ${dy}px)`;
    }, 16);
  }

  // Epic Banner Pop: "CHẶT HEO!", "TỨ QUÝ!", "ĐÈ HÀNG!"
  showBanner(text, subtext = '', type = 'chop') {
    const banner = document.createElement('div');
    banner.className = `vfx-banner vfx-${type}`;
    banner.innerHTML = `
      <div class="vfx-banner-text">${text}</div>
      ${subtext ? `<div class="vfx-banner-sub">${subtext}</div>` : ''}
    `;

    document.body.appendChild(banner);

    // Trigger animation
    requestAnimationFrame(() => {
      banner.classList.add('vfx-show');
    });

    setTimeout(() => {
      banner.classList.remove('vfx-show');
      banner.classList.add('vfx-hide');
      setTimeout(() => banner.remove(), 400);
    }, 1600);
  }

  // Floating Coin / Penalty text
  showFloatingScore(element, amount, isGain = true) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const floater = document.createElement('div');
    floater.className = `vfx-floater ${isGain ? 'gain' : 'loss'}`;
    floater.textContent = `${isGain ? '+' : '-'}${Math.abs(amount).toLocaleString('vi-VN')} Xu`;

    floater.style.left = `${rect.left + rect.width / 2}px`;
    floater.style.top = `${rect.top}px`;

    document.body.appendChild(floater);
    setTimeout(() => floater.remove(), 1800);
  }

  // Confetti explosion on victory
  launchConfetti() {
    const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#e67e22'];
    const count = 70;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'vfx-confetti';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${Math.random() * 100}vw`;
      p.style.top = '-10px';
      p.style.width = `${Math.random() * 8 + 6}px`;
      p.style.height = `${Math.random() * 12 + 8}px`;
      p.style.transform = `rotate(${Math.random() * 360}deg)`;

      const duration = Math.random() * 2 + 1.8;
      const delay = Math.random() * 0.4;
      p.style.animation = `confettiFall ${duration}s ease-out ${delay}s forwards`;

      document.body.appendChild(p);
      setTimeout(() => p.remove(), (duration + delay) * 1000 + 200);
    }
  }

  // Flying Emoji / Item toss
  throwItem(fromElem, toElem, item = '👡') {
    if (!fromElem || !toElem) return;
    const r1 = fromElem.getBoundingClientRect();
    const r2 = toElem.getBoundingClientRect();

    const projectile = document.createElement('div');
    projectile.className = 'vfx-projectile';
    projectile.textContent = item;
    projectile.style.left = `${r1.left + r1.width / 2}px`;
    projectile.style.top = `${r1.top + r1.height / 2}px`;

    document.body.appendChild(projectile);

    const targetX = r2.left + r2.width / 2;
    const targetY = r2.top + r2.height / 2;

    requestAnimationFrame(() => {
      projectile.style.transform = `translate(${targetX - (r1.left + r1.width / 2)}px, ${targetY - (r1.top + r1.height / 2)}px) scale(1.4) rotate(720deg)`;
    });

    setTimeout(() => {
      // Impact splash
      const splash = document.createElement('div');
      splash.className = 'vfx-splash';
      splash.textContent = item;
      splash.style.left = `${targetX}px`;
      splash.style.top = `${targetY}px`;
      document.body.appendChild(splash);

      projectile.remove();
      setTimeout(() => splash.remove(), 600);
    }, 700);
  }
}
