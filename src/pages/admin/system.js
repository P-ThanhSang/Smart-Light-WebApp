// Smart Light PWA — Admin System Page
import { getState } from '../../services/state.js';
import { CONFIG } from '../../config.js';
import { createSystemInfo } from '../../components/admin/system-info.js';
import { createNetworkCard } from '../../components/admin/network-card.js';

export function createSystemPage() {
  const page = document.createElement('div');
  page.className = 'page-content page-enter';
  page.id = 'page-system';

  // --- Header ---
  const header = document.createElement('div');
  header.className = 'mb-md';
  header.innerHTML = `
    <h2 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--text-primary);">
      🛠️ System
    </h2>
  `;
  page.appendChild(header);

  // --- System Info ---
  page.appendChild(createSystemInfo());

  // Spacer
  const s1 = document.createElement('div');
  s1.style.height = 'var(--space-md)';
  page.appendChild(s1);

  // --- Network ---
  page.appendChild(createNetworkCard());

  // Spacer
  const s2 = document.createElement('div');
  s2.style.height = 'var(--space-md)';
  page.appendChild(s2);

  // --- Connection Info ---
  const connCard = document.createElement('div');
  connCard.className = 'glass-card';
  connCard.innerHTML = `
    <div class="section-title">☁️ Kết nối</div>
    <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">Backend</span>
        <span style="font-size: var(--font-size-sm); color: var(--accent-cyan); font-weight: var(--font-weight-semibold);">
          ${CONFIG.USE_MOCK ? 'Mock (Local)' : 'Supabase Cloud'}
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">Device ID</span>
        <span style="font-size: var(--font-size-sm); color: var(--text-primary); font-family: monospace;">
          ${CONFIG.DEVICE_ID}
        </span>
      </div>
      ${!CONFIG.USE_MOCK ? `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">Supabase URL</span>
        <span style="font-size: var(--font-size-xs); color: var(--text-muted); font-family: monospace; max-width: 180px; overflow: hidden; text-overflow: ellipsis;">
          ${CONFIG.SUPABASE_URL}
        </span>
      </div>
      ` : ''}
    </div>
  `;
  page.appendChild(connCard);

  // Spacer
  const s3 = document.createElement('div');
  s3.style.height = 'var(--space-md)';
  page.appendChild(s3);

  // --- Backup / Restore ---
  const backupCard = document.createElement('div');
  backupCard.className = 'glass-card';
  backupCard.innerHTML = `
    <div class="section-title">💾 Backup / Restore</div>
    <div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
      <button class="btn btn--primary" id="backup-btn" style="flex: 1; min-width: 120px;">
        📥 Export Config
      </button>
      <label class="btn" id="restore-label" style="flex: 1; min-width: 120px; text-align: center; cursor: pointer;">
        📤 Import Config
        <input type="file" accept=".json" id="restore-input" style="display: none;" />
      </label>
    </div>
    <div id="restore-preview" style="display: none; margin-top: var(--space-md);"></div>
  `;

  // Backup handler
  backupCard.querySelector('#backup-btn').addEventListener('click', () => {
    const state = getState();
    const config = {
      ldr_threshold: state.ldr_threshold,
      radar_timeout: state.radar_timeout,
      schedules: state.schedules,
      mode: state.mode,
      exported_at: new Date().toISOString(),
      app_version: CONFIG.APP_VERSION,
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-light-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Restore handler
  backupCard.querySelector('#restore-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target.result);
        const preview = backupCard.querySelector('#restore-preview');
        preview.style.display = 'block';
        preview.innerHTML = `
          <div class="glass-card" style="background: var(--accent-cyan-dim); border-color: var(--accent-cyan);">
            <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--accent-cyan); margin-bottom: var(--space-sm);">
              Preview Config
            </div>
            <div style="font-size: var(--font-size-xs); color: var(--text-secondary); white-space: pre-wrap; font-family: monospace; max-height: 150px; overflow-y: auto;">
${JSON.stringify(config, null, 2)}
            </div>
            <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
              <button class="btn btn--primary btn--small" id="apply-restore-btn">Áp dụng</button>
              <button class="btn btn--small" id="cancel-restore-btn">Hủy</button>
            </div>
          </div>
        `;

        preview.querySelector('#apply-restore-btn').addEventListener('click', () => {
          import('../../services/state.js').then(({ setState }) => {
            setState({
              ldr_threshold: config.ldr_threshold,
              radar_timeout: config.radar_timeout,
              schedules: config.schedules || [],
              mode: config.mode || 'auto',
            });
            preview.innerHTML = `
              <div style="font-size: var(--font-size-sm); color: var(--accent-green); text-align: center; padding: var(--space-md);">
                ✅ Config đã được áp dụng!
              </div>
            `;
            setTimeout(() => { preview.style.display = 'none'; }, 2000);
          });
        });

        preview.querySelector('#cancel-restore-btn').addEventListener('click', () => {
          preview.style.display = 'none';
        });
      } catch (err) {
        alert('File JSON không hợp lệ!');
      }
    };
    reader.readAsText(file);
  });

  page.appendChild(backupCard);

  // Spacer
  const s4 = document.createElement('div');
  s4.style.height = 'var(--space-md)';
  page.appendChild(s4);

  // --- About ---
  const aboutCard = document.createElement('div');
  aboutCard.className = 'glass-card text-center';
  aboutCard.innerHTML = `
    <div style="font-size: 2rem; margin-bottom: var(--space-sm);">💡</div>
    <div style="font-size: var(--font-size-md); font-weight: var(--font-weight-bold); color: var(--text-primary);">
      Smart Light Dashboard
    </div>
    <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
      Version ${CONFIG.APP_VERSION} — PWA for ESP32 + Supabase
    </div>
    <div style="margin-top: var(--space-lg);">
      <a href="/" class="btn btn--small" style="text-decoration: none;">
        ← Quay lại User Dashboard
      </a>
    </div>
  `;
  page.appendChild(aboutCard);

  return page;
}
