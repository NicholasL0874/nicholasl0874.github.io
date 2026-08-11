// Hero oscilloscope: a signal that starts as a square wave (circuits)
// and settles into a sine wave (audio) — the page's visual thesis.

const canvas = document.getElementById('scope');
const ctx = canvas ? canvas.getContext('2d') : null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let width, height, dpr;

function resize() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function squareWave(x, amp, freq, phase) {
  const t = (x * freq + phase) % 1;
  return t < 0.5 ? amp : -amp;
}

function sineWave(x, amp, freq, phase) {
  return amp * Math.sin((x * freq + phase) * Math.PI * 2);
}

function drawTrace(time) {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  const midY = height * 0.55;
  const amp = height * 0.09;
  const freq = 3.5;

  // blend factor: oscillates slowly between "square" (0) and "sine" (1)
  const blend = (Math.sin(time * 0.0004) + 1) / 2;

  ctx.beginPath();
  const steps = Math.floor(width / 2);
  for (let i = 0; i <= steps; i++) {
    const xNorm = i / steps;
    const x = xNorm * width;
    const sq = squareWave(xNorm, amp, freq, time * 0.00025);
    const sn = sineWave(xNorm, amp, freq, time * 0.00025);
    const y = midY + sq * (1 - blend) + sn * blend;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#ffb454');
  gradient.addColorStop(1, '#5fd6c4');
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.6;
  ctx.shadowColor = 'rgba(255,180,84,0.25)';
  ctx.shadowBlur = 6;
  ctx.stroke();

  // faint grid, oscilloscope-style
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  const gridStep = 40;
  for (let gx = 0; gx < width; gx += gridStep) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, height);
    ctx.stroke();
  }
  for (let gy = 0; gy < height; gy += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(width, gy);
    ctx.stroke();
  }
}

function loop(t) {
  drawTrace(t);
  requestAnimationFrame(loop);
}

if (canvas && ctx) {
  resize();
  window.addEventListener('resize', resize);
  if (prefersReducedMotion) {
    drawTrace(0); // draw one static frame, no animation loop
  } else {
    requestAnimationFrame(loop);
  }
}

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}
