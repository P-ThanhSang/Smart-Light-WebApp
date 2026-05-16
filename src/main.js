// Smart Light PWA — Main Entry Point + Router
import './styles/index.css';
import './styles/animations.css';
import './styles/components.css';

import { CONFIG } from './config.js';

import { startMockService } from './services/mock-service.js';
import { startSupabaseService } from './services/supabase-service.js';
import { createHeader } from './components/header.js';
import { createNavBar, setActiveTab, USER_TABS, ADMIN_TABS } from './components/nav-bar.js';
import { createPinGate } from './components/pin-gate.js';

// Pages
import { createDashboardPage } from './pages/dashboard.js';
import { createSettingsPage } from './pages/settings.js';
import { createLogsPage } from './pages/admin/logs.js';
import { createAnalyticsPage } from './pages/admin/analytics.js';
import { createSchedulePage } from './pages/admin/schedule.js';
import { createSystemPage } from './pages/admin/system.js';

// --- App State ---
let currentSection = 'user'; // 'user' | 'admin'
let currentPage = null;
let headerEl = null;
let navEl = null;
let pageContainer = null;

// --- Page Registry ---
const USER_PAGES = {
  dashboard: createDashboardPage,
  settings: createSettingsPage,
};

const ADMIN_PAGES = {
  logs: createLogsPage,
  analytics: createAnalyticsPage,
  schedule: createSchedulePage,
  system: createSystemPage,
};

// --- Initialize App ---
async function init() {
  console.log('🔆 Smart Light PWA initialized');

  const app = document.getElementById('app');
  app.innerHTML = '';

  // Show loading splash while fetching device state
  const splash = document.createElement('div');
  splash.id = 'loading-splash';
  splash.style.cssText = `
    position: fixed; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: var(--bg-primary, #f0f2f8);
    z-index: 9999; gap: 16px;
  `;
  splash.innerHTML = `
    <div style="font-size: 2.5rem; animation: pulse-glow 1.5s ease-in-out infinite;">💡</div>
    <div style="color: rgba(45,49,66,0.6); font-size: 0.85rem; letter-spacing: 0.05em;">Đang kết nối...</div>
  `;
  app.appendChild(splash);

  // Start data service and WAIT for initial data before rendering UI
  try {
    if (CONFIG.USE_MOCK) {
      startMockService();
    } else {
      await startSupabaseService();
    }
  } catch (err) {
    console.error('[Init] Service start error:', err);
  }

  // Remove splash
  splash.remove();

  // Determine section from URL path
  const path = window.location.pathname;
  if (path.startsWith('/admin')) {
    initAdmin(app);
  } else {
    initUser(app);
  }
}

// --- User Section ---
function initUser(app) {
  currentSection = 'user';

  // Header
  headerEl = createHeader(false);
  app.appendChild(headerEl);

  // Page container
  pageContainer = document.createElement('main');
  pageContainer.id = 'page-container';
  app.appendChild(pageContainer);

  // Navigation
  navEl = createNavBar(USER_TABS, (tabId) => navigateTo(tabId));
  app.appendChild(navEl);

  // Route based on hash
  const hash = window.location.hash.slice(1) || 'dashboard';
  navigateTo(hash);
}

// --- Admin Section ---
function initAdmin(app) {
  currentSection = 'admin';

  // Always require PIN on fresh page load into admin
  // Clear the session auth so PIN gate always shows when entering admin
  sessionStorage.removeItem('smart_light_admin_auth');

  // PIN Gate
  const pinGate = createPinGate(() => {
    buildAdminLayout(app);
  });

  if (pinGate) {
    // Need authentication
    app.appendChild(pinGate);
  }
  // If pinGate is null, session is already authenticated (handled in createPinGate)
}

function buildAdminLayout(app) {
  app.innerHTML = '';

  // Header
  headerEl = createHeader(true);
  app.appendChild(headerEl);

  // Page container
  pageContainer = document.createElement('main');
  pageContainer.id = 'page-container';
  app.appendChild(pageContainer);

  // Navigation
  navEl = createNavBar(ADMIN_TABS, (tabId) => navigateTo(tabId));
  app.appendChild(navEl);

  // Route
  const hash = window.location.hash.slice(1) || 'logs';
  navigateTo(hash);
}

// --- Router ---
function navigateTo(pageId) {
  const pages = currentSection === 'user' ? USER_PAGES : ADMIN_PAGES;

  // Validate page exists
  if (!pages[pageId]) {
    const defaultPage = currentSection === 'user' ? 'dashboard' : 'logs';
    pageId = defaultPage;
  }

  // Skip if same page
  if (currentPage === pageId) return;
  currentPage = pageId;

  // Update hash
  if (window.location.hash.slice(1) !== pageId) {
    window.location.hash = pageId;
  }

  // Update nav
  if (navEl) setActiveTab(navEl, pageId);

  // Render page
  if (pageContainer) {
    pageContainer.innerHTML = '';
    const page = pages[pageId]();
    pageContainer.appendChild(page);
  }
}

// --- Hash Change Listener ---
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (hash) navigateTo(hash);
});

// --- Start ---
let initialized = false;

function boot() {
  if (initialized) return;
  initialized = true;
  init(); // async — splash handles the wait
}

document.addEventListener('DOMContentLoaded', boot);

// Also run immediately if DOM already loaded (module scripts are deferred)
if (document.readyState !== 'loading') {
  boot();
}
