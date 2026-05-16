// Smart Light PWA — State Manager (Pub/Sub)
import { CONFIG } from '../config.js';

const initialState = {
  // --- Device State ---
  mode: 'auto',           // 'auto' | 'manual'
  light: false,           // true = ON, false = OFF
  ldr: 2048,              // Raw LDR value (0-4095)
  ldr_percent: 50,        // LDR percentage (0-100)


  // --- Time ---
  hour: 0,
  minute: 0,
  time_period: 'day',     // 'day' | 'evening' | 'night'

  // --- Settings ---
  ldr_threshold: 1000,


  // --- Device Info ---
  uptime: 0,
  free_memory: 0,
  firmware: CONFIG.APP_VERSION,
  wifi_rssi: -50,
  ip_address: '192.168.1.50',
  mac_address: 'AA:BB:CC:DD:EE:FF',
  chip_model: 'ESP32-S3',
  flash_size: '4MB',
  sdk_version: 'IDF 5.1',
  ssid: 'SmartHome_WiFi',
  gateway: '192.168.1.1',

  // --- Connection ---
  connected: false,

  // --- Admin: Logs ---
  logs: [],

  // --- Admin: Analytics ---
  analytics: {
    ldr_history: [],       // { time, value }
    light_usage: [],       // { hour, duration }

  },

  // --- Admin: Schedules ---
  schedules: [],
  // Shape: { id, timeOn, timeOff, days: [0-6], enabled }
};

// Deep clone initial state
let state = JSON.parse(JSON.stringify(initialState));

// Subscribers
const subscribers = new Set();

/**
 * Get current state (returns a shallow copy)
 */
export function getState() {
  return { ...state };
}

/**
 * Update state partially and notify subscribers
 */
export function setState(partial) {
  const prevState = { ...state };
  state = { ...state, ...partial };
  subscribers.forEach((callback) => {
    try {
      callback(state, prevState);
    } catch (err) {
      console.error('[State] Subscriber error:', err);
    }
  });
}

/**
 * Subscribe to state changes.
 * Fires callback immediately with current state, then on every change.
 * @returns {Function} Unsubscribe function
 */
export function subscribe(callback) {
  subscribers.add(callback);
  // Fire immediately so component renders with current state
  try {
    callback(state, state);
  } catch (err) {
    console.error('[State] Subscriber init error:', err);
  }
  return () => subscribers.delete(callback);
}

/**
 * Add a log entry
 */
export function addLog(type, message) {
  const now = new Date();
  const log = {
    id: Date.now() + Math.random(),
    type,       // 'light' | 'mode' | 'system'
    message,
    timestamp: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: now,
  };

  const logs = [log, ...state.logs].slice(0, CONFIG.MAX_LOG_ENTRIES);
  setState({ logs });
}

/**
 * Add analytics data point
 */
export function addAnalyticsPoint(ldr, lightOn) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const hour = now.getHours();

  const analytics = { ...state.analytics };

  // LDR history
  analytics.ldr_history = [
    ...analytics.ldr_history,
    { time: timeStr, value: ldr, timestamp: Date.now() },
  ].slice(-CONFIG.MAX_ANALYTICS_POINTS);

  // Light usage per hour
  const existingHour = analytics.light_usage.find((h) => h.hour === hour);
  if (existingHour) {
    if (lightOn) existingHour.duration += CONFIG.MOCK_UPDATE_INTERVAL / 1000;
  } else {
    analytics.light_usage = [
      ...analytics.light_usage,
      { hour, duration: lightOn ? CONFIG.MOCK_UPDATE_INTERVAL / 1000 : 0 },
    ].slice(-24);
  }

  setState({ analytics });
}

/**
 * Schedule management
 */
export function addSchedule(schedule) {
  if (state.schedules.length >= CONFIG.MAX_SCHEDULES) return false;
  const newSchedule = {
    id: Date.now(),
    enabled: true,
    ...schedule,
  };
  setState({ schedules: [...state.schedules, newSchedule] });
  addLog('system', `Đã tạo lịch mới: ${schedule.timeOn} → ${schedule.timeOff}`);
  return true;
}

export function removeSchedule(id) {
  setState({ schedules: state.schedules.filter((s) => s.id !== id) });
  addLog('system', 'Đã xóa một lịch hẹn giờ');
}

export function toggleSchedule(id) {
  setState({
    schedules: state.schedules.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ),
  });
}

/**
 * Reset state
 */
export function resetState() {
  state = JSON.parse(JSON.stringify(initialState));
  subscribers.forEach((cb) => cb(state, initialState));
}
