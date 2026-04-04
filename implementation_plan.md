# Smart Light PWA — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Dark Futuristic PWA dashboard to monitor and control the Smart Light ESP32 system. Includes both a **User page** (basic controls) and an **Admin page** (advanced management).

**Architecture:** Vite + Vanilla JS + GSAP + CSS. User page (2 tabs) + Admin page (4 tabs, PIN protected). Mock data simulation with switch to real MQTT broker (điều khiển từ bất kỳ đâu qua internet).

**Tech Stack:** Vite 6, Vanilla JS (ES6+), GSAP 3, CSS Custom Properties, Google Fonts (Inter), Lucide Icons, Workbox, **mqtt.js** (MQTT over WebSocket cho browser)

**Project Location:** `D:\ESP32_Projects\Smart_Light_WebApp\`

**Route Structure:**
- `/` → Trang User (Dashboard + Settings)
- `/admin` → PIN Gate → Trang Admin (Logs + Analytics + Schedule + System)

---

# PHASE 1: Nền tảng chung

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `manifest.json`

- [x] **Step 1:** Create project directory and init Vite

```bash
cd D:\ESP32_Projects\Smart_Light_WebApp
npm create vite@latest ./ -- --template vanilla
```

- [x] **Step 2:** Install dependencies

```bash
npm install
npm install gsap
```

- [x] **Step 3:** Create `manifest.json` for PWA

```json
{
  "name": "Smart Light Dashboard",
  "short_name": "SmartLight",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e27",
  "theme_color": "#00f5ff",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [x] **Step 4:** Update `index.html` with PWA meta tags, Google Fonts, and app shell

- [x] **Step 5:** Verify — `npm run dev` opens without errors ✅

---

## Task 2: Design System (CSS)

**Files:**
- Create: `src/styles/index.css`, `src/styles/components.css`, `src/styles/animations.css`

- [x] **Step 1:** Create `index.css` with all CSS custom properties (color tokens, typography, spacing)

Color tokens: `--bg-primary: #0a0e27`, `--accent-cyan: #00f5ff`, `--accent-green: #00ff88`, `--accent-red: #ff4757`, `--accent-amber: #ffb800`, etc.

- [x] **Step 2:** Create global styles (reset, body, app container, glassmorphism card class)

- [x] **Step 3:** Create `animations.css` with CSS keyframes: `pulse-glow`, `radar-ripple`, `fade-in`, `slide-up`, `dot-blink`

- [x] **Step 4:** Create `components.css` with styles for nav-bar, toggle switch, slider, gauge, cards, PIN input, schedule cards, chart containers

- [x] **Step 5:** Verify — page shows dark background with correct fonts ✅

---

## Task 3: State Management + Config

**Files:**
- Create: `src/config.js`, `src/services/state.js`, `src/services/mock-service.js`

- [x] **Step 1:** Create `config.js`

```javascript
export const CONFIG = {
  USE_MOCK: true,

  // --- MQTT Broker (cloud-agnostic, cấu hình theo nhà cung cấp) ---
  MQTT_BROKER_URL: 'wss://broker.example.com:8884/mqtt',  // WebSocket URL
  MQTT_USERNAME: '',           // Broker username
  MQTT_PASSWORD: '',           // Broker password
  MQTT_CLIENT_ID: 'smartlight-web-' + Date.now(),

  // --- MQTT Topics ---
  MQTT_TOPIC_STATUS: 'smartlight/status',     // ESP32 → Web (trạng thái)
  MQTT_TOPIC_CMD: 'smartlight/cmd',           // Web → ESP32 (lệnh)
  MQTT_TOPIC_SETTINGS: 'smartlight/settings', // Đồng bộ cài đặt
  MQTT_TOPIC_SCHEDULE: 'smartlight/schedule', // Đồng bộ lịch hẹn
  MQTT_TOPIC_SYSTEM: 'smartlight/system',     // Thông tin hệ thống

  MOCK_UPDATE_INTERVAL: 500,
  ADMIN_PIN: '1234',
};
```

- [x] **Step 2:** Create `state.js` — simple pub/sub state manager

```javascript
// State shape: { mode, light, ldr, ldr_percent, radar, hour, minute,
//   time_period, ldr_threshold, radar_timeout, uptime, free_memory,
//   firmware, wifi_rssi, connected,
//   logs: [], analytics: { ldr_history: [], light_usage: [], radar_events: [] },
//   schedules: [] }
// Methods: getState(), setState(partial), subscribe(callback)
```

- [x] **Step 3:** Create `mock-service.js` — generates dynamic fake data

Mock behavior: LDR oscillates 200-3800 every 2s, radar toggles every 5-15s, time from system clock, responds to user actions (mode/light toggle). Also generates mock log entries and analytics data points.

- [x] **Step 4:** Verify — import mock service in main.js, log state changes to console ✅

---

## Task 4: App Shell (Header + NavBar + Router + Auth Gate)

**Files:**
- Create: `src/components/header.js`, `src/components/nav-bar.js`, `src/components/pin-gate.js`, `src/main.js`
- Create: `src/pages/dashboard.js`, `src/pages/settings.js`
- Create: `src/pages/admin/logs.js`, `src/pages/admin/analytics.js`, `src/pages/admin/schedule.js`, `src/pages/admin/system.js`

- [x] **Step 1:** Create `header.js` — renders app title, connection dot, RTC time. Shows different title for User vs Admin.

- [x] **Step 2:** Create `nav-bar.js` — bottom tab bar component, reusable for both User (Dashboard/Settings) and Admin (Logs/Analytics/Schedule/System) with active state highlight

- [x] **Step 3:** Create `pin-gate.js` — PIN input screen (4 digits), validates against `CONFIG.ADMIN_PIN`, shows error animation on wrong PIN, stores session auth in sessionStorage

- [x] **Step 4:** Create hash router in `main.js`:
  - `/` → User layout (header + nav-bar[2 tabs] + page content)
  - `/admin` → PIN Gate → Admin layout (header + nav-bar[4 tabs] + page content)
  - Hash routes: `#dashboard`, `#settings`, `#logs`, `#analytics`, `#schedule`, `#system`

- [x] **Step 5:** Create placeholder pages for all 6 pages (dashboard, settings, logs, analytics, schedule, system)

- [x] **Step 6:** Verify — User tabs switch correctly, `/admin` shows PIN gate, correct PIN enters Admin, Admin tabs switch correctly, header shows different title per section ✅

---

# PHASE 2: Trang User hoàn chỉnh

---

## Task 5: Dashboard — Light Button + Mode Toggle

**Files:**
- Create: `src/components/light-button.js`, `src/components/mode-toggle.js`, `src/components/time-badge.js`

- [ ] **Step 1:** Create `time-badge.js` — shows current time period (Ban ngày / Sinh hoạt tối / An ninh đêm) with colored badge

- [ ] **Step 2:** Create `light-button.js` — large circle button with lightbulb icon, GSAP glow animation on ON, disabled state in Auto mode

- [ ] **Step 3:** Create `mode-toggle.js` — toggle switch Auto↔Manual, green/red color change, dispatches action to state

- [ ] **Step 4:** Wire components into `dashboard.js`

- [ ] **Step 5:** Verify — toggle mode changes color, light button glows/dims, button disabled in Auto mode

---

## Task 6: Dashboard — LDR Gauge + Radar Indicator

**Files:**
- Create: `src/components/ldr-gauge.js`, `src/components/radar-indicator.js`

- [ ] **Step 1:** Create `ldr-gauge.js` — SVG circular gauge with arc, GSAP animates arc fill and center number on data change

- [ ] **Step 2:** Create `radar-indicator.js` — icon + status text + CSS ripple animation when motion detected

- [ ] **Step 3:** Wire into `dashboard.js`, subscribe to state updates

- [ ] **Step 4:** Verify — gauge animates smoothly, radar pulses when active, all mock data updates in real-time

---

## Task 7: Settings Page

**Files:**
- Create: `src/components/slider-control.js`, `src/components/device-info.js`
- Modify: `src/pages/settings.js`

- [ ] **Step 1:** Create `slider-control.js` — reusable styled slider with label + value display, dispatches action on change

- [ ] **Step 2:** Create `device-info.js` — glassmorphism card showing IP, uptime, firmware, memory, WiFi signal

- [ ] **Step 3:** Add connection status indicator + reconnect button to settings page

- [ ] **Step 4:** Compose all components in `settings.js`

- [ ] **Step 5:** Verify — sliders update values, device info displays correctly, reconnect button works

---

## Task 8: MQTT Connection Service

**Files:**
- Modify: `src/services/connection.js` (rewrite: WebSocket → MQTT)
- Modify: `src/main.js`, `src/config.js`
- Install: `mqtt` (mqtt.js library)

> **Giao tiếp qua MQTT broker trung gian**: Web App và ESP32 đều kết nối tới cùng 1 MQTT broker trên cloud. Cho phép điều khiển hệ thống từ **bất kỳ đâu** có internet (WiFi, 4G/5G).

**Kiến trúc:**
```
📱 Web App (bất kỳ đâu)          ☁️ MQTT Broker           🔧 ESP32 (ở nhà)
     │                          (Cloud)                      │
     │  MQTT over WebSocket   ┌──────────┐    MQTT/TCP       │
     └───────────────────────►│  Broker  │◄──────────────────┘
       PUB: smartlight/cmd    │          │  PUB: smartlight/status
       SUB: smartlight/status └──────────┘  SUB: smartlight/cmd
```

**MQTT Topics:**
```
smartlight/
├── status     ← ESP32 publish: {mode, light, ldr, radar, hour, minute, ...}
├── cmd        ← Web publish:   {action: "toggle_light"} hoặc {action: "set_mode", value: "auto"}
├── settings   ← Đồng bộ:      {ldr_threshold, radar_timeout}
├── schedule   ← Đồng bộ:      [{id, timeOn, timeOff, days, enabled}]
└── system     ← ESP32 publish: {uptime, free_memory, wifi_rssi, firmware, ...}
```

- [ ] **Step 1:** Install mqtt.js library

```bash
npm install mqtt
```

- [ ] **Step 2:** Rewrite `connection.js` — MQTT client manager

```javascript
import mqtt from 'mqtt';
import { CONFIG } from '../config.js';
import { setState, addLog } from './state.js';

let client = null;

export function connect() {
  client = mqtt.connect(CONFIG.MQTT_BROKER_URL, {
    username: CONFIG.MQTT_USERNAME,
    password: CONFIG.MQTT_PASSWORD,
    clientId: CONFIG.MQTT_CLIENT_ID,
    reconnectPeriod: 3000,    // Auto-reconnect mỗi 3s
    connectTimeout: 10000,
  });

  client.on('connect', () => {
    setState({ connected: true });
    addLog('system', 'Kết nối MQTT broker thành công');
    // Subscribe các topic
    client.subscribe(CONFIG.MQTT_TOPIC_STATUS);
    client.subscribe(CONFIG.MQTT_TOPIC_SYSTEM);
    client.subscribe(CONFIG.MQTT_TOPIC_SETTINGS);
    client.subscribe(CONFIG.MQTT_TOPIC_SCHEDULE);
  });

  client.on('message', (topic, payload) => {
    const data = JSON.parse(payload.toString());
    if (topic === CONFIG.MQTT_TOPIC_STATUS) setState(data);
    if (topic === CONFIG.MQTT_TOPIC_SYSTEM) setState(data);
    // ... handle other topics
  });

  client.on('offline', () => setState({ connected: false }));
  client.on('error', (err) => console.error('[MQTT] Error:', err));
}

export function sendCommand(action) {
  if (client?.connected) {
    client.publish(CONFIG.MQTT_TOPIC_CMD, JSON.stringify(action));
  }
}

export function disconnect() {
  client?.end();
  setState({ connected: false });
}
```

- [ ] **Step 3:** Update `config.js` — thêm MQTT broker settings (URL, username, password, topics). Giữ cloud-agnostic, user sẽ điền thông tin broker riêng.

- [ ] **Step 4:** Update `main.js` — if `CONFIG.USE_MOCK` → start mock service, else → `connect()` tới MQTT broker

- [ ] **Step 5:** Update tất cả component dùng `mockAction()` → chuyển sang dùng `sendCommand()` khi `USE_MOCK: false`

- [ ] **Step 6:** Verify mock mode — toàn bộ tính năng hoạt động bình thường với mock data

- [ ] **Step 7:** Verify MQTT mode — toggle `USE_MOCK: false`, app cố kết nối MQTT broker (expected fail nếu chưa có broker, nhưng không crash app)

---

# PHASE 3: Trang Admin

---

## Task 9: Admin — Logs Tab

**Files:**
- Create: `src/components/admin/log-entry.js`, `src/components/admin/log-list.js`
- Modify: `src/pages/admin/logs.js`

- [ ] **Step 1:** Create `log-entry.js` — single log item component with icon, timestamp, description, color-coded by type (light=cyan, radar=amber, mode=green, system=red)

- [ ] **Step 2:** Create `log-list.js` — scrollable list container, auto-scrolls to newest entry, supports filtering by type

- [ ] **Step 3:** Add log recording to state manager — every state change creates a log entry with timestamp

- [ ] **Step 4:** Compose in `logs.js` — filter buttons (All/Light/Radar/Mode) + log list + clear button

- [ ] **Step 5:** Verify — logs appear in real-time as mock data changes, filters work, clear button resets list

---

## Task 10: Admin — Analytics Tab

**Files:**
- Create: `src/components/admin/ldr-chart.js`, `src/components/admin/light-usage-chart.js`, `src/components/admin/radar-chart.js`
- Modify: `src/pages/admin/analytics.js`

- [ ] **Step 1:** Create `ldr-chart.js` — SVG/Canvas line chart showing LDR values over time (in-memory, accumulates while app is open). X-axis = time, Y-axis = LDR value (0-4095). Auto-scrolling window.

- [ ] **Step 2:** Create `light-usage-chart.js` — simple bar chart showing light ON duration per hour (current session). Color bars by on-time percentage.

- [ ] **Step 3:** Create `radar-chart.js` — horizontal bar chart or dot timeline showing radar detection events per hour.

- [ ] **Step 4:** Compose in `analytics.js` — 3 charts stacked vertically in glassmorphism cards, with session duration info

- [ ] **Step 5:** Verify — charts update in real-time, data accumulates over session, smooth animations

> **Note:** Charts are pure SVG/Canvas — no external chart library to keep bundle small for ESP32. Data is in-memory only (resets when browser closes).

---

## Task 11: Admin — Schedule Tab

**Files:**
- Create: `src/components/admin/schedule-card.js`, `src/components/admin/schedule-form.js`
- Modify: `src/pages/admin/schedule.js`

- [ ] **Step 1:** Create `schedule-card.js` — displays one schedule rule: time range (ON→OFF), active days (Mon-Sun chips), enabled/disabled toggle, delete button

- [ ] **Step 2:** Create `schedule-form.js` — modal/inline form to create/edit a rule:
  - Time picker: giờ BẬT + giờ TẮT
  - Day selector: checkboxes Mon-Sun (chips style)
  - Save/Cancel buttons

- [ ] **Step 3:** Add schedule state management — array of rules in state, add/edit/delete/toggle operations

- [ ] **Step 4:** Compose in `schedule.js` — list of schedule cards + floating "Add Rule" button + empty state message

- [ ] **Step 5:** Verify — can create rules, toggle enable/disable, delete rules, days display correctly. Max 5 rules (ESP32 memory constraint).

> **Note:** In mock mode, schedules are stored in-memory. When connected to ESP32, schedules will be sent via WebSocket and stored in ESP32 NVS.

---

## Task 12: Admin — System Tab

**Files:**
- Create: `src/components/admin/system-info.js`, `src/components/admin/network-card.js`
- Modify: `src/pages/admin/system.js`

- [ ] **Step 1:** Create `system-info.js` — extended device info card: firmware version, chip model, flash size, SDK version, compile date. OTA status indicator (placeholder for future).

- [ ] **Step 2:** Create `network-card.js` — WiFi diagnostics: SSID, IP, Gateway, RSSI signal strength bar (animated), connection uptime, MAC address

- [ ] **Step 3:** Add Backup/Restore section:
  - Export button → downloads current config as JSON file
  - Import button → file input to upload JSON config
  - Preview changes before applying

- [ ] **Step 4:** Add About section — app version, project info, link back to User page

- [ ] **Step 5:** Compose all sections in `system.js` as glassmorphism cards

- [ ] **Step 6:** Verify — all info displays correctly, backup downloads valid JSON, restore previews and applies config

---

# Verification Plan

## Automated
```bash
npm run build    # Production build succeeds
npm run preview  # Preview production build
```

## Manual — Phase 1
- [ ] App shell loads without errors
- [ ] Router switches between User and Admin correctly
- [ ] PIN gate blocks unauthorized access to Admin
- [ ] Correct PIN grants access, stored in sessionStorage
- [ ] Dark futuristic theme renders correctly
- [ ] Fonts (Inter) load properly

## Manual — Phase 2 (User Page)
- [ ] Dashboard: tất cả component hiển thị đúng, animation mượt
- [ ] Settings: slider hoạt động, device info hiển thị
- [ ] Tab switching: chuyển tab mượt mà
- [ ] Mock data: dữ liệu tự thay đổi real-time
- [ ] Responsive: hiển thị tốt trên mobile (Chrome DevTools)
- [ ] PWA: có thể "Add to Home Screen" (Lighthouse audit)
- [ ] Mock/Real switch: đổi config không crash app

## Manual — Phase 3 (Admin Page)
- [ ] Logs: entries xuất hiện real-time, filter hoạt động, clear button reset
- [ ] Analytics: 3 biểu đồ update real-time, dữ liệu tích lũy khi app mở
- [ ] Schedule: tạo/sửa/xóa rule, toggle enable/disable, max 5 rules
- [ ] System: device info đúng, backup download JSON, restore preview + apply
- [ ] Navigation: chuyển giữa User↔Admin mượt mà
- [ ] PIN protection: reload trang admin vẫn yêu cầu PIN (sessionStorage)

---

# Design Decisions Log

| # | Quyết định | Lựa chọn | Ngày |
|---|-----------|----------|------|
| 1 | Kiến trúc trang | 2 trang: User (`/`) + Admin (`/admin`) | 2026-04-04 |
| 2 | Truy cập Admin | Cùng 1 app, route `/admin` với PIN protection | 2026-04-04 |
| 3 | Chiến lược phát triển | Hybrid 3 Phase (Foundation → User → Admin) | 2026-04-04 |
| 4 | Admin layout | Tab navigation giống trang User (bottom tab bar) | 2026-04-04 |
| 5 | Admin tabs | 4 tabs: Logs, Analytics, Schedule, System | 2026-04-04 |
| 6 | Bảo mật Admin | PIN cố định trong `config.js` (`1234`) | 2026-04-04 |
| 7 | Schedule | Nhiều rule + chọn ngày trong tuần (T2-CN) | 2026-04-04 |
| 8 | Analytics data | Real-time in-memory, reset khi đóng browser | 2026-04-04 |
| 9 | Giao tiếp ESP32 ↔ Web | **MQTT qua cloud broker** (thay WebSocket trực tiếp) — cho phép điều khiển từ bất kỳ đâu có internet | 2026-04-04 |
| 10 | MQTT Broker | Cloud-agnostic (user tự chọn: HiveMQ, Mosquitto, EMQX...) — config trong `config.js` | 2026-04-04 |
| 11 | MQTT Library (Web) | `mqtt.js` — MQTT over WebSocket, chạy trên browser, nhẹ (~40KB gzipped) | 2026-04-04 |
