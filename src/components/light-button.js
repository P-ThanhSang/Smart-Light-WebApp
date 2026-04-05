// Smart Light PWA — Light Button Component (Power Button Design)
import { subscribe, getState, setState } from '../services/state.js';
import { sendCommand, lockFields } from '../services/supabase-service.js';

// Power icon SVG path
const POWER_ICON_SVG = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="power-icon">
    <line x1="12" y1="2" x2="12" y2="12"></line>
    <path d="M16.24 7.76a6 6 0 0 1 .5 8.49A6 6 0 0 1 12 18a6 6 0 0 1-4.74-1.75 6 6 0 0 1 .5-8.49"></path>
  </svg>
`;

export function createLightButton() {
  const wrapper = document.createElement('div');
  wrapper.className = 'light-button-wrapper';
  wrapper.id = 'light-button-wrapper';
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  `;

  // Outer ring (glow container)
  const ring = document.createElement('div');
  ring.className = 'power-btn-ring';
  ring.id = 'power-btn-ring';

  // Main button
  const btn = document.createElement('button');
  btn.className = 'power-btn';
  btn.id = 'light-button';

  ring.appendChild(btn);

  // Status label
  const statusLabel = document.createElement('span');
  statusLabel.className = 'light-button__status';
  statusLabel.id = 'light-status';
  statusLabel.style.cssText = `
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-muted);
    transition: color 0.3s ease;
    letter-spacing: 0.02em;
  `;

  wrapper.appendChild(ring);
  wrapper.appendChild(statusLabel);

  // Click handler — toggle light with optimistic UI update
  btn.addEventListener('click', () => {
    const state = getState();
    if (state.mode === 'auto') return; // Disabled in auto mode
    // Lock field to prevent realtime override
    lockFields(['light']);
    // Optimistic update: immediately reflect in UI
    setState({ light: !state.light });
    // Send command to Supabase/ESP32
    sendCommand('toggle_light');
  });

  // Subscribe to state
  subscribe((state) => {
    const isOn = state.light;
    const isAuto = state.mode === 'auto';

    // Update button content
    btn.innerHTML = `
      ${POWER_ICON_SVG}
      <span class="power-btn__label">${isOn ? 'TẮT' : 'BẬT'}</span>
    `;

    // Remove previous state classes
    ring.classList.remove('power-btn-ring--on', 'power-btn-ring--off', 'power-btn-ring--disabled');
    btn.classList.remove('power-btn--on', 'power-btn--off', 'power-btn--disabled');

    if (isAuto) {
      // Disabled state in auto mode
      ring.classList.add('power-btn-ring--disabled');
      btn.classList.add('power-btn--disabled');
      statusLabel.textContent = 'Chế độ tự động';
      statusLabel.style.color = 'var(--text-muted)';
    } else if (isOn) {
      // Light is ON → show RED button (press to turn OFF)
      ring.classList.add('power-btn-ring--on');
      btn.classList.add('power-btn--on');
      statusLabel.textContent = 'Nhấn để tắt đèn';
      statusLabel.style.color = 'var(--accent-red)';
    } else {
      // Light is OFF → show GREEN button (press to turn ON)
      ring.classList.add('power-btn-ring--off');
      btn.classList.add('power-btn--off');
      statusLabel.textContent = 'Nhấn để bật đèn';
      statusLabel.style.color = 'var(--accent-green)';
    }
  });

  return wrapper;
}
