// Smart Light PWA — Header Component
import { subscribe, getState } from '../services/state.js';

export function createHeader(isAdmin = false) {
  const header = document.createElement('header');
  header.className = 'app-header';
  header.id = 'app-header';

  header.innerHTML = `
    <div class="app-header__title">
      <span>${isAdmin ? '🛡️' : '💡'}</span>
      <span>${isAdmin ? 'Admin Panel' : 'Smart Light'}</span>
    </div>
    <div class="app-header__right">
      <span class="app-header__time" id="header-time">--:--</span>
      <div class="connection-dot anim-dot-blink" id="connection-dot"></div>
    </div>
  `;

  // Subscribe to state updates
  subscribe((state) => {
    const timeEl = header.querySelector('#header-time');
    const dotEl = header.querySelector('#connection-dot');

    if (timeEl) {
      const h = String(state.hour).padStart(2, '0');
      const m = String(state.minute).padStart(2, '0');
      timeEl.textContent = `${h}:${m}`;
    }

    if (dotEl) {
      dotEl.classList.toggle('connection-dot--disconnected', !state.connected);
      dotEl.classList.toggle('anim-dot-blink', state.connected);
    }
  });

  return header;
}
