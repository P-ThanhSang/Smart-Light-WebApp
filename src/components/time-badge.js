// Smart Light PWA — Time Badge Component
import { subscribe } from '../services/state.js';

const PERIOD_CONFIG = {
  day: {
    label: 'Ban ngày ☀️',
    color: 'var(--accent-amber)',
    bg: 'var(--accent-amber-dim)',
  },
  evening: {
    label: 'Sinh hoạt tối 🌆',
    color: 'var(--accent-cyan)',
    bg: 'var(--accent-cyan-dim)',
  },
  night: {
    label: 'An ninh đêm 🌙',
    color: 'var(--accent-purple)',
    bg: 'var(--accent-purple-dim)',
  },
};

export function createTimeBadge() {
  const badge = document.createElement('div');
  badge.className = 'time-badge';
  badge.id = 'time-badge';
  badge.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    transition: all var(--transition-base);
    border: 1px solid transparent;
  `;

  function update(state) {
    const config = PERIOD_CONFIG[state.time_period] || PERIOD_CONFIG.day;
    badge.textContent = config.label;
    badge.style.color = config.color;
    badge.style.background = config.bg;
    badge.style.borderColor = config.color.replace(')', ', 0.2)').replace('var(', 'rgba(').replace('--accent-amber', '255, 184, 0').replace('--accent-cyan', '0, 245, 255').replace('--accent-purple', '168, 85, 247');
    // Simplified border approach
    badge.style.borderColor = 'rgba(255,255,255,0.1)';
  }

  subscribe(update);
  return badge;
}
