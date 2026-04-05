// Smart Light PWA — Light Button Component
import { subscribe, getState, setState } from '../services/state.js';
import { sendCommand, lockFields } from '../services/supabase-service.js';

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

  const btn = document.createElement('button');
  btn.className = 'light-button';
  btn.id = 'light-button';
  btn.style.cssText = `
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 2px solid var(--border-color);
    background: var(--bg-card);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.3s ease;
    -webkit-tap-highlight-color: transparent;
    position: relative;
    overflow: hidden;
  `;

  const statusLabel = document.createElement('span');
  statusLabel.className = 'light-button__status';
  statusLabel.id = 'light-status';
  statusLabel.style.cssText = `
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--text-muted);
    transition: color var(--transition-base);
  `;

  wrapper.appendChild(btn);
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

    // Icon
    btn.innerHTML = `
      <span style="font-size: 3rem; filter: ${isOn ? 'drop-shadow(0 0 12px rgba(255, 200, 0, 0.6))' : 'none'}; transition: filter 0.3s ease;">
        ${isOn ? '💡' : '🔌'}
      </span>
      <span style="font-size: var(--font-size-xs); color: ${isOn ? 'var(--accent-amber)' : 'var(--text-muted)'}; font-weight: var(--font-weight-semibold);">
        ${isOn ? 'ON' : 'OFF'}
      </span>
    `;

    // Button styles based on state
    if (isOn) {
      btn.style.borderColor = 'var(--accent-amber)';
      btn.style.background = 'rgba(255, 184, 0, 0.08)';
      btn.style.boxShadow = '0 0 30px rgba(255, 184, 0, 0.2), 0 0 60px rgba(255, 184, 0, 0.1)';
    } else {
      btn.style.borderColor = 'var(--border-color)';
      btn.style.background = 'var(--bg-card)';
      btn.style.boxShadow = 'var(--shadow-md)';
    }

    // Disabled state in auto mode
    if (isAuto) {
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      statusLabel.textContent = 'Chế độ tự động';
      statusLabel.style.color = 'var(--text-muted)';
    } else {
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      statusLabel.textContent = isOn ? 'Nhấn để tắt đèn' : 'Nhấn để bật đèn';
      statusLabel.style.color = isOn ? 'var(--accent-amber)' : 'var(--text-secondary)';
    }
  });

  return wrapper;
}
