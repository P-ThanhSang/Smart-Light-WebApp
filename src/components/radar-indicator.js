// Smart Light PWA — Radar Indicator Component
import { subscribe } from '../services/state.js';

export function createRadarIndicator() {
  const wrapper = document.createElement('div');
  wrapper.className = 'radar-indicator glass-card';
  wrapper.id = 'radar-indicator';
  wrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    position: relative;
    overflow: hidden;
  `;

  wrapper.innerHTML = `
    <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
      <!-- Ripple rings (visible when active) -->
      <div class="radar-ripple-ring" id="radar-ripple-1" style="
        position: absolute; inset: -6px; border-radius: 50%;
        border: 2px solid var(--accent-amber);
        opacity: 0; pointer-events: none;
      "></div>
      <div class="radar-ripple-ring" id="radar-ripple-2" style="
        position: absolute; inset: -6px; border-radius: 50%;
        border: 2px solid var(--accent-amber);
        opacity: 0; pointer-events: none;
      "></div>
      <!-- Icon -->
      <div id="radar-icon" style="
        width: 40px; height: 40px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.3rem;
        transition: all 0.3s ease;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
      ">📡</div>
    </div>
    <div style="flex: 1; min-width: 0;">
      <div id="radar-status" style="
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
        transition: color 0.3s ease;
      ">Không có chuyển động</div>
      <div id="radar-detail" style="
        font-size: var(--font-size-xs);
        color: var(--text-muted);
        margin-top: 2px;
      ">Radar RCWL-0516</div>
    </div>
    <div id="radar-dot" style="
      width: 10px; height: 10px; border-radius: 50%;
      background: var(--text-muted);
      flex-shrink: 0;
      transition: all 0.3s ease;
    "></div>
  `;

  const icon = wrapper.querySelector('#radar-icon');
  const status = wrapper.querySelector('#radar-status');
  const dot = wrapper.querySelector('#radar-dot');
  const ripple1 = wrapper.querySelector('#radar-ripple-1');
  const ripple2 = wrapper.querySelector('#radar-ripple-2');

  subscribe((state) => {
    const active = state.radar;

    if (active) {
      icon.style.background = 'var(--accent-amber-dim)';
      icon.style.borderColor = 'var(--accent-amber)';
      status.textContent = 'Phát hiện chuyển động!';
      status.style.color = 'var(--accent-amber)';
      dot.style.background = 'var(--accent-amber)';
      dot.style.boxShadow = '0 0 8px var(--accent-amber)';

      // Ripple animation
      ripple1.style.animation = 'radar-ripple 1.5s ease-out infinite';
      ripple2.style.animation = 'radar-ripple 1.5s ease-out 0.5s infinite';
    } else {
      icon.style.background = 'var(--bg-secondary)';
      icon.style.borderColor = 'var(--border-color)';
      status.textContent = 'Không có chuyển động';
      status.style.color = 'var(--text-primary)';
      dot.style.background = 'var(--text-muted)';
      dot.style.boxShadow = 'none';

      ripple1.style.animation = 'none';
      ripple2.style.animation = 'none';
    }
  });

  return wrapper;
}
