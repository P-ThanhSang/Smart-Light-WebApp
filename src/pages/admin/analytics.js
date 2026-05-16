// Smart Light PWA — Admin Analytics Page
import { subscribe, getState } from '../../services/state.js';
import { fetchSensorHistory } from '../../services/supabase-service.js';
import { CONFIG } from '../../config.js';
import { createLdrChart } from '../../components/admin/ldr-chart.js';
import { createLightUsageChart } from '../../components/admin/light-usage-chart.js';

export function createAnalyticsPage() {
  const page = document.createElement('div');
  page.className = 'page-content page-enter';
  page.id = 'page-analytics';

  // --- Header ---
  const header = document.createElement('div');
  header.className = 'mb-md';
  header.innerHTML = `
    <h2 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--text-primary);">
      📊 Analytics
    </h2>
    <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
      ${CONFIG.USE_MOCK ? 'Dữ liệu real-time (reset khi đóng trình duyệt)' : 'Dữ liệu từ Supabase Cloud'}
    </p>
  `;
  page.appendChild(header);

  // --- Charts ---
  const chartsContainer = document.createElement('div');
  chartsContainer.style.cssText = 'display: flex; flex-direction: column; gap: var(--space-md);';

  const ldrChart = createLdrChart();
  const lightUsageChart = createLightUsageChart();

  chartsContainer.appendChild(ldrChart);
  chartsContainer.appendChild(lightUsageChart);
  page.appendChild(chartsContainer);

  // --- Load data ---
  if (CONFIG.USE_MOCK) {
    // Mock mode: subscribe to local state for real-time updates
    subscribe((state) => {
      ldrChart.updateData(state.analytics.ldr_history);
      lightUsageChart.updateData(state.analytics.light_usage);
    });

    // Initial render
    const state = getState();
    ldrChart.updateData(state.analytics.ldr_history);
    lightUsageChart.updateData(state.analytics.light_usage);
  } else {
    // Supabase mode: fetch sensor history from cloud
    fetchSensorHistory(CONFIG.MAX_ANALYTICS_POINTS).then((analytics) => {
      ldrChart.updateData(analytics.ldr_history);
      lightUsageChart.updateData(analytics.light_usage);
    });

    // Also subscribe for any realtime sensor_readings inserts
    subscribe((state) => {
      if (state.analytics) {
        ldrChart.updateData(state.analytics.ldr_history);
        lightUsageChart.updateData(state.analytics.light_usage);
      }
    });
  }

  return page;
}
