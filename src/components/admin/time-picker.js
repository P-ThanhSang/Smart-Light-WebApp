// Smart Light PWA — Custom 24h Time Picker (Scroll Wheel)

/**
 * Create a scroll-wheel time picker in 24h format
 * @param {string} label - "Giờ BẬT" or "Giờ TẮT"
 * @param {number} defaultHour - Initial hour (0-23)
 * @param {number} defaultMinute - Initial minute (0-59)
 * @returns {{ element, getTime }}
 */
export function createTimePicker(label, defaultHour = 18, defaultMinute = 0) {
  const ITEM_HEIGHT = 40;
  const VISIBLE_ITEMS = 5;
  const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

  let selectedHour = defaultHour;
  let selectedMinute = defaultMinute;

  const wrapper = document.createElement('div');
  wrapper.className = 'time-picker';
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  `;

  // Label
  const labelEl = document.createElement('div');
  labelEl.textContent = label;
  labelEl.style.cssText = `
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: var(--font-weight-semibold);
  `;
  wrapper.appendChild(labelEl);

  // Picker container
  const pickerRow = document.createElement('div');
  pickerRow.style.cssText = `
    display: flex;
    align-items: center;
    gap: 2px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: 0 4px;
    position: relative;
  `;

  // Selection highlight overlay
  const highlightCSS = `
    position: absolute;
    left: 4px;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    height: ${ITEM_HEIGHT}px;
    background: var(--accent-cyan-dim);
    border-radius: var(--border-radius-md);
    border: 1px solid rgba(0, 245, 255, 0.2);
    pointer-events: none;
    z-index: 0;
  `;

  // Create a scroll column
  function createColumn(count, padFn, defaultVal, onChange) {
    const col = document.createElement('div');
    col.style.cssText = `
      height: ${CONTAINER_HEIGHT}px;
      width: 52px;
      overflow-y: auto;
      scroll-snap-type: y mandatory;
      position: relative;
      z-index: 1;
      -ms-overflow-style: none;
      scrollbar-width: none;
    `;

    // Hide scrollbar
    const styleId = 'tp-scrollbar-hide';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `.tp-col::-webkit-scrollbar { display: none; }`;
      document.head.appendChild(style);
    }
    col.classList.add('tp-col');

    // Build items: padding + actual items + padding
    const padCount = Math.floor(VISIBLE_ITEMS / 2);

    // Top padding
    for (let i = 0; i < padCount; i++) {
      const pad = document.createElement('div');
      pad.style.cssText = `height: ${ITEM_HEIGHT}px; scroll-snap-align: center;`;
      col.appendChild(pad);
    }

    // Actual items
    for (let i = 0; i < count; i++) {
      const item = document.createElement('div');
      item.dataset.value = i;
      item.style.cssText = `
        height: ${ITEM_HEIGHT}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        scroll-snap-align: center;
        cursor: pointer;
        transition: opacity 0.2s ease;
        font-variant-numeric: tabular-nums;
        user-select: none;
      `;
      item.textContent = padFn(i);
      col.appendChild(item);
    }

    // Bottom padding
    for (let i = 0; i < padCount; i++) {
      const pad = document.createElement('div');
      pad.style.cssText = `height: ${ITEM_HEIGHT}px; scroll-snap-align: center;`;
      col.appendChild(pad);
    }

    // Scroll to default value
    requestAnimationFrame(() => {
      col.scrollTop = defaultVal * ITEM_HEIGHT;
    });

    // Update opacity based on distance from center
    function updateItemOpacity() {
      const centerY = col.scrollTop + CONTAINER_HEIGHT / 2;
      const items = col.querySelectorAll('[data-value]');
      items.forEach((item) => {
        const itemCenter = item.offsetTop + ITEM_HEIGHT / 2;
        const distance = Math.abs(centerY - itemCenter);
        const normalizedDist = Math.min(distance / (ITEM_HEIGHT * 2), 1);
        item.style.opacity = 1 - normalizedDist * 0.7;
        item.style.transform = `scale(${1 - normalizedDist * 0.15})`;
      });
    }

    // Scroll handler with debounce for final value
    let scrollTimer = null;
    col.addEventListener('scroll', () => {
      updateItemOpacity();
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const index = Math.round(col.scrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(count - 1, index));
        col.scrollTo({ top: clampedIndex * ITEM_HEIGHT, behavior: 'smooth' });
        onChange(clampedIndex);
      }, 80);
    });

    // Click to select
    col.addEventListener('click', (e) => {
      const item = e.target.closest('[data-value]');
      if (!item) return;
      const val = parseInt(item.dataset.value);
      col.scrollTo({ top: val * ITEM_HEIGHT, behavior: 'smooth' });
      onChange(val);
    });

    // Initial opacity
    requestAnimationFrame(() => {
      setTimeout(updateItemOpacity, 50);
    });

    return col;
  }

  // Hour column (00-23)
  const hourCol = createColumn(
    24,
    (i) => String(i).padStart(2, '0'),
    defaultHour,
    (val) => { selectedHour = val; }
  );

  // Separator
  const sep = document.createElement('div');
  sep.textContent = ':';
  sep.style.cssText = `
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--accent-cyan);
    z-index: 1;
    padding: 0 2px;
  `;

  // Minute column (00-59)
  const minuteCol = createColumn(
    60,
    (i) => String(i).padStart(2, '0'),
    defaultMinute,
    (val) => { selectedMinute = val; }
  );

  // Highlight bar
  const highlight = document.createElement('div');
  highlight.style.cssText = highlightCSS;

  pickerRow.appendChild(highlight);
  pickerRow.appendChild(hourCol);
  pickerRow.appendChild(sep);
  pickerRow.appendChild(minuteCol);
  wrapper.appendChild(pickerRow);

  // Display value
  const displayEl = document.createElement('div');
  displayEl.style.cssText = `
    font-size: var(--font-size-sm);
    color: var(--accent-cyan);
    font-weight: var(--font-weight-semibold);
    font-variant-numeric: tabular-nums;
    margin-top: 2px;
  `;

  function updateDisplay() {
    displayEl.textContent = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
  }
  updateDisplay();

  // Override onChange to also update display
  let hScrollTimer = null;
  hourCol.addEventListener('scroll', () => {
    clearTimeout(hScrollTimer);
    hScrollTimer = setTimeout(() => {
      const index = Math.round(hourCol.scrollTop / ITEM_HEIGHT);
      selectedHour = Math.max(0, Math.min(23, index));
      updateDisplay();
    }, 80);
  }, true);

  let mScrollTimer = null;
  minuteCol.addEventListener('scroll', () => {
    clearTimeout(mScrollTimer);
    mScrollTimer = setTimeout(() => {
      const index = Math.round(minuteCol.scrollTop / ITEM_HEIGHT);
      selectedMinute = Math.max(0, Math.min(59, index));
      updateDisplay();
    }, 80);
  }, true);

  wrapper.appendChild(displayEl);

  return {
    element: wrapper,
    getTime: () => `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`,
  };
}

