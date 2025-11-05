export const now = () => Date.now();
export const newId = () => Math.random().toString(36).slice(2, 10);
export const fmtElapsed = (ms: number) => {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
export const caseKey = (id: string) => `case:${id}`;

export const capitalize = (s: string) => s && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
