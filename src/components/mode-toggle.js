// Smart Light PWA — Mode Toggle Component
import { subscribe, getState, setState } from '../services/state.js';
import { sendCommand, lockFields, addLogToSupabase } from '../services/supabase-service.js';

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

  // Click handler — toggle mode with optimistic UI update
  toggle.addEventListener('click', () => {
    const state = getState();
    const newMode = state.mode === 'auto' ? 'manual' : 'auto';
    // Lock field to prevent realtime override
    lockFields(['mode']);
    // Optimistic update: immediately reflect in UI
    setState({ mode: newMode });
    // Send command to Supabase/ESP32
    sendCommand('set_mode', { mode: newMode });
    // Log the action so admin logs page receives it in real-time
    addLogToSupabase('mode', `Chế độ: ${newMode === 'auto' ? 'Tự động' : 'Thủ công'}`);
  });

  // Subscribe to state
  // Auto = toggle ON (active, green text) | Manual = toggle OFF (inactive, red text)
  subscribe((state) => {
    const isAuto = state.mode === 'auto';

    if (isAuto) {
      toggle.classList.add('toggle-switch--active');
      label.textContent = 'Chế độ: Tự động';
      label.style.color = 'var(--accent-green)';
      desc.textContent = 'Hệ thống tự điều khiển đèn';
    } else {
      toggle.classList.remove('toggle-switch--active');
      label.textContent = 'Chế độ: Thủ công';
      label.style.color = 'var(--accent-red)';
      desc.textContent = 'Bạn điều khiển đèn trực tiếp';
    }
  });

  return wrapper;
}
