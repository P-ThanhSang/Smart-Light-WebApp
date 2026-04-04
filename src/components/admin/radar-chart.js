// Smart Light PWA — Radar Events Chart (SVG dot timeline)

/**
 * Create a dot timeline chart for radar detection events
 */
export function createRadarChart() {
  const card = document.createElement('div');
  card.className = 'glass-card chart-container';
  card.id = 'radar-chart';

  card.innerHTML = `
    <div class="chart-container__title">📡 Sự kiện Radar</div>
    <div class="chart-container__canvas" id="radar-chart-canvas" style="position: relative;"></div>
    <div style="display: flex; gap: var(--space-md); font-size: var(--font-size-xs); color: var(--text-muted); margin-top: var(--space-sm);">
      <span style="display: flex; align-items: center; gap: 4px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent-amber); display: inline-block;"></span>
        Phát hiện
      </span>
      <span style="display: flex; align-items: center; gap: 4px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); display: inline-block;"></span>
        Không có
      </span>
      <span style="margin-left: auto;" id="radar-event-count">0 events</span>
    </div>
  `;

  const canvas = card.querySelector('#radar-chart-canvas');
  const countLabel = card.querySelector('#radar-event-count');

  card.updateData = function (radarEvents) {
    if (!radarEvents || radarEvents.length < 2) {
      canvas.innerHTML = `
        <div class="empty-state" style="height: 100%;">
          <div class="empty-state__text">Đang thu thập dữ liệu...</div>
        </div>
      `;
      return;
    }

    const width = canvas.clientWidth || 400;
    const height = 80;
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartW = width - padding.left - padding.right;

    const data = radarEvents.slice(-80);
    const detectedCount = data.filter((d) => d.detected).length;

    let dotsHtml = '';
    data.forEach((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = height / 2;
      const detected = d.detected;

      dotsHtml += `
        <circle cx="${x}" cy="${y}" r="${detected ? 4 : 2}"
          fill="${detected ? 'var(--accent-amber)' : 'var(--text-muted)'}"
          opacity="${detected ? 1 : 0.3}"
          ${detected ? 'style="filter: drop-shadow(0 0 3px var(--accent-amber));"' : ''}
        />
      `;
    });

    canvas.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display: block;">
        <!-- Center line -->
        <line x1="${padding.left}" y1="${height / 2}" x2="${width - padding.right}" y2="${height / 2}"
          stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        ${dotsHtml}
      </svg>
    `;

    countLabel.textContent = `${detectedCount} events`;
  };

  return card;
}
