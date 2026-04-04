// Smart Light PWA — System Info Component
import { subscribe } from '../../services/state.js';

export function createSystemInfo() {
  const card = document.createElement('div');
  card.className = 'glass-card';
  card.id = 'system-info';

  card.innerHTML = `
    <div class="section-title">📱 Thông tin phần cứng</div>
    <div class="info-row">
      <span class="info-row__label">Chip Model</span>
      <span class="info-row__value" id="sys-chip">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">Flash Size</span>
      <span class="info-row__value" id="sys-flash">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">SDK Version</span>
      <span class="info-row__value" id="sys-sdk">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">Firmware</span>
      <span class="info-row__value" id="sys-firmware">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">Uptime</span>
      <span class="info-row__value" id="sys-uptime" style="font-variant-numeric: tabular-nums;">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">Free Memory</span>
      <span class="info-row__value" id="sys-memory">--</span>
    </div>
  `;

  subscribe((state) => {
    card.querySelector('#sys-chip').textContent = state.chip_model;
    card.querySelector('#sys-flash').textContent = state.flash_size;
    card.querySelector('#sys-sdk').textContent = state.sdk_version;
    card.querySelector('#sys-firmware').textContent = `v${state.firmware}`;

    const hours = Math.floor(state.uptime / 3600);
    const mins = Math.floor((state.uptime % 3600) / 60);
    const secs = state.uptime % 60;
    card.querySelector('#sys-uptime').textContent = `${hours}h ${mins}m ${secs}s`;

    const kb = Math.round(state.free_memory / 1024);
    card.querySelector('#sys-memory').textContent = `${kb} KB`;
  });

  return card;
}
