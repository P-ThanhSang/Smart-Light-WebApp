// Smart Light PWA — Device Info Component
import { subscribe } from '../services/state.js';

export function createDeviceInfo() {
  const card = document.createElement('div');
  card.className = 'device-info glass-card';
  card.id = 'device-info';

  card.innerHTML = `
    <div class="section-title">Thông tin thiết bị</div>
    <div class="info-row">
      <span class="info-row__label">Địa chỉ IP</span>
      <span class="info-row__value" id="info-ip">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">Thời gian hoạt động</span>
      <span class="info-row__value" id="info-uptime">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">Firmware</span>
      <span class="info-row__value" id="info-firmware">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">Bộ nhớ trống</span>
      <span class="info-row__value" id="info-memory">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">WiFi Signal</span>
      <span class="info-row__value" id="info-wifi" style="display: flex; align-items: center; gap: 8px;">
        <span id="info-wifi-text">--</span>
        <span class="wifi-signal" id="info-wifi-bars">
          <span class="wifi-signal__bar"></span>
          <span class="wifi-signal__bar"></span>
          <span class="wifi-signal__bar"></span>
          <span class="wifi-signal__bar"></span>
        </span>
      </span>
    </div>
  `;

  const ipEl = card.querySelector('#info-ip');
  const uptimeEl = card.querySelector('#info-uptime');
  const firmwareEl = card.querySelector('#info-firmware');
  const memoryEl = card.querySelector('#info-memory');
  const wifiTextEl = card.querySelector('#info-wifi-text');
  const wifiBars = card.querySelectorAll('.wifi-signal__bar');

  subscribe((state) => {
    if (ipEl) ipEl.textContent = state.ip_address;
    if (firmwareEl) firmwareEl.textContent = `v${state.firmware}`;

    // Format uptime
    if (uptimeEl) {
      const hours = Math.floor(state.uptime / 3600);
      const mins = Math.floor((state.uptime % 3600) / 60);
      const secs = state.uptime % 60;
      if (hours > 0) {
        uptimeEl.textContent = `${hours}h ${mins}m ${secs}s`;
      } else if (mins > 0) {
        uptimeEl.textContent = `${mins}m ${secs}s`;
      } else {
        uptimeEl.textContent = `${secs}s`;
      }
    }

    // Format memory
    if (memoryEl) {
      const kb = Math.round(state.free_memory / 1024);
      memoryEl.textContent = `${kb} KB`;
    }

    // WiFi signal
    if (wifiTextEl) {
      wifiTextEl.textContent = `${state.wifi_rssi} dBm`;
    }

    // WiFi bars
    const rssi = state.wifi_rssi;
    const activeBars = rssi > -50 ? 4 : rssi > -60 ? 3 : rssi > -70 ? 2 : 1;
    wifiBars.forEach((bar, i) => {
      bar.classList.toggle('wifi-signal__bar--active', i < activeBars);
    });
  });

  return card;
}
