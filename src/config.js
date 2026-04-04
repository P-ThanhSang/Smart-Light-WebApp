// Smart Light PWA — Configuration
export const CONFIG = {
  // --- Supabase (thay thế WebSocket trực tiếp) ---
  SUPABASE_URL: 'https://drwujsirtvmmemyydkza.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd3Vqc2lydHZtbWVteXlka3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMDk0NDgsImV4cCI6MjA5MDg4NTQ0OH0.UL_TD91Aici6Jm0wx6_bSuhzh_ehNvd6sOQSh8fIGdE',
  DEVICE_ID: 'esp32_main',                                // ID thiết bị

  // --- Chế độ phát triển ---
  // true  = dữ liệu giả (mock), không cần Supabase/ESP32
  // false = kết nối Supabase Realtime
  USE_MOCK: false,

  // --- App Settings ---
  SENSOR_POLL_INTERVAL: 2000,   // ESP32 gửi data mỗi 2s
  APP_NAME: 'Smart Light',
  APP_VERSION: '1.0.0',

  // Admin PIN (fixed)
  ADMIN_PIN: '1234',

  // Schedule limits
  MAX_SCHEDULES: 5,

  // Analytics
  MAX_ANALYTICS_POINTS: 200,

  // Logs
  MAX_LOG_ENTRIES: 100,

  // Mock data update interval (ms) — chỉ dùng khi USE_MOCK = true
  MOCK_UPDATE_INTERVAL: 500,
};
