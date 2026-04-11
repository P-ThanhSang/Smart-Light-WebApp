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

  // --- Empty state element ---
  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state';
  emptyState.style.display = 'none';
  emptyState.innerHTML = `
    <div class="empty-state__icon">📅</div>
    <div class="empty-state__text">Chưa có lịch hẹn giờ nào</div>
    <div class="empty-state__text" style="font-size: var(--font-size-xs);">Nhấn nút + để tạo mới</div>
  `;
  listContainer.appendChild(emptyState);

  // --- Track rendered cards by ID ---
  const renderedCards = new Map(); // schedule.id → DOM element

  /**
   * Smart update: only add/remove/update cards that changed.
   * Avoids full DOM rebuild which causes flicker.
   */
  function updateSchedules(schedules) {
    if (schedules.length === 0) {
      // Remove all cards
      renderedCards.forEach((el) => el.remove());
      renderedCards.clear();
      emptyState.style.display = '';
      return;
    }

    emptyState.style.display = 'none';

    const currentIds = new Set(schedules.map((s) => s.id));

    // Remove cards that no longer exist
    for (const [id, el] of renderedCards) {
      if (!currentIds.has(id)) {
        el.remove();
        renderedCards.delete(id);
      }
    }

    // Add new cards and update existing ones
    schedules.forEach((schedule) => {
      const existingCard = renderedCards.get(schedule.id);

      if (existingCard) {
        // Update in-place: only toggle state and opacity (no DOM rebuild)
        existingCard.style.opacity = schedule.enabled ? '1' : '0.5';

        const toggle = existingCard.querySelector(`#schedule-toggle-${schedule.id}`);
        if (toggle) {
          const knob = toggle.querySelector('.toggle-switch__knob');
          if (schedule.enabled) {
            toggle.classList.add('toggle-switch--active');
            if (knob) knob.style.transform = 'translateX(22px)';
          } else {
            toggle.classList.remove('toggle-switch--active');
            if (knob) knob.style.transform = '';
          }
        }
      } else {
        // New schedule — create card with animation
        const card = createScheduleCard(schedule);
        listContainer.insertBefore(card, emptyState);
        renderedCards.set(schedule.id, card);
      }
    });
  }

  // --- Subscribe to state (only re-render when schedules change) ---
  let lastSchedulesJSON = '';

  subscribe((state) => {
    const currentJSON = JSON.stringify(state.schedules);
    if (currentJSON !== lastSchedulesJSON) {
      lastSchedulesJSON = currentJSON;
      updateSchedules(state.schedules);
    }

    // Counter is cheap to update
    const countEl = page.querySelector('#schedule-count');
    if (countEl) countEl.textContent = `${state.schedules.length} / ${CONFIG.MAX_SCHEDULES} lịch`;
  });

  return page;
}

