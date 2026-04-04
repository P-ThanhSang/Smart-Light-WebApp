// Smart Light PWA — Mode Toggle Component
import { subscribe, getState } from '../services/state.js';
import { sendCommand } from '../services/supabase-service.js';

export function createModeToggle() {
  const wrapper = document.createElement('div');
  wrapper.className = 'mode-toggle-wrapper glass-card';
  wrapper.id = 'mode-toggle-wrapper';
  wrapper.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) var(--space-lg);
  `;

  wrapper.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 2px;">
      <span id="mode-label" style="font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--text-primary);">
        Chế độ: Tự động
      </span>
      <span id="mode-desc" style="font-size: var(--font-size-xs); color: var(--text-secondary);">
        Hệ thống tự điều khiển đèn
      </span>
    </div>
    <div class="toggle-switch" id="mode-toggle">
      <div class="toggle-switch__knob"></div>
    </div>
  `;

  const toggle = wrapper.querySelector('#mode-toggle');
  const label = wrapper.querySelector('#mode-label');
  const desc = wrapper.querySelector('#mode-desc');

  // Click handler — send command via Supabase (or mock)
  toggle.addEventListener('click', () => {
    const state = getState();
    const newMode = state.mode === 'auto' ? 'manual' : 'auto';
    sendCommand('set_mode', { mode: newMode });
  });

  // Subscribe to state
  subscribe((state) => {
    const isAuto = state.mode === 'auto';

    if (isAuto) {
      toggle.classList.remove('toggle-switch--active');
      label.textContent = 'Chế độ: Tự động';
      label.style.color = 'var(--text-primary)';
      desc.textContent = 'Hệ thống tự điều khiển đèn';
    } else {
      toggle.classList.add('toggle-switch--active');
      label.textContent = 'Chế độ: Thủ công';
      label.style.color = 'var(--accent-green)';
      desc.textContent = 'Bạn điều khiển đèn trực tiếp';
    }
  });

  return wrapper;
}
