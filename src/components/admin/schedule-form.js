// Smart Light PWA — Schedule Form Component
import { addScheduleToSupabase } from '../../services/supabase-service.js';
import { CONFIG } from '../../config.js';
import { createTimePicker } from './time-picker.js';

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/**
 * Create a schedule form modal
 * @param {Function} onDone - Called after form submission or cancel
 */
export function createScheduleForm(onDone) {
  const overlay = document.createElement('div');
  overlay.id = 'schedule-form-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(10,14,39,0.9);
    display: flex; align-items: center; justify-content: center;
    z-index: var(--z-modal); padding: var(--space-md);
  `;
  overlay.classList.add('anim-fade-in');

  const form = document.createElement('div');
  form.className = 'glass-card';
  form.style.cssText = 'width: 100%; max-width: 400px;';
  form.classList.add('anim-scale-pop');

  let selectedDays = [1, 2, 3, 4, 5]; // Default: Mon-Fri

  // --- Title ---
  const title = document.createElement('h3');
  title.style.cssText = `
    font-size: var(--font-size-md); font-weight: var(--font-weight-bold);
    color: var(--accent-cyan); margin-bottom: var(--space-lg); text-align: center;
  `;
  title.textContent = '⏰ Tạo lịch mới';
  form.appendChild(title);

  // --- Time Pickers Row ---
  const timeRow = document.createElement('div');
  timeRow.style.cssText = `
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
  `;

  const timeOnPicker = createTimePicker('Giờ BẬT', 18, 0);
  const timeOffPicker = createTimePicker('Giờ TẮT', 6, 0);

  // Arrow separator
  const arrow = document.createElement('div');
  arrow.style.cssText = `
    font-size: var(--font-size-xl);
    color: var(--accent-cyan);
    margin-top: 115px;
    font-weight: var(--font-weight-bold);
  `;
  arrow.textContent = '→';

  timeRow.appendChild(timeOnPicker.element);
  timeRow.appendChild(arrow);
  timeRow.appendChild(timeOffPicker.element);
  form.appendChild(timeRow);

  // --- Day Selection ---
  const daySection = document.createElement('div');
  daySection.style.cssText = 'margin-bottom: var(--space-lg);';

  const dayLabel = document.createElement('label');
  dayLabel.style.cssText = `
    font-size: var(--font-size-xs); color: var(--text-secondary);
    display: block; margin-bottom: var(--space-sm); text-align: center;
    text-transform: uppercase; letter-spacing: 0.5px;
  `;
  dayLabel.textContent = 'Ngày áp dụng';
  daySection.appendChild(dayLabel);

  const daysRow = document.createElement('div');
  daysRow.id = 'schedule-form-days';
  daysRow.style.cssText = `
    display: flex; justify-content: center; gap: 6px; flex-wrap: wrap;
  `;

  DAY_LABELS.forEach((day, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.day = i;
    btn.textContent = day;
    btn.style.cssText = `
      padding: 8px 14px;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      border-radius: var(--border-radius-full);
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: var(--font-family);
    `;

    if (selectedDays.includes(i)) {
      btn.style.background = 'var(--accent-cyan-dim)';
      btn.style.borderColor = 'var(--accent-cyan)';
      btn.style.color = 'var(--accent-cyan)';
    }

    btn.addEventListener('click', () => {
      if (selectedDays.includes(i)) {
        selectedDays = selectedDays.filter((d) => d !== i);
        btn.style.background = 'var(--bg-secondary)';
        btn.style.borderColor = 'var(--border-color)';
        btn.style.color = 'var(--text-secondary)';
      } else {
        selectedDays.push(i);
        btn.style.background = 'var(--accent-cyan-dim)';
        btn.style.borderColor = 'var(--accent-cyan)';
        btn.style.color = 'var(--accent-cyan)';
      }
    });

    daysRow.appendChild(btn);
  });

  daySection.appendChild(daysRow);
  form.appendChild(daySection);

  // --- Action Buttons ---
  const actions = document.createElement('div');
  actions.style.cssText = 'display: flex; gap: var(--space-md); justify-content: center;';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn';
  cancelBtn.textContent = 'Hủy';
  cancelBtn.style.cssText += 'flex: 1; max-width: 140px;';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn--primary';
  saveBtn.textContent = 'OK — Lưu lịch';
  saveBtn.style.cssText += 'flex: 1; max-width: 180px; font-weight: var(--font-weight-bold);';

  // Cancel
  cancelBtn.addEventListener('click', () => {
    overlay.remove();
    if (onDone) onDone();
  });

  // Save — via Supabase (or mock)
  saveBtn.addEventListener('click', async () => {
    const timeOn = timeOnPicker.getTime();
    const timeOff = timeOffPicker.getTime();

    if (selectedDays.length === 0) {
      daysRow.style.outline = '2px solid var(--accent-red)';
      daysRow.style.outlineOffset = '4px';
      daysRow.style.borderRadius = 'var(--border-radius-md)';
      setTimeout(() => { daysRow.style.outline = 'none'; }, 1500);
      return;
    }

    const success = await addScheduleToSupabase({
      timeOn,
      timeOff,
      days: [...selectedDays].sort(),
    });

    if (!success) {
      saveBtn.textContent = `Tối đa ${CONFIG.MAX_SCHEDULES} lịch!`;
      saveBtn.style.background = 'var(--accent-red)';
      setTimeout(() => {
        saveBtn.textContent = 'OK — Lưu lịch';
        saveBtn.style.background = '';
      }, 1500);
      return;
    }

    overlay.remove();
    if (onDone) onDone();
  });

  actions.appendChild(cancelBtn);
  actions.appendChild(saveBtn);
  form.appendChild(actions);

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      if (onDone) onDone();
    }
  });

  overlay.appendChild(form);
  return overlay;
}
