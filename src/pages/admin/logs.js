// Smart Light PWA — Admin Logs Page
import { subscribe, getState, setState } from '../../services/state.js';
import { clearLogs, fetchLogs } from '../../services/supabase-service.js';
import { CONFIG } from '../../config.js';
import { createLogList } from '../../components/admin/log-list.js';

export function createLogsPage() {
  const page = document.createElement('div');
  page.className = 'page-content page-enter';
  page.id = 'page-logs';

  // --- Header ---
  const header = document.createElement('div');
  header.className = 'flex-between mb-md';
  header.innerHTML = `
    <h2 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--text-primary);">
      📋 Activity Logs
    </h2>
    <button class="btn btn--danger btn--small" id="clear-logs-btn">Xóa tất cả</button>
  `;
  page.appendChild(header);

  // --- Filter Bar ---
  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar mb-md';
  const filters = [
    { id: 'all', label: 'Tất cả' },
    { id: 'light', label: '💡 Đèn' },
    { id: 'radar', label: '📡 Radar' },
    { id: 'mode', label: '🔄 Chế độ' },
    { id: 'system', label: '⚙️ Hệ thống' },
  ];

  let activeFilter = 'all';

  filters.forEach((filter) => {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${filter.id === 'all' ? 'filter-btn--active' : ''}`;
    btn.textContent = filter.label;
    btn.dataset.filter = filter.id;
    btn.addEventListener('click', () => {
      activeFilter = filter.id;
      filterBar.querySelectorAll('.filter-btn').forEach((b) => {
        b.classList.toggle('filter-btn--active', b.dataset.filter === filter.id);
      });
      logList.setFilter(filter.id);
    });
    filterBar.appendChild(btn);
  });
  page.appendChild(filterBar);

  // --- Log Count ---
  const countEl = document.createElement('div');
  countEl.id = 'log-count';
  countEl.style.cssText = 'font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-sm);';
  page.appendChild(countEl);

  // --- Log List ---
  const logList = createLogList();
  page.appendChild(logList);

  // --- Clear button --- via Supabase (or mock)
  const clearBtn = page.querySelector('#clear-logs-btn');
  clearBtn.addEventListener('click', () => {
    clearLogs();
  });

  // --- Fetch logs from Supabase on page load (when not mock) ---
  if (!CONFIG.USE_MOCK) {
    fetchLogs(CONFIG.MAX_LOG_ENTRIES).then((logs) => {
      setState({ logs });
    });
  }

  // --- Subscribe to state (re-render when logs change) ---
  let lastLogs = null;

  subscribe((state) => {
    // Re-render if logs reference changed (any addition, removal, or replacement)
    if (state.logs !== lastLogs) {
      lastLogs = state.logs;
      logList.updateLogs(state.logs);
      countEl.textContent = `${state.logs.length} entries`;
    }
  });

  return page;
}
