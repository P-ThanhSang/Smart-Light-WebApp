// Smart Light PWA — Navigation Bar Component

/**
 * Create a bottom navigation bar
 * @param {Array} tabs - [{ id, label, icon, hash }]
 * @param {Function} onTabChange - callback(tabId)
 */
export function createNavBar(tabs, onTabChange) {
  const nav = document.createElement('nav');
  nav.className = 'nav-bar';
  nav.id = 'nav-bar';

  tabs.forEach((tab) => {
    const btn = document.createElement('button');
    btn.className = 'nav-bar__item';
    btn.dataset.tab = tab.id;
    btn.id = `nav-${tab.id}`;
    btn.innerHTML = `
      <span class="nav-bar__icon">${tab.icon}</span>
      <span class="nav-bar__label">${tab.label}</span>
    `;
    btn.addEventListener('click', () => {
      window.location.hash = tab.hash;
      if (onTabChange) onTabChange(tab.id);
    });
    nav.appendChild(btn);
  });

  return nav;
}

/**
 * Update active tab visual state
 */
export function setActiveTab(nav, activeTabId) {
  const items = nav.querySelectorAll('.nav-bar__item');
  items.forEach((item) => {
    const isActive = item.dataset.tab === activeTabId;
    item.classList.toggle('nav-bar__item--active', isActive);
  });
}

// --- Tab Definitions ---

export const USER_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', hash: '#dashboard' },
  { id: 'settings', label: 'Settings', icon: '⚙️', hash: '#settings' },
];

export const ADMIN_TABS = [
  { id: 'logs', label: 'Logs', icon: '📋', hash: '#logs' },
  { id: 'analytics', label: 'Analytics', icon: '📊', hash: '#analytics' },
  { id: 'schedule', label: 'Schedule', icon: '⏰', hash: '#schedule' },
  { id: 'system', label: 'System', icon: '🛠️', hash: '#system' },
];
