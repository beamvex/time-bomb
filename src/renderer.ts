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

const setTitle = (remainingSeconds: number): void => {
  document.title = `Time Bomb — ${formatHms(remainingSeconds)}`;
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
setTitle(remaining);

let intervalId: ReturnType<typeof globalThis.setInterval> | null = null;
let paused = false;

const setToggleText = (): void => {
  const el = document.getElementById('toggle');
  if (el) el.textContent = paused ? 'Re-fuse' : 'Defuse';
};

const tick = (): void => {
  remaining -= 1;
  setText('count', formatHms(remaining));
  setTitle(remaining);

  if (remaining <= 0) {
    window.timebomb.quit();
  }
};

const startTimer = (): void => {
  if (intervalId !== null) return;
  intervalId = globalThis.setInterval(tick, 1000);
};

const stopTimer = (): void => {
  if (intervalId === null) return;
  globalThis.clearInterval(intervalId);
  intervalId = null;
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
  setTitle(remaining);

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

  setToggleText();
};

wireControls();
startTimer();
