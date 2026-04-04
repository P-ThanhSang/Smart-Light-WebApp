// Smart Light PWA — Supabase Service (thay thế connection.js)
// Handles: Realtime subscriptions, Commands, CRUD for schedules/logs/analytics
import { supabase } from './supabase.js';
import { CONFIG } from '../config.js';
import { setState, getState, addLog as localAddLog } from './state.js';

let realtimeChannel = null;

// ============================================================
// 1. REALTIME — Subscribe to device_state changes
// ============================================================

/**
 * Start Supabase Realtime service
 * Subscribe to device_state table changes → update local state
 */
export async function startSupabaseService() {
  console.log('☁️ Supabase Service starting...');

  // Fetch initial device state
  await fetchDeviceState();

  // Fetch initial schedules
  await fetchSchedules();

  // Subscribe to realtime changes on device_state
  realtimeChannel = supabase
    .channel('device-state-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'device_state',
        filter: `device_id=eq.${CONFIG.DEVICE_ID}`,
      },
      (payload) => {
        console.log('[Supabase] device_state changed:', payload);
        if (payload.new) {
          // Map Supabase row → local state
          const row = payload.new;
          setState({
            mode: row.mode,
            light: row.light,
            ldr: row.ldr,
            ldr_percent: row.ldr_percent,
            radar: row.radar,
            hour: row.hour,
            minute: row.minute,
            time_period: row.time_period,
            ldr_threshold: row.ldr_threshold,
            radar_timeout: row.radar_timeout,
            uptime: row.uptime,
            free_memory: row.free_memory,
            firmware: row.firmware,
            wifi_rssi: row.wifi_rssi,
            ip_address: row.ip_address,
            mac_address: row.mac_address,
            chip_model: row.chip_model,
            flash_size: row.flash_size,
            sdk_version: row.sdk_version,
            ssid: row.ssid,
            gateway: row.gateway,
            connected: row.connected,
          });
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'logs',
        filter: `device_id=eq.${CONFIG.DEVICE_ID}`,
      },
      (payload) => {
        // New log from ESP32 → add to local state
        if (payload.new) {
          const row = payload.new;
          const state = getState();
          const newLog = {
            id: row.id,
            type: row.type,
            message: row.message,
            timestamp: new Date(row.created_at).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            date: new Date(row.created_at),
          };
          const logs = [newLog, ...state.logs].slice(0, CONFIG.MAX_LOG_ENTRIES);
          setState({ logs });
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'schedules',
        filter: `device_id=eq.${CONFIG.DEVICE_ID}`,
      },
      (payload) => {
        // Schedule changed → re-fetch all schedules
        fetchSchedules();
      }
    )
    .subscribe((status) => {
      console.log(`[Supabase] Realtime status: ${status}`);
      if (status === 'SUBSCRIBED') {
        setState({ connected: true });
        localAddLog('system', 'Kết nối Supabase Realtime thành công');
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setState({ connected: false });
        localAddLog('system', 'Mất kết nối Supabase Realtime');
      }
    });
}

/**
 * Stop Supabase Realtime service
 */
export function stopSupabaseService() {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  setState({ connected: false });
  console.log('☁️ Supabase Service stopped');
}

// ============================================================
// 2. FETCH — Read data from Supabase
// ============================================================

/**
 * Fetch current device state from Supabase
 */
async function fetchDeviceState() {
  try {
    const { data, error } = await supabase
      .from('device_state')
      .select('*')
      .eq('device_id', CONFIG.DEVICE_ID)
      .single();

    if (error) {
      console.error('[Supabase] Fetch device_state error:', error);
      return;
    }

    if (data) {
      setState({
        mode: data.mode,
        light: data.light,
        ldr: data.ldr,
        ldr_percent: data.ldr_percent,
        radar: data.radar,
        hour: data.hour,
        minute: data.minute,
        time_period: data.time_period,
        ldr_threshold: data.ldr_threshold,
        radar_timeout: data.radar_timeout,
        uptime: data.uptime,
        free_memory: data.free_memory,
        firmware: data.firmware,
        wifi_rssi: data.wifi_rssi,
        ip_address: data.ip_address,
        mac_address: data.mac_address,
        chip_model: data.chip_model,
        flash_size: data.flash_size,
        sdk_version: data.sdk_version,
        ssid: data.ssid,
        gateway: data.gateway,
        connected: data.connected,
      });
      console.log('[Supabase] Device state loaded');
    }
  } catch (err) {
    console.error('[Supabase] Fetch device_state failed:', err);
  }
}

/**
 * Fetch schedules from Supabase
 */
async function fetchSchedules() {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('device_id', CONFIG.DEVICE_ID)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Supabase] Fetch schedules error:', error);
      return;
    }

    if (data) {
      const schedules = data.map((row) => ({
        id: row.id,
        timeOn: row.time_on,
        timeOff: row.time_off,
        days: row.days,
        enabled: row.enabled,
      }));
      setState({ schedules });
    }
  } catch (err) {
    console.error('[Supabase] Fetch schedules failed:', err);
  }
}

// ============================================================
// 3. COMMANDS — Send actions to ESP32 via Supabase
// ============================================================

/**
 * Send a command to ESP32 by inserting into commands table
 * ESP32 polls this table and executes pending commands
 *
 * @param {string} action - 'toggle_light', 'set_mode', 'set_ldr_threshold', 'set_radar_timeout'
 * @param {object} value - { mode: 'manual' } or { value: 1500 }
 */
