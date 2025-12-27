const DEFAULT_SECONDS = 10;

const getSecondsFromQuery = (): number => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('seconds');
  if (!raw) return DEFAULT_SECONDS;
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_SECONDS;
  return Math.max(1, Math.floor(n));
};

const setText = (id: string, text: string): void => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

let flashIntervalId: ReturnType<typeof globalThis.setInterval> | null = null;
let flashOn = false;

const getBaseTitle = (remainingSeconds: number): string =>
  `💣 Time Bomb — ${formatHms(remainingSeconds)}`;
const getFlashTitle = (remainingSeconds: number): string =>
  `💣 !!! TIME BOMB !!! — ${formatHms(remainingSeconds)}`;

const updateTitle = (remainingSeconds: number): void => {
  document.title = flashOn
    ? getFlashTitle(remainingSeconds)
    : getBaseTitle(remainingSeconds);
};

const formatHms = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const pad2 = (n: number): string => String(n).padStart(2, '0');
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
};

let remaining = getSecondsFromQuery();
const initialRemaining = remaining;
setText('count', formatHms(remaining));
updateTitle(remaining);

let intervalId: ReturnType<typeof globalThis.setInterval> | null = null;
let paused = false;

const setToggleText = (): void => {
  const el = document.getElementById('toggle');
  if (el) el.textContent = paused ? 'Re-fuse' : 'Defuse';
};

const tick = (): void => {
  remaining -= 1;
  setText('count', formatHms(remaining));
  updateTitle(remaining);

  if (remaining <= 0) {
    if (flashIntervalId !== null) {
      globalThis.clearInterval(flashIntervalId);
      flashIntervalId = null;
      flashOn = false;
    }
    window.timebomb.quit();
  }
};

const addSeconds = (seconds: number): void => {
  remaining += seconds;
  setText('count', formatHms(remaining));
  updateTitle(remaining);
  syncFlashing();
};

const syncFlashing = (): void => {
  const shouldFlash = !paused && remaining > 0 && remaining < 60;

  if (!shouldFlash) {
    if (flashIntervalId !== null) {
      globalThis.clearInterval(flashIntervalId);
      flashIntervalId = null;
    }
    flashOn = false;
    updateTitle(remaining);
    return;
  }

  if (flashIntervalId !== null) return;

  flashOn = false;
  flashIntervalId = globalThis.setInterval(() => {
    flashOn = !flashOn;
    updateTitle(remaining);
  }, 1000);
};

const startTimer = (): void => {
  if (intervalId !== null) return;
  intervalId = globalThis.setInterval(tick, 1000);
  syncFlashing();
};

const stopTimer = (): void => {
  if (intervalId === null) return;
  globalThis.clearInterval(intervalId);
  intervalId = null;
  syncFlashing();
};

const togglePause = (): void => {
  paused = !paused;
  if (paused) stopTimer();
  else startTimer();
  setToggleText();
};

const resetTimer = (): void => {
  remaining = initialRemaining;
  setText('count', formatHms(remaining));
  updateTitle(remaining);
  syncFlashing();

  if (!paused && intervalId === null) {
    startTimer();
  }
};

const wireControls = (): void => {
  const btn = document.getElementById('toggle');
  if (!btn) return;
  btn.addEventListener('click', togglePause);

  const reset = document.getElementById('reset');
  if (reset) reset.addEventListener('click', resetTimer);

  const add1 = document.getElementById('add1');
  if (add1) add1.addEventListener('click', () => addSeconds(60));

  const add5 = document.getElementById('add5');
  if (add5) add5.addEventListener('click', () => addSeconds(5 * 60));

  const add10 = document.getElementById('add10');
  if (add10) add10.addEventListener('click', () => addSeconds(10 * 60));

  const add20 = document.getElementById('add20');
  if (add20) add20.addEventListener('click', () => addSeconds(20 * 60));

  setToggleText();
};

wireControls();
startTimer();
