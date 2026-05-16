// Smart Light PWA — LDR Gauge Component (SVG Circular Gauge)
// Demo animation when ESP32 not sending data, real data when active
import { subscribe, getState } from '../services/state.js';

const MAX_LDR = 4095;
const DEMO_HALF_CYCLE_MS = 5000;
const STALE_TIMEOUT_MS = 5000; // If LDR unchanged for 5s → ESP32 offline

// Color palette: neon/fluorescent — bright and vibrant
const BAND_COLORS = [
  '#b388ff',  // 0–500     (soft violet neon)
  '#82b1ff',  // 500–1000  (sky blue neon)
  '#40c4ff',  // 1000–1500 (electric cyan)
  '#64ffda',  // 1500–2000 (mint neon)
  '#69f0ae',  // 2000–2500 (neon green)
  '#eeff41',  // 2500–3000 (neon yellow)
  '#ffab40',  // 3000–3500 (neon orange)
  '#ff5252',  // 3500–4000 (neon red-pink)
];

function getColorForValue(ldr) {
  const index = Math.min(Math.floor(ldr / 500), BAND_COLORS.length - 1);
  return BAND_COLORS[index];
}

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
        <circle cx="60" cy="60" r="${RADIUS}" fill="none" 
          stroke="var(--bg-secondary)" stroke-width="8" 
          stroke-linecap="round"
          transform="rotate(-90 60 60)"
          stroke-dasharray="${CIRCUMFERENCE}"
        />
        <circle cx="60" cy="60" r="${RADIUS}" fill="none" 
          stroke="${BAND_COLORS[0]}" stroke-width="8" 
          stroke-linecap="round"
          transform="rotate(-90 60 60)"
          stroke-dasharray="${CIRCUMFERENCE}"
          stroke-dashoffset="${CIRCUMFERENCE}"
          id="ldr-gauge-arc"
          style="transition: stroke 0.3s ease;"
        />
      </svg>
      <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <span id="ldr-gauge-value" style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); font-variant-numeric: tabular-nums; transition: color 0.3s ease;">
          ···
        </span>
        <span style="font-size: var(--font-size-xs); color: var(--text-muted);">lux</span>
      </div>
    </div>
    <div style="
      width: 100%; height: 6px; border-radius: 3px; margin-top: var(--space-md);
      background: linear-gradient(to right, ${BAND_COLORS.join(', ')});
      opacity: 0.6;
    "></div>
    <div style="display: flex; justify-content: space-between; width: 100%; margin-top: var(--space-xs);">
      <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Tối 🌙</span>
      <span id="ldr-gauge-percent" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); font-variant-numeric: tabular-nums; transition: color 0.3s ease;">—</span>
      <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Sáng ☀️</span>
    </div>
  `;

  const arc = wrapper.querySelector('#ldr-gauge-arc');
  const valueEl = wrapper.querySelector('#ldr-gauge-value');
  const percentEl = wrapper.querySelector('#ldr-gauge-percent');

  // --- Render helper ---
  function renderGauge(ldr, isDemo) {
    const pct = Math.min(ldr / MAX_LDR, 1);
    const offset = CIRCUMFERENCE * (1 - pct);
    const color = getColorForValue(ldr);

    if (arc) {
      arc.setAttribute('stroke-dashoffset', offset);
      arc.setAttribute('stroke', color);
      arc.style.filter = `drop-shadow(0 0 6px ${color}40)`;
    }
    if (valueEl) {
      valueEl.textContent = isDemo ? '···' : Math.round(ldr);
      valueEl.style.color = isDemo ? 'var(--text-muted)' : color;
    }
    if (percentEl) {
      percentEl.textContent = isDemo ? '—' : `${Math.round(pct * 100)}%`;
      percentEl.style.color = isDemo ? 'var(--text-muted)' : color;
    }
  }

  // --- Demo animation ---
  let demoRafId = null;
  let demoStartTime = null;
  let hardwareActive = false;
  let lastLdrValue = null;
  let lastLdrChangeTime = 0;
  let ldrChangeCount = 0; // Need 3+ changes to confirm ESP32 is live

  function demoTick(timestamp) {
    if (hardwareActive) { demoRafId = null; return; }
    if (!demoStartTime) demoStartTime = timestamp;

    const elapsed = (timestamp - demoStartTime) % (DEMO_HALF_CYCLE_MS * 2);
    let ldr;
    if (elapsed < DEMO_HALF_CYCLE_MS) {
      ldr = (elapsed / DEMO_HALF_CYCLE_MS) * 4000;
    } else {
      ldr = (1 - (elapsed - DEMO_HALF_CYCLE_MS) / DEMO_HALF_CYCLE_MS) * 4000;
    }

    renderGauge(ldr, true);
    demoRafId = requestAnimationFrame(demoTick);
  }

  function startDemo() {
    if (demoRafId) return;
    demoStartTime = null;
    demoRafId = requestAnimationFrame(demoTick);
  }

  function stopDemo() {
    if (demoRafId) { cancelAnimationFrame(demoRafId); demoRafId = null; }
  }

  // Start demo immediately
  startDemo();

  // --- Subscribe: detect real hardware data ---
  // Page load sequence: initialState(ldr=2048) → DB fetch(ldr=2442) → that's 2 changes
  // ESP32 live: sends new readings every ~2s → 3rd+ change = confirmed active
  subscribe((state) => {
    const now = Date.now();

    if (state.ldr !== lastLdrValue) {
      lastLdrValue = state.ldr;
      lastLdrChangeTime = now;
      ldrChangeCount++;

      // Require 3+ distinct changes to confirm ESP32 is actively sending
      if (ldrChangeCount >= 3 && !hardwareActive) {
        hardwareActive = true;
        stopDemo();
      }
    }

    // If hardware was active but LDR stopped changing → ESP32 went offline
    if (hardwareActive && (now - lastLdrChangeTime > STALE_TIMEOUT_MS)) {
      hardwareActive = false;
      ldrChangeCount = 0;
      startDemo();
    }

    // Show real data when hardware is active
    if (hardwareActive) {
      renderGauge(state.ldr, false);
    }
  });

  return wrapper;
}
