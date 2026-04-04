// Smart Light PWA — LDR Gauge Component (SVG Circular Gauge)
import { subscribe } from '../services/state.js';

export function createLdrGauge() {
  const wrapper = document.createElement('div');
  wrapper.className = 'ldr-gauge glass-card';
  wrapper.id = 'ldr-gauge';
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-lg);
  `;

  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  wrapper.innerHTML = `
    <div class="section-title" style="align-self: flex-start;">Cảm biến ánh sáng (LDR)</div>
    <div style="position: relative; width: 140px; height: 140px;">
      <svg viewBox="0 0 120 120" width="140" height="140">
        <!-- Background circle -->
        <circle cx="60" cy="60" r="${RADIUS}" fill="none" 
          stroke="var(--bg-secondary)" stroke-width="8" 
          stroke-linecap="round"
          transform="rotate(-90 60 60)"
          stroke-dasharray="${CIRCUMFERENCE}"
        />
        <!-- Value arc -->
        <circle cx="60" cy="60" r="${RADIUS}" fill="none" 
          stroke="var(--accent-cyan)" stroke-width="8" 
          stroke-linecap="round"
          transform="rotate(-90 60 60)"
          stroke-dasharray="${CIRCUMFERENCE}"
          stroke-dashoffset="${CIRCUMFERENCE}"
          id="ldr-gauge-arc"
          style="transition: stroke-dashoffset 0.4s ease, stroke 0.3s ease; filter: drop-shadow(0 0 4px var(--accent-cyan-glow));"
        />
      </svg>
      <!-- Center text -->
      <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <span id="ldr-gauge-value" style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--text-primary); font-variant-numeric: tabular-nums; transition: color 0.3s ease;">
          0
        </span>
        <span style="font-size: var(--font-size-xs); color: var(--text-muted);">lux</span>
      </div>
    </div>
    <div style="display: flex; justify-content: space-between; width: 100%; margin-top: var(--space-sm);">
      <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Tối 🌙</span>
      <span id="ldr-gauge-percent" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--accent-cyan); font-variant-numeric: tabular-nums;">0%</span>
      <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Sáng ☀️</span>
    </div>
  `;

  const arc = wrapper.querySelector('#ldr-gauge-arc');
  const valueEl = wrapper.querySelector('#ldr-gauge-value');
  const percentEl = wrapper.querySelector('#ldr-gauge-percent');

  subscribe((state) => {
    const percent = state.ldr_percent / 100;
    const offset = CIRCUMFERENCE * (1 - percent);

    if (arc) {
      arc.setAttribute('stroke-dashoffset', offset);
      // Color changes based on light level
      if (state.ldr_percent < 30) {
        arc.setAttribute('stroke', 'var(--accent-purple)');
      } else if (state.ldr_percent < 70) {
        arc.setAttribute('stroke', 'var(--accent-cyan)');
      } else {
        arc.setAttribute('stroke', 'var(--accent-amber)');
      }
    }

    if (valueEl) {
      valueEl.textContent = state.ldr;
      if (state.ldr_percent < 30) {
        valueEl.style.color = 'var(--accent-purple)';
      } else if (state.ldr_percent < 70) {
        valueEl.style.color = 'var(--accent-cyan)';
      } else {
        valueEl.style.color = 'var(--accent-amber)';
      }
    }

    if (percentEl) {
      percentEl.textContent = `${state.ldr_percent}%`;
    }
  });

  return wrapper;
}
