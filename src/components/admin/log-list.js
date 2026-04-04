// Smart Light PWA — Admin Log List Component
import { createLogEntry } from './log-entry.js';

/**
 * Create a scrollable log list
 */
export function createLogList() {
  const wrapper = document.createElement('div');
  wrapper.className = 'log-list';
  wrapper.id = 'log-list';
  wrapper.style.cssText = `
    max-height: calc(100vh - 280px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  `;

  let currentFilter = 'all';
  let allLogs = [];

  /**
   * Update the log list with new logs
   */
  wrapper.updateLogs = function (logs) {
    allLogs = logs;
    render();
  };

  /**
   * Set filter type
   */
  wrapper.setFilter = function (filter) {
    currentFilter = filter;
    render();
  };

  function render() {
    const filtered = currentFilter === 'all'
      ? allLogs
      : allLogs.filter((log) => log.type === currentFilter);

    wrapper.innerHTML = '';

    if (filtered.length === 0) {
      wrapper.innerHTML = `
        <div class="empty-state" style="padding: var(--space-xl) 0;">
          <div class="empty-state__icon">📭</div>
          <div class="empty-state__text">Chưa có log nào${currentFilter !== 'all' ? ` loại "${currentFilter}"` : ''}</div>
        </div>
      `;
      return;
    }

    filtered.forEach((log) => {
      wrapper.appendChild(createLogEntry(log));
    });
  }

  return wrapper;
}
