const EUR = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

const NUM = new Intl.NumberFormat('it-IT', {
  maximumFractionDigits: 2,
});

const PCT = new Intl.NumberFormat('it-IT', {
  style: 'percent',
  maximumFractionDigits: 1,
});

export const fmtEUR = (v: number) => EUR.format(isFinite(v) ? v : 0);
export const fmtNum = (v: number) => NUM.format(isFinite(v) ? v : 0);
export const fmtPct = (v: number) => PCT.format(isFinite(v) ? v : 0);

export const fmtDate = (iso: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const meseLabel = (yyyymm: string) => {
  const [y, m] = yyyymm.split('-').map((v) => parseInt(v, 10));
  if (!y || !m) return yyyymm;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const yyyymmOf = (iso: string) => iso.slice(0, 7);

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
