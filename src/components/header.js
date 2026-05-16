// Smart Light PWA — Header Component
import { subscribe } from '../services/state.js';

const WEEKDAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function createHeader(isAdmin = false) {
  const header = document.createElement('header');
  header.className = 'app-header';
  header.id = 'app-header';

  header.innerHTML = `
    <div class="app-header__row-top">
      <span class="app-header__date" id="header-date">--</span>
      <div class="app-header__right">
        <span class="app-header__time" id="header-time">--:--</span>
        <div class="connection-dot anim-dot-blink" id="connection-dot"></div>
      </div>
    </div>
    <div class="app-header__row-bottom">
      <span>${isAdmin ? '🛡️' : '💡'}</span>
      <span>${isAdmin ? 'Admin Panel' : 'Smart Light'}</span>
    </div>
  `;

  const timeEl = header.querySelector('#header-time');
  const dateEl = header.querySelector('#header-date');
  const dotEl = header.querySelector('#connection-dot');

  // --- Real-time clock from browser (always accurate) ---
  function tickClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${h}:${m}`;

    const weekday = WEEKDAYS_VI[now.getDay()];
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    dateEl.textContent = `${weekday}, ${day}/${month}/${year}`;
  }

  tickClock();
  setInterval(tickClock, 1000);

  // --- Connection dot from state ---
  subscribe((state) => {
    if (dotEl) {
      dotEl.classList.toggle('connection-dot--disconnected', !state.connected);
      dotEl.classList.toggle('anim-dot-blink', state.connected);
    }
  });

  return header;
}
