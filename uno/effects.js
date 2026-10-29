// Visual FX Engine for UNO: Confetti, Shockwave & Reward Badges

export class UnoEffects {
  /**
   * Tạo hiệu ứng pháo hoa giấy vinh quang (Confetti Explosion)
   */
  static triggerConfetti(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#FFFFFF'];
    const particles = [];
    const count = 120;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.45 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.9) * 16 - 4,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        alpha: 1,
        gravity: 0.38
      });
    }

    let animId = null;
    const startTime = performance.now();

    function render(time) {
      const elapsed = time - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = 0;
      for (const p of particles) {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        if (elapsed > 1500) {
          p.alpha -= 0.02;
        }

        if (p.alpha > 0 && p.y < canvas.height + 50) {
          alive++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      if (alive > 0 && elapsed < 3500) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animId);
      }
    }

    animId = requestAnimationFrame(render);
  }

  /**
   * Hiển thị thông báo Toast ngắn ở giữa phía trên màn hình
   */
  static showToast(message, type = 'info', duration = 2500) {
    let container = document.getElementById('unoToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'unoToastContainer';
      container.style.cssText = `
        position: fixed;
        top: 68px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `uno-toast uno-toast-${type}`;
    toast.style.cssText = `
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(12px);
      border: 1px solid ${
        type === 'warning'
          ? 'rgba(245, 158, 11, 0.6)'
          : type === 'danger'
          ? 'rgba(239, 68, 68, 0.7)'
          : type === 'success'
          ? 'rgba(16, 185, 129, 0.6)'
          : 'rgba(59, 130, 246, 0.5)'
      };
      color: #F8FAFC;
      padding: 8px 18px;
      border-radius: 24px;
      font-size: 0.92rem;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    toast.innerHTML = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0) scale(1)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px) scale(0.95)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

  /**
   * Hiệu ứng cộng trứng bay lơ lửng (Floating Egg Badge)
   */
  static showEggReward(amount, targetElement) {
    const badge = document.createElement('div');
    badge.className = 'floating-egg-reward';
    badge.innerHTML = `+${amount} 🥚`;
    badge.style.cssText = `
      position: fixed;
      z-index: 10000;
      font-size: 1.35rem;
      font-weight: 800;
      color: #FBBF24;
      text-shadow: 0 2px 8px rgba(0,0,0,0.8), 0 0 12px rgba(245, 158, 11, 0.8);
      pointer-events: none;
      animation: floatEggUp 1.4s ease-out forwards;
    `;

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      badge.style.left = `${rect.left + rect.width / 2 - 20}px`;
      badge.style.top = `${rect.top - 10}px`;
    } else {
      badge.style.left = '50%';
      badge.style.top = '40%';
      badge.style.transform = 'translateX(-50%)';
    }

    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 1450);
  }
}
