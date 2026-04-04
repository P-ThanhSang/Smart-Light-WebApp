// Smart Light PWA — Slider Control Component
import { getState } from '../services/state.js';
import { sendCommand } from '../services/supabase-service.js';

/**
 * Create a styled slider control
 * @param {Object} options - { id, label, min, max, step, unit, action, stateKey }
 */
export function createSliderControl(options) {
  const { id, label, min, max, step, unit, action, stateKey } = options;

  const wrapper = document.createElement('div');
  wrapper.className = 'slider-control';
  wrapper.id = `slider-${id}`;

  wrapper.innerHTML = `
    <div class="slider-control__header">
      <span class="slider-control__label">${label}</span>
      <span class="slider-control__value" id="slider-value-${id}">--${unit}</span>
    </div>
    <input type="range" class="slider-control__input" id="slider-input-${id}"
      min="${min}" max="${max}" step="${step}" value="${min}" />
  `;

  const input = wrapper.querySelector(`#slider-input-${id}`);
  const valueDisplay = wrapper.querySelector(`#slider-value-${id}`);

  // Set initial value from state
  const state = getState();
  if (state[stateKey] !== undefined) {
    input.value = state[stateKey];
    valueDisplay.textContent = `${state[stateKey]}${unit}`;
  }

  // Update gradient fill
  function updateTrackFill() {
    const percent = ((input.value - min) / (max - min)) * 100;
    input.style.background = `linear-gradient(to right, var(--accent-cyan) 0%, var(--accent-cyan) ${percent}%, var(--bg-secondary) ${percent}%, var(--bg-secondary) 100%)`;
  }

  updateTrackFill();

  // On change — send command via Supabase (or mock)
  input.addEventListener('input', () => {
    const value = Number(input.value);
    valueDisplay.textContent = `${value}${unit}`;
    updateTrackFill();
    sendCommand(action, { value });
  });

  return wrapper;
}
