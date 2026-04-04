// Smart Light PWA — Mock Data Service
import { CONFIG } from '../config.js';
import { getState, setState, addLog, addAnalyticsPoint } from './state.js';

let mockInterval = null;
let ldrDirection = 1;
let radarTimer = null;
let uptimeCounter = 0;

/**
 * Start mock data simulation
 */
export function startMockService() {
  console.log('🧪 Mock Service started');

  // Initialize mock connection
  setState({
    connected: true,
    firmware: CONFIG.APP_VERSION,
    free_memory: 245760,
    wifi_rssi: -42,
    ip_address: '192.168.1.50',
    ssid: 'SmartHome_WiFi',
    gateway: '192.168.1.1',
    mac_address: 'A0:B7:65:4C:3D:2E',
    chip_model: 'ESP32-S3',
    flash_size: '4MB',
    sdk_version: 'IDF 5.1.2',
  });
  addLog('system', 'Kết nối Mock Service thành công');

  // Set initial time from system clock
  updateTime();

  // Main update loop
  mockInterval = setInterval(() => {
    updateLDR();
    updateTime();
    updateUptime();
    updateMemory();
    updateWiFi();
    autoModeLogic();

    // Record analytics
    const state = getState();
    addAnalyticsPoint(state.ldr, state.light, state.radar);
  }, CONFIG.MOCK_UPDATE_INTERVAL);

  // Radar toggle (random interval 5-15s)
  scheduleRadarToggle();
}

/**
 * Stop mock data simulation
 */
export function stopMockService() {
  if (mockInterval) clearInterval(mockInterval);
  if (radarTimer) clearTimeout(radarTimer);
  mockInterval = null;
  radarTimer = null;
  console.log('🧪 Mock Service stopped');
}

/**
 * Handle user actions in mock mode
 */
export function mockAction(action, value) {
  const state = getState();

  switch (action) {
    case 'toggle_light':
      if (state.mode === 'manual') {
        setState({ light: !state.light });
        addLog('light', state.light ? 'Đèn đã TẮT (thủ công)' : 'Đèn đã BẬT (thủ công)');
      }
      break;

    case 'set_mode':
      setState({ mode: value });
      addLog('mode', `Chế độ: ${value === 'auto' ? 'Tự động' : 'Thủ công'}`);
      break;

    case 'set_ldr_threshold':
      setState({ ldr_threshold: value });
      break;

    case 'set_radar_timeout':
      setState({ radar_timeout: value });
      break;
  }
}

// --- Internal update functions ---

function updateLDR() {
  const state = getState();
  let ldr = state.ldr;

  // Oscillate LDR between 200-3800
  ldr += ldrDirection * (Math.random() * 80 + 20);

  if (ldr >= 3800) {
    ldr = 3800;
    ldrDirection = -1;
  } else if (ldr <= 200) {
    ldr = 200;
    ldrDirection = 1;
  }

  // Occasionally add noise / spike
  if (Math.random() < 0.05) {
    ldr += (Math.random() - 0.5) * 300;
    ldr = Math.max(100, Math.min(4000, ldr));
  }

  const ldr_percent = Math.round((ldr / 4095) * 100);
  setState({ ldr: Math.round(ldr), ldr_percent });
}

function updateTime() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  let time_period;
  if (hour >= 6 && hour < 18) {
    time_period = 'day';
  } else if (hour >= 18 && hour < 22) {
    time_period = 'evening';
  } else {
    time_period = 'night';
  }

  setState({ hour, minute, time_period });
}

function updateUptime() {
  uptimeCounter += CONFIG.MOCK_UPDATE_INTERVAL / 1000;
  setState({ uptime: Math.floor(uptimeCounter) });
}

function updateMemory() {
  // Simulate slight memory fluctuation
  const base = 245760;
  const fluctuation = Math.random() * 4096 - 2048;
  setState({ free_memory: Math.round(base + fluctuation) });
}

function updateWiFi() {
  // Simulate WiFi signal fluctuation
  const base = -42;
  const fluctuation = Math.random() * 10 - 5;
  setState({ wifi_rssi: Math.round(base + fluctuation) });
}

function scheduleRadarToggle() {
  const delay = (Math.random() * 10 + 5) * 1000; // 5-15 seconds
  radarTimer = setTimeout(() => {
    const state = getState();
    const newRadar = !state.radar;
    setState({ radar: newRadar });

    if (newRadar) {
      addLog('radar', 'Phát hiện chuyển động!');
    }

    scheduleRadarToggle();
  }, delay);
}

function autoModeLogic() {
  const state = getState();
  if (state.mode !== 'auto') return;

  let shouldLightOn = false;

  switch (state.time_period) {
    case 'day':
      // Day: light off (bright enough)
      shouldLightOn = false;
      break;
    case 'evening':
      // Evening: light on if LDR < threshold
      shouldLightOn = state.ldr < state.ldr_threshold;
      break;
    case 'night':
      // Night: light on only when radar detects motion AND LDR < threshold
      shouldLightOn = state.radar && state.ldr < state.ldr_threshold;
      break;
  }

  if (state.light !== shouldLightOn) {
    setState({ light: shouldLightOn });
    addLog('light', shouldLightOn ? 'Đèn BẬT (tự động)' : 'Đèn TẮT (tự động)');
  }
}
