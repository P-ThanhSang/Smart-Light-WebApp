// Smart Light PWA — Admin Log Entry Component

const TYPE_CONFIG = {
  light: { icon: '💡', bg: 'var(--accent-cyan-dim)', label: 'Đèn' },
  radar: { icon: '📡', bg: 'var(--accent-amber-dim)', label: 'Radar' },
  mode: { icon: '🔄', bg: 'var(--accent-green-dim)', label: 'Chế độ' },
  system: { icon: '⚙️', bg: 'var(--accent-red-dim)', label: 'Hệ thống' },
};

/**
 * Create a single log entry element
 */
export function createLogEntry(log) {
  const config = TYPE_CONFIG[log.type] || TYPE_CONFIG.system;

  const entry = document.createElement('div');
  entry.className = 'log-entry anim-slide-up';
  entry.dataset.type = log.type;

  entry.innerHTML = `
    <div class="log-entry__icon log-entry__icon--${log.type}" style="background: ${config.bg};">
      ${config.icon}
    </div>
    <div class="log-entry__content">
      <div class="log-entry__message">${log.message}</div>
      <div class="log-entry__time">${log.timestamp}</div>
    </div>
  `;

  return entry;
}