export async function sendCommand(action, value = {}) {
  const state = getState();

  // In mock mode, execute locally
  if (CONFIG.USE_MOCK) {
    const { mockAction } = await import('./mock-service.js');
    // Extract simple value for mock compatibility
    const simpleValue = value.mode || value.value || value;
    mockAction(action, simpleValue);
    return;
  }

  try {
    const { error } = await supabase.from('commands').insert({
      device_id: CONFIG.DEVICE_ID,
      action,
      value,
      executed: false,
    });

    if (error) {
      console.error('[Supabase] Send command error:', error);
      return;
    }

    console.log(`[Supabase] Command sent: ${action}`, value);
  } catch (err) {
    console.error('[Supabase] Send command failed:', err);
  }
}

// ============================================================
// 4. LOGS — CRUD
// ============================================================

/**
 * Add a log entry to Supabase
 */
export async function addLogToSupabase(type, message) {
  if (CONFIG.USE_MOCK) {
    // In mock mode, just add locally
    localAddLog(type, message);
    return;
  }

  try {
    await supabase.from('logs').insert({
      device_id: CONFIG.DEVICE_ID,
      type,
      message,
    });
  } catch (err) {
    console.error('[Supabase] Add log error:', err);
  }
}

/**
 * Fetch logs from Supabase
 */
export async function fetchLogs(limit = 100) {
  try {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('device_id', CONFIG.DEVICE_ID)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Supabase] Fetch logs error:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      message: row.message,
      timestamp: new Date(row.created_at).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      date: new Date(row.created_at),
    }));
  } catch (err) {
    console.error('[Supabase] Fetch logs failed:', err);
    return [];
  }
}

/**
 * Clear all logs from Supabase
 */
export async function clearLogs() {
  if (CONFIG.USE_MOCK) {
    setState({ logs: [] });
    return;
  }

  try {
    await supabase
      .from('logs')
      .delete()
      .eq('device_id', CONFIG.DEVICE_ID);

    setState({ logs: [] });
  } catch (err) {
    console.error('[Supabase] Clear logs error:', err);
  }
}

// ============================================================
// 5. SCHEDULES — CRUD
// ============================================================

/**
 * Add a schedule to Supabase
 */
export async function addScheduleToSupabase(schedule) {
  if (CONFIG.USE_MOCK) {
    const { addSchedule } = await import('./state.js');
    return addSchedule(schedule);
  }

  const state = getState();
  if (state.schedules.length >= CONFIG.MAX_SCHEDULES) return false;

  try {
    const { error } = await supabase.from('schedules').insert({
      device_id: CONFIG.DEVICE_ID,
      time_on: schedule.timeOn,
      time_off: schedule.timeOff,
      days: schedule.days,
      enabled: true,
    });

    if (error) {
      console.error('[Supabase] Add schedule error:', error);
      return false;
    }

    await addLogToSupabase('system', `Đã tạo lịch mới: ${schedule.timeOn} → ${schedule.timeOff}`);
    return true;
  } catch (err) {
    console.error('[Supabase] Add schedule failed:', err);
    return false;
  }
}

/**
 * Remove a schedule from Supabase
 */
export async function removeScheduleFromSupabase(id) {
  if (CONFIG.USE_MOCK) {
    const { removeSchedule } = await import('./state.js');
    removeSchedule(id);
    return;
  }

  try {
    await supabase.from('schedules').delete().eq('id', id);
    await addLogToSupabase('system', 'Đã xóa một lịch hẹn giờ');
  } catch (err) {
    console.error('[Supabase] Remove schedule error:', err);
  }
}

/**
 * Toggle a schedule's enabled status
 */
export async function toggleScheduleInSupabase(id) {
  if (CONFIG.USE_MOCK) {
    const { toggleSchedule } = await import('./state.js');
    toggleSchedule(id);
    return;
  }

  const state = getState();
  const schedule = state.schedules.find((s) => s.id === id);
  if (!schedule) return;

  try {
    await supabase
      .from('schedules')
      .update({ enabled: !schedule.enabled })
      .eq('id', id);
  } catch (err) {
    console.error('[Supabase] Toggle schedule error:', err);
  }
}

// ============================================================
// 6. ANALYTICS — Fetch sensor history
// ============================================================

/**
 * Fetch sensor reading history for analytics charts
 */
export async function fetchSensorHistory(limit = 200) {
  if (CONFIG.USE_MOCK) {
    // In mock mode, analytics data comes from local state
    const state = getState();
    return state.analytics;
  }

  try {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('device_id', CONFIG.DEVICE_ID)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Supabase] Fetch sensor history error:', error);
      return { ldr_history: [], light_usage: [], radar_events: [] };
    }

    // Reverse to chronological order
    const readings = (data || []).reverse();

    // Transform to analytics format
    const ldr_history = readings.map((r) => ({
      time: new Date(r.created_at).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      value: r.ldr,
      timestamp: new Date(r.created_at).getTime(),
    }));

    const radar_events = readings.map((r) => ({
      time: new Date(r.created_at).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      detected: r.radar,
      timestamp: new Date(r.created_at).getTime(),
    }));

    // Aggregate light usage per hour
    const hourMap = {};
    readings.forEach((r) => {
      const hour = new Date(r.created_at).getHours();
      if (!hourMap[hour]) hourMap[hour] = { hour, duration: 0 };
      if (r.light) hourMap[hour].duration += CONFIG.SENSOR_POLL_INTERVAL / 1000;
    });
    const light_usage = Object.values(hourMap);

    return { ldr_history, light_usage, radar_events };
  } catch (err) {
    console.error('[Supabase] Fetch sensor history failed:', err);
    return { ldr_history: [], light_usage: [], radar_events: [] };
  }
}
