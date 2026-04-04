// Smart Light PWA — Network Card Component
import { subscribe } from '../../services/state.js';

export function createNetworkCard() {
  const card = document.createElement('div');
  card.className = 'glass-card';
  card.id = 'network-card';

  card.innerHTML = `
    <div class="section-title">📡 Network Diagnostics</div>
    <div class="info-row">
      <span class="info-row__label">SSID</span>
      <span class="info-row__value" id="net-ssid">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">IP Address</span>
      <span class="info-row__value" id="net-ip">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">Gateway</span>
      <span class="info-row__value" id="net-gateway">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">MAC Address</span>
      <span class="info-row__value" id="net-mac" style="font-size: var(--font-size-xs);">--</span>
    </div>
    <div class="info-row">
      <span class="info-row__label">WiFi Signal</span>
      <span class="info-row__value" id="net-rssi" style="display: flex; align-items: center; gap: 8px;">
        <span id="net-rssi-text">--</span>
        <div class="wifi-signal" id="net-wifi-bars">
          <span class="wifi-signal__bar"></span>
          <span class="wifi-signal__bar"></span>
          <span class="wifi-signal__bar"></span>
          <span class="wifi-signal__bar"></span>
        </div>
      </span>
    </div>
    <div class="info-row">
      <span class="info-row__label">Trạng thái</span>
      <span class="info-row__value" id="net-status" style="display: flex; align-items: center; gap: 6px;">
        <span class="connection-dot" id="net-dot" style="width: 8px; height: 8px;"></span>
        <span id="net-status-text">--</span>
      </span>
    </div>
  `;

  subscribe((state) => {
    card.querySelector('#net-ssid').textContent = state.ssid;
    card.querySelector('#net-ip').textContent = state.ip_address;
    card.querySelector('#net-gateway').textContent = state.gateway;
    card.querySelector('#net-mac').textContent = state.mac_address;
    card.querySelector('#net-rssi-text').textContent = `${state.wifi_rssi} dBm`;

    // WiFi bars
    const rssi = state.wifi_rssi;
    const activeBars = rssi > -50 ? 4 : rssi > -60 ? 3 : rssi > -70 ? 2 : 1;
    const bars = card.querySelectorAll('.wifi-signal__bar');
    bars.forEach((bar, i) => {
      bar.classList.toggle('wifi-signal__bar--active', i < activeBars);
    });

    // Connection status
    const dot = card.querySelector('#net-dot');
    const statusText = card.querySelector('#net-status-text');
    if (state.connected) {
      dot.classList.remove('connection-dot--disconnected');
      statusText.textContent = 'Đã kết nối';
      statusText.style.color = 'var(--accent-green)';
    } else {
      dot.classList.add('connection-dot--disconnected');
      statusText.textContent = 'Mất kết nối';
      statusText.style.color = 'var(--accent-red)';
    }
  });

  return card;
}
