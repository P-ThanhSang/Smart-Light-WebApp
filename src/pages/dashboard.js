// Smart Light PWA — Dashboard Page
import { createTimeBadge } from '../components/time-badge.js';
import { createLightButton } from '../components/light-button.js';
import { createModeToggle } from '../components/mode-toggle.js';
import { createLdrGauge } from '../components/ldr-gauge.js';
import { createRadarIndicator } from '../components/radar-indicator.js';

export function createDashboardPage() {
  const page = document.createElement('div');
  page.className = 'page-content page-enter';
  page.id = 'page-dashboard';

  // --- Time Badge Section ---
  const timeBadgeSection = document.createElement('div');
  timeBadgeSection.style.cssText = 'display: flex; justify-content: center; margin-bottom: var(--space-lg);';
  timeBadgeSection.appendChild(createTimeBadge());
  page.appendChild(timeBadgeSection);

  // --- Light Button Section ---
  const lightSection = document.createElement('div');
  lightSection.style.cssText = 'display: flex; justify-content: center; margin-bottom: var(--space-lg);';
  lightSection.appendChild(createLightButton());
  page.appendChild(lightSection);

  // --- Mode Toggle ---
  page.appendChild(createModeToggle());

  // --- Spacer ---
  const spacer = document.createElement('div');
  spacer.style.height = 'var(--space-md)';
  page.appendChild(spacer);

  // --- Sensors Row ---
  const sensorsRow = document.createElement('div');
  sensorsRow.style.cssText = 'display: flex; flex-direction: column; gap: var(--space-md);';

  // LDR Gauge
  sensorsRow.appendChild(createLdrGauge());

  // Radar Indicator
  sensorsRow.appendChild(createRadarIndicator());

  page.appendChild(sensorsRow);

  return page;
}
