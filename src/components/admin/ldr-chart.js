// Smart Light PWA — LDR Line Chart (SVG)

/**
 * Create an SVG line chart for LDR history
 */
export function createLdrChart() {
  const card = document.createElement('div');
  card.className = 'glass-card chart-container';
  card.id = 'ldr-chart';

  card.innerHTML = `
    <div class="chart-container__title">📈 Giá trị LDR theo thời gian</div>
    <div class="chart-container__canvas" id="ldr-chart-canvas" style="position: relative;"></div>
    <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); color: var(--text-muted); margin-top: var(--space-sm);">
      <span id="ldr-chart-start">--</span>
      <span id="ldr-chart-count">0 data points</span>
      <span id="ldr-chart-end">--</span>
    </div>
  `;

  const canvas = card.querySelector('#ldr-chart-canvas');
  const startLabel = card.querySelector('#ldr-chart-start');
  const endLabel = card.querySelector('#ldr-chart-end');
  const countLabel = card.querySelector('#ldr-chart-count');

  card.updateData = function (ldrHistory) {
    if (!ldrHistory || ldrHistory.length < 2) {
      canvas.innerHTML = `
        <div class="empty-state" style="height: 100%;">
          <div class="empty-state__text">Đang thu thập dữ liệu...</div>
        </div>
      `;
      return;
    }

    const width = canvas.clientWidth || 400;
    const height = 180;
    const padding = { top: 10, right: 10, bottom: 5, left: 10 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Get last 60 points
    const data = ldrHistory.slice(-60);
    const maxVal = 4095;
    const minVal = 0;

    // Build path
    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH;
      return { x, y };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    // Area fill path
    const areaD = pathD + ` L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

    // Threshold line
    const thresholdY = padding.top + chartH - (1000 / maxVal) * chartH;

    canvas.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display: block;">
        <defs>
          <linearGradient id="ldr-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent-cyan)" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="var(--accent-cyan)" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        <!-- Grid lines -->
        <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        <line x1="${padding.left}" y1="${padding.top + chartH / 2}" x2="${width - padding.right}" y2="${padding.top + chartH / 2}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        <!-- Threshold line -->
        <line x1="${padding.left}" y1="${thresholdY}" x2="${width - padding.right}" y2="${thresholdY}" stroke="var(--accent-red)" stroke-width="1" stroke-dasharray="4,4" opacity="0.5"/>
        <!-- Area fill -->
        <path d="${areaD}" fill="url(#ldr-gradient)" />
        <!-- Line -->
        <path d="${pathD}" fill="none" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 3px var(--accent-cyan-glow));"/>
        <!-- Current value dot -->
        <circle cx="${points[points.length - 1].x}" cy="${points[points.length - 1].y}" r="4" fill="var(--accent-cyan)" style="filter: drop-shadow(0 0 4px var(--accent-cyan));"/>
      </svg>
    `;

    // Labels
    startLabel.textContent = data[0].time;
    endLabel.textContent = data[data.length - 1].time;
    countLabel.textContent = `${data.length} data points`;
  };

  return card;
}
