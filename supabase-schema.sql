-- ============================================================
-- Smart Light — Supabase Database Schema
-- Chạy script này trong Supabase SQL Editor
-- ============================================================

-- 1. DEVICE STATE (1 row duy nhất cho mỗi thiết bị)
-- ESP32 cập nhật bảng này mỗi 2 giây
CREATE TABLE IF NOT EXISTS device_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL DEFAULT 'esp32_main',
  
  -- Trạng thái điều khiển
  mode TEXT DEFAULT 'auto' CHECK (mode IN ('auto', 'manual')),
  light BOOLEAN DEFAULT false,
  
  -- Cảm biến
  ldr INTEGER DEFAULT 2048,
  ldr_percent INTEGER DEFAULT 50,
  radar BOOLEAN DEFAULT false,
  
  -- Thời gian
  hour INTEGER DEFAULT 0,
  minute INTEGER DEFAULT 0,
  time_period TEXT DEFAULT 'day',
  
  -- Cấu hình
  ldr_threshold INTEGER DEFAULT 1000,
  radar_timeout INTEGER DEFAULT 10,
  
  -- Thông tin hệ thống
  uptime INTEGER DEFAULT 0,
  free_memory INTEGER DEFAULT 0,
  firmware TEXT DEFAULT '1.0.0',
  wifi_rssi INTEGER DEFAULT -50,
  ip_address TEXT DEFAULT '',
  mac_address TEXT DEFAULT '',
  chip_model TEXT DEFAULT 'ESP32-S3',
  flash_size TEXT DEFAULT '4MB',
  sdk_version TEXT DEFAULT '',
  ssid TEXT DEFAULT '',
  gateway TEXT DEFAULT '',
  connected BOOLEAN DEFAULT false,
  
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_device_state_timestamp
  BEFORE UPDATE ON device_state
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Insert default device row
INSERT INTO device_state (device_id) VALUES ('esp32_main')
ON CONFLICT (device_id) DO NOTHING;


-- 2. COMMANDS (Lệnh từ Web App → ESP32)
CREATE TABLE IF NOT EXISTS commands (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL DEFAULT 'esp32_main',
  action TEXT NOT NULL,           -- 'toggle_light', 'set_mode', 'set_ldr_threshold', ...
  value JSONB DEFAULT '{}',       -- { "mode": "manual" } hoặc { "value": 1500 }
  executed BOOLEAN DEFAULT false, -- ESP32 đánh dấu đã thực thi
  created_at TIMESTAMPTZ DEFAULT now()
);


-- 3. SENSOR READINGS (Lịch sử cảm biến — cho Analytics)
CREATE TABLE IF NOT EXISTS sensor_readings (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL DEFAULT 'esp32_main',
  ldr INTEGER,
  ldr_percent INTEGER,
  radar BOOLEAN,
  light BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_created_at 
  ON sensor_readings(created_at DESC);


-- 4. SCHEDULES (Lịch hẹn giờ)
CREATE TABLE IF NOT EXISTS schedules (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL DEFAULT 'esp32_main',
  time_on TEXT NOT NULL,          -- "18:30"
  time_off TEXT NOT NULL,         -- "06:00"
  days INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- 5. LOGS (Nhật ký hệ thống)
CREATE TABLE IF NOT EXISTS logs (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL DEFAULT 'esp32_main',
  type TEXT NOT NULL,             -- 'light', 'radar', 'mode', 'system'
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logs_created_at 
  ON logs(created_at DESC);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Cho phép tất cả với anon key (đơn giản cho đồ án)
-- Production: cần chặt hơn (dùng Auth + policies)
-- ============================================================

ALTER TABLE device_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Allow ALL operations for anon/authenticated users
CREATE POLICY "Allow all on device_state" ON device_state
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on commands" ON commands
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on sensor_readings" ON sensor_readings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on schedules" ON schedules
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on logs" ON logs
  FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- SUPABASE REALTIME
-- Bật Realtime cho các bảng cần theo dõi
-- ============================================================
-- Vào Supabase Dashboard → Database → Replication
-- Bật Realtime cho: device_state, logs, schedules
-- Hoặc chạy:

ALTER publication supabase_realtime ADD TABLE device_state;
ALTER publication supabase_realtime ADD TABLE logs;
ALTER publication supabase_realtime ADD TABLE schedules;
