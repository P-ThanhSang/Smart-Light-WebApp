// Smart Light PWA — PIN Gate Component
import { CONFIG } from '../config.js';

/**
 * Create PIN Gate screen
 * @param {Function} onSuccess - called when correct PIN entered
 */
export function createPinGate(onSuccess) {
  // Check if already authenticated in this session
  if (sessionStorage.getItem('smart_light_admin_auth') === 'true') {
    onSuccess();
    return null;
  }

  const overlay = document.createElement('div');
  overlay.className = 'pin-gate anim-fade-in';
  overlay.id = 'pin-gate';

  let pin = '';
  const PIN_LENGTH = 4;

  function render() {
    overlay.innerHTML = `
      <div class="pin-gate__title">🔐 Admin Access</div>
      <div class="pin-gate__subtitle">Nhập mã PIN để truy cập</div>
      <div class="pin-gate__dots" id="pin-dots">
        ${Array.from({ length: PIN_LENGTH }, (_, i) => `
          <div class="pin-gate__dot ${i < pin.length ? 'pin-gate__dot--filled' : ''}"></div>
        `).join('')}
      </div>
      <div class="pin-gate__keypad" id="pin-keypad">
        ${[1,2,3,4,5,6,7,8,9,'','0','⌫'].map((key) => {
          if (key === '') return '<button class="pin-gate__key pin-gate__key--empty"></button>';
          if (key === '⌫') return `<button class="pin-gate__key pin-gate__key--action" data-key="backspace">⌫</button>`;
          return `<button class="pin-gate__key" data-key="${key}">${key}</button>`;
        }).join('')}
      </div>
      <button class="btn btn--small" style="margin-top: 8px;" id="pin-back-btn">← Quay lại User</button>
    `;

    // Event delegation for keypad
    const keypad = overlay.querySelector('#pin-keypad');
    keypad.addEventListener('click', (e) => {
      const key = e.target.closest('[data-key]');
      if (!key) return;

      const value = key.dataset.key;

      if (value === 'backspace') {
        pin = pin.slice(0, -1);
        render();
        return;
      }

      if (pin.length >= PIN_LENGTH) return;

      pin += value;
      render();

      // Check PIN when complete
      if (pin.length === PIN_LENGTH) {
        setTimeout(() => {
          if (pin === CONFIG.ADMIN_PIN) {
            // Success
            sessionStorage.setItem('smart_light_admin_auth', 'true');
            overlay.remove();
            onSuccess();
          } else {
            // Error — shake and reset
            const dotsEl = overlay.querySelector('#pin-dots');
            if (dotsEl) {
              // Show error dots
              dotsEl.querySelectorAll('.pin-gate__dot').forEach((dot) => {
                dot.classList.remove('pin-gate__dot--filled');
                dot.classList.add('pin-gate__dot--error');
              });
              dotsEl.classList.add('anim-shake');
            }
            setTimeout(() => {
              pin = '';
              render();
            }, 600);
          }
        }, 200);
      }
    });

    // Back button
    const backBtn = overlay.querySelector('#pin-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.hash = '';
        window.location.pathname = '/';
        overlay.remove();
      });
    }
  }

  render();
  return overlay;
}
