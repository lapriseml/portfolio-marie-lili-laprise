// Orb hero et animation hyperspace

const HS_DURATION = 1200;
const HS_STARS = 520;

function runHyperspace(cb) {
  const canvas = document.getElementById('hyperspace');
  if (!canvas) return cb();

  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const stars = Array.from({ length: HS_STARS }, () => ({
    angle: Math.random() * Math.PI * 2,
    dist: Math.random() * 80 + 20,
    speed: Math.random() * 5 + 3,
    size: Math.random() * 1.5 + 0.3,
    color: Math.random() > 0.15 ? '#ffffff' : (Math.random() > 0.5 ? '#c8c8ff' : '#e8e8e8')
  }));

  let moved = false;
  const state = { progress: 0 };

  function render(progress) {
    const t = Math.min(progress, 1);
    const fadeStart = 0.6;
    const dissolveT = t > fadeStart ? (t - fadeStart) / (1 - fadeStart) : 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgba(6,4,10,${0.92 - dissolveT * 0.92})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach((star) => {
      star.dist += star.speed * (1 + t * 4);
      const x = cx + Math.cos(star.angle) * star.dist;
      const y = cy + Math.sin(star.angle) * star.dist;
      const len = Math.min(18 + t * 30, star.dist - 2);
      const x0 = cx + Math.cos(star.angle) * (star.dist - len);
      const y0 = cy + Math.sin(star.angle) * (star.dist - len);
      const alpha = Math.max(0, 1 - dissolveT * 1.4);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x, y);
      ctx.strokeStyle = star.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = star.size;
      ctx.stroke();
    });

    if (!moved && t >= 0.6) {
      moved = true;
      cb();
    }
  }

  gsap.to(state, {
    progress: 1,
    duration: HS_DURATION / 1000,
    ease: 'none',
    onUpdate: () => render(state.progress),
    onComplete: () => setTimeout(() => { canvas.style.display = 'none'; }, 100)
  });
}

export {
  runHyperspace,
};
