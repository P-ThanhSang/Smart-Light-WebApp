// Smart Light PWA — Settings Page
import { subscribe, getState } from '../services/state.js';
import { startSupabaseService, stopSupabaseService } from '../services/supabase-service.js';
import { startMockService, stopMockService } from '../services/mock-service.js';
import { CONFIG } from '../config.js';
import { createThresholdPicker } from '../components/threshold-picker.js';
import { createDeviceInfo } from '../components/device-info.js';

export function createSettingsPage() {
  const page = document.createElement('div');
  page.className = 'page-content page-enter';
  page.id = 'page-settings';

  // --- Section: Thresholds ---
  const thresholdSection = document.createElement('div');
  thresholdSection.className = 'glass-card';
  thresholdSection.style.cssText = 'margin-bottom: var(--space-md);';

  const thresholdTitle = document.createElement('div');
  thresholdTitle.className = 'section-title';
  thresholdTitle.textContent = 'Cấu hình cảm biến';
  thresholdSection.appendChild(thresholdTitle);

  // LDR Threshold Picker
  thresholdSection.appendChild(createThresholdPicker());



  page.appendChild(thresholdSection);

  // --- Section: Connection ---
  const connSection = document.createElement('div');
  connSection.className = 'glass-card';
  connSection.style.cssText = 'margin-bottom: var(--space-md); display: flex; align-items: center; justify-content: space-between;';

  connSection.innerHTML = `
    <div style="display: flex; align-items: center; gap: var(--space-md);">
      <div class="connection-dot" id="settings-conn-dot" style="width: 10px; height: 10px;"></div>
      <div>
        <div id="settings-conn-status" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Đã kết nối</div>
        <div id="settings-conn-mode" style="font-size: var(--font-size-xs); color: var(--text-muted);">
          ${CONFIG.USE_MOCK ? 'Mock Mode' : 'Supabase Cloud'}
        </div>
      </div>
    </div>
    <button class="btn btn--primary btn--small" id="settings-reconnect-btn">
      Kết nối lại
    </button>
  `;

  const connDot = connSection.querySelector('#settings-conn-dot');
  const connStatus = connSection.querySelector('#settings-conn-status');

  subscribe((state) => {
    if (state.connected) {
      connDot.classList.remove('connection-dot--disconnected');
      connStatus.textContent = 'Đã kết nối';
      connStatus.style.color = 'var(--accent-green)';
    } else {
      connDot.classList.add('connection-dot--disconnected');
      connStatus.textContent = 'Mất kết nối';
      connStatus.style.color = 'var(--accent-red)';
    }
  });

  // Reconnect button
  const reconnectBtn = connSection.querySelector('#settings-reconnect-btn');
  reconnectBtn.addEventListener('click', () => {
    reconnectBtn.textContent = 'Đang kết nối...';
    reconnectBtn.disabled = true;

    if (CONFIG.USE_MOCK) {
      stopMockService();
      setTimeout(() => {
        startMockService();
        reconnectBtn.textContent = 'Kết nối lại';
        reconnectBtn.disabled = false;
      }, 1000);
    } else {
      stopSupabaseService();
      setTimeout(() => {
        startSupabaseService();
        reconnectBtn.textContent = 'Kết nối lại';
        reconnectBtn.disabled = false;
      }, 1500);
    }
  });

  page.appendChild(connSection);

  // --- Section: Device Info ---
  page.appendChild(createDeviceInfo());

  // --- Admin Link ---
  const adminLink = document.createElement('a');
  adminLink.href = '/admin';
  adminLink.className = 'glass-card';
  adminLink.id = 'admin-link';
  adminLink.style.cssText = `
    display: flex; align-items: center; justify-content: space-between;
    margin-top: var(--space-md); text-decoration: none; color: var(--text-primary);
    cursor: pointer;
  `;
  adminLink.innerHTML = `
    <div style="display: flex; align-items: center; gap: var(--space-md);">
      <span style="font-size: 1.3rem;">🛡️</span>
      <div>
        <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Admin Panel</div>
        <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Quản lý nâng cao</div>
      </div>
    </div>
    <span style="color: var(--text-muted); font-size: var(--font-size-lg);">→</span>
  `;
  page.appendChild(adminLink);

  return page;
}
