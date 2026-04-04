// Smart Light PWA — Admin Schedule Page
import { subscribe, getState } from '../../services/state.js';
import { CONFIG } from '../../config.js';
import { createScheduleCard } from '../../components/admin/schedule-card.js';
import { createScheduleForm } from '../../components/admin/schedule-form.js';

export function createSchedulePage() {
  const page = document.createElement('div');
  page.className = 'page-content page-enter';
  page.id = 'page-schedule';

  // --- Header ---
  const header = document.createElement('div');
  header.className = 'flex-between mb-md';
  header.innerHTML = `
    <div>
      <h2 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--text-primary);">
        ⏰ Schedule
      </h2>
      <p id="schedule-count" style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 2px;">
        0 / ${CONFIG.MAX_SCHEDULES} lịch
      </p>
    </div>
  `;
  page.appendChild(header);

  // --- Schedule List ---
  const listContainer = document.createElement('div');
  listContainer.id = 'schedule-list';
  listContainer.style.cssText = 'display: flex; flex-direction: column; gap: var(--space-md);';
  page.appendChild(listContainer);

  // --- Floating Add Button ---
  const fab = document.createElement('button');
  fab.className = 'fab';
  fab.id = 'add-schedule-btn';
  fab.innerHTML = '+';
  fab.addEventListener('click', () => {
    const state = getState();
    if (state.schedules.length >= CONFIG.MAX_SCHEDULES) {
      fab.classList.add('anim-shake');
      setTimeout(() => fab.classList.remove('anim-shake'), 500);
      return;
    }
    const formOverlay = createScheduleForm();
    document.body.appendChild(formOverlay);
  });
  page.appendChild(fab);

  // --- Subscribe to state (only re-render when schedules change) ---
  let lastSchedulesJSON = '';

  function renderSchedules(schedules) {
    listContainer.innerHTML = '';

    if (schedules.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📅</div>
          <div class="empty-state__text">Chưa có lịch hẹn giờ nào</div>
          <div class="empty-state__text" style="font-size: var(--font-size-xs);">Nhấn nút + để tạo mới</div>
        </div>
      `;
      return;
    }

    schedules.forEach((schedule) => {
      listContainer.appendChild(createScheduleCard(schedule));
    });
  }

  subscribe((state) => {
    // Only re-render schedule list when schedules actually change
    const currentJSON = JSON.stringify(state.schedules);
    if (currentJSON !== lastSchedulesJSON) {
      lastSchedulesJSON = currentJSON;
      renderSchedules(state.schedules);
    }

    // Counter is cheap to update
    const countEl = page.querySelector('#schedule-count');
    if (countEl) countEl.textContent = `${state.schedules.length} / ${CONFIG.MAX_SCHEDULES} lịch`;
  });

  return page;
}

