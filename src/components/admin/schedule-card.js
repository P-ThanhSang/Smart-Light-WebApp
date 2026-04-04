// Smart Light PWA — Schedule Card Component
import { toggleScheduleInSupabase, removeScheduleFromSupabase } from '../../services/supabase-service.js';

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/**
 * Create a schedule rule card
 */
export function createScheduleCard(schedule) {
  const card = document.createElement('div');
  card.className = 'glass-card schedule-card anim-scale-pop';
  card.id = `schedule-${schedule.id}`;
  card.style.opacity = schedule.enabled ? '1' : '0.5';

  card.innerHTML = `
    <div class="schedule-card__header">
      <div>
        <span class="schedule-card__time">${schedule.timeOn}</span>
        <span style="color: var(--text-muted); margin: 0 6px;">→</span>
        <span class="schedule-card__time">${schedule.timeOff}</span>
      </div>
      <div style="display: flex; align-items: center; gap: var(--space-sm);">
        <div class="toggle-switch ${schedule.enabled ? 'toggle-switch--active' : ''}" id="schedule-toggle-${schedule.id}" style="width: 44px; height: 22px;">
          <div class="toggle-switch__knob" style="width: 16px; height: 16px; top: 2px; left: 2px; ${schedule.enabled ? 'transform: translateX(22px);' : ''}"></div>
        </div>
        <button class="btn btn--danger btn--small" id="schedule-delete-${schedule.id}" style="padding: 4px 8px; font-size: 0.7rem;">✕</button>
      </div>
    </div>
    <div class="schedule-card__days">
      ${DAY_LABELS.map((day, i) => `
        <span class="schedule-card__day ${schedule.days.includes(i) ? 'schedule-card__day--active' : ''}">${day}</span>
      `).join('')}
    </div>
  `;

  // Toggle enable/disable — via Supabase (or mock)
  const toggleEl = card.querySelector(`#schedule-toggle-${schedule.id}`);
  toggleEl.addEventListener('click', () => {
    toggleScheduleInSupabase(schedule.id);
  });

  // Delete — via Supabase (or mock)
  const deleteBtn = card.querySelector(`#schedule-delete-${schedule.id}`);
  deleteBtn.addEventListener('click', () => {
    card.style.transform = 'scale(0.9)';
    card.style.opacity = '0';
    setTimeout(() => removeScheduleFromSupabase(schedule.id), 200);
  });

  return card;
}
