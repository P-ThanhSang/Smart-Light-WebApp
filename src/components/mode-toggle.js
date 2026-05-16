// Smart Light PWA — Mode Toggle Component
// Two side-by-side cards: AUTO | MANUAL
import { subscribe, getState, setState } from '../services/state.js';
import { sendCommand, lockField, addLogToSupabase } from '../services/supabase-service.js';

export function createModeToggle() {
  const wrapper = document.createElement('div');
  wrapper.className = 'mode-cards';
  wrapper.id = 'mode-toggle-wrapper';

  wrapper.innerHTML = `
    <button class="mode-card" id="mode-auto" data-mode="auto">
      <span class="mode-card__icon">🤖</span>
      <span class="mode-card__title">AUTO</span>
      <span class="mode-card__desc">Tự động</span>
    </button>
    <button class="mode-card" id="mode-manual" data-mode="manual">
      <span class="mode-card__icon">🖐️</span>
      <span class="mode-card__title">MANUAL</span>
      <span class="mode-card__desc">Thủ công</span>
    </button>
  `;

  const autoCard = wrapper.querySelector('#mode-auto');
  const manualCard = wrapper.querySelector('#mode-manual');

  function setMode(newMode) {
    lockField('mode', newMode);
    setState({ mode: newMode });
    sendCommand('set_mode', { mode: newMode });
    addLogToSupabase('mode', `Chế độ: ${newMode === 'auto' ? 'Tự động' : 'Thủ công'}`);
  }

  autoCard.addEventListener('click', () => setMode('auto'));
  manualCard.addEventListener('click', () => setMode('manual'));

  // Subscribe to state
  subscribe((state) => {
    const isAuto = state.mode === 'auto';
    autoCard.classList.toggle('mode-card--active', isAuto);
    manualCard.classList.toggle('mode-card--active', !isAuto);
  });

  return wrapper;
}
