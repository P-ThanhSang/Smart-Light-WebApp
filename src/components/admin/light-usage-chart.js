// Smart Light PWA — Light Usage Bar Chart (SVG)

/**
 * Create an SVG bar chart for light usage per hour
 */
export function createLightUsageChart() {
  const card = document.createElement('div');
  card.className = 'glass-card chart-container';
  card.id = 'light-usage-chart';

  card.innerHTML = `
    <div class="chart-container__title">💡 Thời gian đèn sáng theo giờ</div>
    <div class="chart-container__canvas" id="light-usage-canvas" style="position: relative;"></div>
  `;

  const canvas = card.querySelector('#light-usage-canvas');

  card.updateData = function (lightUsage) {
    if (!lightUsage || lightUsage.length === 0) {
      canvas.innerHTML = `
        <div class="empty-state" style="height: 100%;">
          <div class="empty-state__text">Đang thu thập dữ liệu...</div>
        </div>
      `;
      return;
    }

    const width = canvas.clientWidth || 400;
    const height = 160;
    const padding = { top: 10, right: 10, bottom: 25, left: 10 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const data = lightUsage.slice(-12); // Last 12 hours
    const maxDuration = Math.max(...data.map((d) => d.duration), 1);
    const barWidth = Math.min(chartW / data.length - 4, 30);

    let barsHtml = '';
    let labelsHtml = '';

    data.forEach((d, i) => {
      const barH = (d.duration / maxDuration) * chartH;
      const x = padding.left + (i / data.length) * chartW + (chartW / data.length - barWidth) / 2;
      const y = padding.top + chartH - barH;
      const intensity = Math.min(d.duration / maxDuration, 1);

      barsHtml += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="3"
          fill="var(--accent-green)" opacity="${0.3 + intensity * 0.7}"
          style="filter: drop-shadow(0 0 ${intensity * 4}px var(--accent-green-dim));">
          <animate attributeName="height" from="0" to="${barH}" dur="0.5s" fill="freeze"/>
          <animate attributeName="y" from="${padding.top + chartH}" to="${y}" dur="0.5s" fill="freeze"/>
        </rect>
      `;

      labelsHtml += `
        <text x="${x + barWidth / 2}" y="${height - 5}" text-anchor="middle"
          fill="var(--text-muted)" font-size="9" font-family="Inter, sans-serif">
          ${String(d.hour).padStart(2, '0')}h
        </text>
      `;
    });

    canvas.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display: block;">
        <!-- Grid lines -->
        <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        ${barsHtml}
        ${labelsHtml}
      </svg>
    `;
  };

  return card;
}
