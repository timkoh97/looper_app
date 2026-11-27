/**
 * ui.js — DOM building blocks: piano keyboard, vertical volume slider, toast messages.
 * Layout (landscape vs rotated portrait) is handled purely in CSS.
 */

/**
 * Renders the 12 keys into `container`.
 * @param {HTMLElement} container
 * @param {object[]} pads from pads.js
 * @param {(pad: object) => void} onKeyTap
 */
export function renderKeyboard(container, pads, onKeyTap) {
  for (const pad of pads) {
    const key = document.createElement('button');
    key.className = `key ${pad.isBlack ? 'black' : 'white'}`;
    key.dataset.padId = pad.id;
    key.setAttribute('aria-label', `${pad.label} pad`);
    key.innerHTML = `<span class="key-label">${pad.labelLines.map(line => `<span>${line}</span>`).join('<span class="sep">/</span>')}</span>`;
    if (pad.isBlack) key.style.setProperty('--pos', pad.blackPos);
    if (!pad.isAvailable) {
      key.classList.add('unavailable');
      key.title = 'Pad not added yet';
    }
    key.addEventListener('click', () => onKeyTap(pad));
    container.appendChild(key);
  }
}

/** Highlights the active key and marks keys still fading out. */
export function updateKeyHighlights(container, { activePadId, fadingPadIds }) {
  for (const key of container.querySelectorAll('.key')) {
    const padId = key.dataset.padId;
    key.classList.toggle('active', padId === activePadId);
    key.classList.toggle('fading', fadingPadIds.includes(padId));
    key.setAttribute('aria-pressed', String(padId === activePadId));
  }
}

/** Briefly glows a key gold to show its tap was ignored. */
export function flashKey(container, padId) {
  const key = container.querySelector(`.key[data-pad-id="${padId}"]`);
  if (!key) return;
  key.classList.remove('ignored');
  void key.offsetWidth; // restart the animation on repeated taps
  key.classList.add('ignored');
  key.addEventListener('animationend', () => key.classList.remove('ignored'), { once: true });
}

/**
 * Turns `element` into a vertical 0–100 slider.
 * Dragging moves the value relative to where it was (a stray tap never jumps the volume).
 * @returns {{setValue: (value: number) => void}}
 */
export function createVerticalSlider(element, { value, onInput }) {
  let currentValue = value;
  let drag = null;
  const clamp = v => Math.min(100, Math.max(0, Math.round(v)));

  const render = () => {
    element.style.setProperty('--value', currentValue / 100);
    element.setAttribute('aria-valuenow', currentValue);
    element.setAttribute('aria-valuetext', `${currentValue}%`);
  };
  const setValue = (newValue, notify) => {
    newValue = clamp(newValue);
    if (newValue === currentValue) return;
    currentValue = newValue;
    render();
    if (notify) onInput(currentValue);
  };

  element.addEventListener('pointerdown', event => {
    element.setPointerCapture(event.pointerId);
    drag = { startY: event.clientY, startValue: currentValue, height: element.getBoundingClientRect().height };
  });
  element.addEventListener('pointermove', event => {
    if (!drag) return;
    setValue(drag.startValue + ((drag.startY - event.clientY) / drag.height) * 100, true);
  });
  const endDrag = () => { drag = null; };
  element.addEventListener('pointerup', endDrag);
  element.addEventListener('pointercancel', endDrag);
  element.addEventListener('keydown', event => {
    const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[event.key];
    if (step) {
      event.preventDefault();
      setValue(currentValue + step, true);
    }
  });

  render();
  return { setValue: v => setValue(v, false) };
}

let toastTimer = null;

/** Shows a short message at the bottom of the screen. */
export function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}
