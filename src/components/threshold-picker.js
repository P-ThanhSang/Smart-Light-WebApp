// Smart Light PWA — Threshold Picker Component
// Preset chips + slider + custom keypad overlay
import { subscribe, getState, setState } from '../services/state.js';
import { sendCommand } from '../services/supabase-service.js';

const PRESETS = [500, 1000, 1500, 2000, 2500, 3000, 3500];
const MIN_VAL = 100;
const MAX_VAL = 4000;

export function createThresholdPicker() {
  const wrapper = document.createElement('div');
  wrapper.className = 'threshold-picker';
  wrapper.id = 'threshold-picker';

  // --- Header ---
  const header = document.createElement('div');
  header.className = 'threshold-picker__header';
  header.innerHTML = `
    <span class="threshold-picker__label">Ngưỡng ánh sáng (LDR)</span>
    <span class="threshold-picker__value" id="threshold-current">--</span>
  `;
  wrapper.appendChild(header);

  // --- Chips grid ---
  const grid = document.createElement('div');
  grid.className = 'threshold-picker__grid';

  PRESETS.forEach((val) => {
    const chip = document.createElement('button');
    chip.className = 'threshold-chip';
    chip.dataset.value = val;
    chip.textContent = val.toLocaleString();
    chip.addEventListener('click', () => selectValue(val));
    grid.appendChild(chip);
  });

  // Custom "..." button — always shows "···"
  const customChip = document.createElement('button');
  customChip.className = 'threshold-chip threshold-chip--custom';
  customChip.id = 'threshold-custom-btn';
  customChip.textContent = '···';
  customChip.addEventListener('click', () => openKeypad());
  grid.appendChild(customChip);

  wrapper.appendChild(grid);

  // --- Slider (below chips) ---
  const sliderWrap = document.createElement('div');
  sliderWrap.className = 'threshold-picker__slider';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'slider-control__input';
  slider.id = 'threshold-slider';
  slider.min = MIN_VAL;
  slider.max = MAX_VAL;
  slider.step = 10;
  slider.value = MIN_VAL;

  sliderWrap.appendChild(slider);
  wrapper.appendChild(sliderWrap);

  function updateSliderTrack() {
    const pct = ((slider.value - MIN_VAL) / (MAX_VAL - MIN_VAL)) * 100;
    slider.style.background = `linear-gradient(to right, var(--accent-cyan) 0%, var(--accent-cyan) ${pct}%, var(--bg-secondary) ${pct}%, var(--bg-secondary) 100%)`;
  }

  slider.addEventListener('input', () => {
    const val = Number(slider.value);
    selectValue(val);
  });

  // --- Numeric Keypad Overlay ---
  // Append to document.body to escape any stacking-context created by
  // backdrop-filter on ancestor .glass-card elements.
  const overlay = document.createElement('div');
  overlay.className = 'threshold-keypad-overlay';
  overlay.id = 'threshold-keypad-overlay';
  overlay.innerHTML = `
    <div class="threshold-keypad-modal">
      <div class="threshold-keypad__header">
        <span class="threshold-keypad__title">Nhập ngưỡng tùy chỉnh</span>
        <span class="threshold-keypad__range">${MIN_VAL} – ${MAX_VAL}</span>
      </div>
      <div class="threshold-keypad__display" id="keypad-display">
        <span class="threshold-keypad__input-text" id="keypad-input-text"></span>
        <span class="threshold-keypad__cursor"></span>
      </div>
      <div class="threshold-keypad__keys">
        <button class="threshold-keypad__key" data-key="1">1</button>
        <button class="threshold-keypad__key" data-key="2">2</button>
        <button class="threshold-keypad__key" data-key="3">3</button>
        <button class="threshold-keypad__key" data-key="4">4</button>
        <button class="threshold-keypad__key" data-key="5">5</button>
        <button class="threshold-keypad__key" data-key="6">6</button>
        <button class="threshold-keypad__key" data-key="7">7</button>
        <button class="threshold-keypad__key" data-key="8">8</button>
        <button class="threshold-keypad__key" data-key="9">9</button>
        <button class="threshold-keypad__key threshold-keypad__key--action" data-key="clear">C</button>
        <button class="threshold-keypad__key" data-key="0">0</button>
        <button class="threshold-keypad__key threshold-keypad__key--action" data-key="back">⌫</button>
      </div>
      <div class="threshold-keypad__actions">
        <button class="btn btn--small" id="keypad-cancel">Hủy</button>
        <button class="btn btn--primary btn--small" id="keypad-confirm">Xác nhận</button>
      </div>
      <div class="threshold-keypad__error" id="keypad-error"></div>
    </div>
  `;

  // --- Keypad Logic ---
  let keypadBuffer = '';

  function openKeypad() {
    // Append to body each time to guarantee it's at the top of the DOM
    if (!overlay.parentNode) {
      document.body.appendChild(overlay);
    }
    keypadBuffer = '';
    updateKeypadDisplay();
    clearKeypadError();
    // Force reflow then show
    void overlay.offsetWidth;
    overlay.classList.add('threshold-keypad-overlay--visible');
  }

  function closeKeypad() {
    overlay.classList.remove('threshold-keypad-overlay--visible');
  }

  function updateKeypadDisplay() {
    const textEl = overlay.querySelector('#keypad-input-text');
    textEl.textContent = keypadBuffer || '';
  }

  function clearKeypadError() {
    overlay.querySelector('#keypad-error').textContent = '';
  }

  // Key presses
  overlay.querySelectorAll('.threshold-keypad__key').forEach((key) => {
    key.addEventListener('click', () => {
      const k = key.dataset.key;
      clearKeypadError();

      if (k === 'clear') {
        keypadBuffer = '';
      } else if (k === 'back') {
        keypadBuffer = keypadBuffer.slice(0, -1);
      } else {
        if (keypadBuffer.length < 4) {
          keypadBuffer += k;
        }
      }
      updateKeypadDisplay();
    });
  });

  // Cancel
  overlay.querySelector('#keypad-cancel').addEventListener('click', closeKeypad);

  // Confirm
  overlay.querySelector('#keypad-confirm').addEventListener('click', () => {
    const val = parseInt(keypadBuffer, 10);
    if (isNaN(val) || val < MIN_VAL || val > MAX_VAL) {
      overlay.querySelector('#keypad-error').textContent =
        `Giá trị phải từ ${MIN_VAL} đến ${MAX_VAL}`;
      return;
    }
    selectValue(val);
    closeKeypad();
  });

  // Close on overlay background click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeKeypad();
  });

  // --- Select & Send Value ---
  function selectValue(val) {
    setState({ ldr_threshold: val });
    sendCommand('set_ldr_threshold', { value: val });
  }

  function updateUI(activeVal) {
    // Update chips highlight
    grid.querySelectorAll('.threshold-chip:not(.threshold-chip--custom)').forEach((chip) => {
      chip.classList.toggle('threshold-chip--active', Number(chip.dataset.value) === activeVal);
    });

    // Highlight "..." chip only when the value is not one of the presets
    customChip.classList.toggle('threshold-chip--active', !PRESETS.includes(activeVal));
    // Always keep "···" text
    customChip.textContent = '···';

    // Update header value
    wrapper.querySelector('#threshold-current').textContent = activeVal;

    // Sync slider position
    slider.value = Math.max(MIN_VAL, Math.min(MAX_VAL, activeVal));
    updateSliderTrack();
  }

  // --- Subscribe to state ---
  subscribe((state) => {
    updateUI(state.ldr_threshold);
  });

  return wrapper;
}
