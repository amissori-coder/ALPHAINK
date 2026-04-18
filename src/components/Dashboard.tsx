import { useMemo } from 'react';
import type { AppStateApi } from '../lib/storage';
import {
  meseCorrente,
  riepilogoPerMese,
  suggerimentoAcquistiPerPareggio,
} from '../lib/iva';
import { fmtEUR, meseLabel, yyyymmOf } from '../lib/format';
import { IconArrow, IconCart, IconInvoice, IconSparkle } from './ui/Icon';

interface Props {
  api: AppStateApi;
  onGoToAcquisti: () => void;
}

export const Dashboard = ({ api, onGoToAcquisti }: Props) => {
  const { state } = api;
  const mese = meseCorrente();

  const riepilogo = useMemo(() => riepilogoPerMese(state.documenti), [state.documenti]);
  const mesiOrd = useMemo(() => riepilogo.map((r) => r.mese), [riepilogo]);
  const mensile =
    riepilogo.find((r) => r.mese === mese) || {
      mese,
      vendite: { imponibile: 0, iva: 0 },
      acquisti: { imponibile: 0, iva: 0 },
      saldoIVA: 0,
      nDocVendita: 0,
      nDocAcquisto: 0,
    };

  const saldoAperturaPregresso = state.impostazioni.aperturaSaldoIVA || 0;
  const saldoEffettivo = +(mensile.saldoIVA - saldoAperturaPregresso).toFixed(2);
  const suggest = suggerimentoAcquistiPerPareggio(saldoEffettivo, state.impostazioni.aliquotaDefault);

  const last6 = useMemo(() => {
    const base: { mese: string; vendite: number; acquisti: number; saldo: number }[] = [];
    const d = new Date(`${mese}-01T00:00:00`);
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const m = dt.toISOString().slice(0, 7);
      const r = riepilogo.find((x) => x.mese === m);
      base.push({
        mese: m,
        vendite: r?.vendite.iva || 0,
        acquisti: r?.acquisti.iva || 0,
        saldo: r?.saldoIVA || 0,
      });
    }
    return base;
  }, [mese, riepilogo]);

  const maxBar = Math.max(1, ...last6.map((m) => Math.max(m.vendite, m.acquisti)));

  const ultimi = useMemo(
    () =>
      [...state.documenti]
        .sort((a, b) => (a.data < b.data ? 1 : -1))
        .slice(0, 6),
    [state.documenti],
  );

  return (
    <div className="p-6 space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Kpi
          label="IVA vendite"
          subtitle={meseLabel(mense(mese))}
          value={fmtEUR(mensile.vendite.iva)}
          hint={`${mensile.nDocVendita} fatture · imponibile ${fmtEUR(mensile.vendite.imponibile)}`}
          tone="neutral"
        />
        <Kpi
          label="IVA acquisti"
          subtitle={meseLabel(mense(mese))}
          value={fmtEUR(mensile.acquisti.iva)}
          hint={`${mensile.nDocAcquisto} acquisti · imponibile ${fmtEUR(mensile.acquisti.imponibile)}`}
          tone="accent"
        />
        <Kpi
          label={saldoEffettivo >= 0 ? 'IVA da versare' : 'Credito IVA'}
          subtitle={meseLabel(mense(mese))}
          value={fmtEUR(Math.abs(saldoEffettivo))}
          hint={
            saldoAperturaPregresso
              ? `Incluso credito pregresso ${fmtEUR(saldoAperturaPregresso)}`
              : state.impostazioni.regimeIVA === 'mensile'
                ? 'Liquidazione mensile'
                : 'Liquidazione trimestrale'
          }
          tone={saldoEffettivo > 0 ? 'warning' : 'success'}
          big
        />
        <Kpi
          label="Documenti totali"
          subtitle="Archivio complessivo"
          value={String(state.documenti.length)}
          hint={`${mesiOrd.length} mesi tracciati`}
          tone="neutral"
        />
      </div>

      {/* Suggerimento acquisti per azzerare IVA */}
      <div
        className={`card p-5 border-l-4 ${
          saldoEffettivo > 0 ? 'border-l-amber-400' : 'border-l-accent-500'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
              saldoEffettivo > 0
                ? 'bg-amber-100 text-amber-700'
                : 'bg-accent-100 text-accent-700'
            }`}
          >
            <IconSparkle />
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide text-ink-500">
              Suggerimento per {meseLabel(mense(mese))}
            </div>
            {saldoEffettivo > 0 ? (
              <>
                <h3 className="text-lg font-semibold text-ink-900 mt-0.5">
                  Per non versare IVA: acquista entro fine mese per{' '}
                  <span className="num">{fmtEUR(suggest.imponibileDaAcquistare)}</span>{' '}
                  imponibile
                </h3>
                <p className="text-sm text-ink-600 mt-1">
                  Con aliquota di riferimento {state.impostazioni.aliquotaDefault}% recuperi{' '}
                  <b className="num">{fmtEUR(suggest.ivaRecuperata)}</b> di IVA e pareggi il saldo
                  del mese. Esborso lordo indicativo{' '}
                  <b className="num">{fmtEUR(suggest.totaleLordo)}</b>.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className="btn-primary" onClick={onGoToAcquisti}>
                    <IconCart /> Registra acquisto <IconArrow />
                  </button>
                  <span className="chip">
                    Scadenza indicativa: entro il 30 {meseShortLabel(mense(mese))}
                  </span>
                </div>
              </>
            ) : saldoEffettivo < 0 ? (
              <>
                <h3 className="text-lg font-semibold text-ink-900 mt-0.5">
                  Sei in credito IVA di <span className="num">{fmtEUR(-saldoEffettivo)}</span>
                </h3>
                <p className="text-sm text-ink-600 mt-1">
                  Questo mese hai più IVA a credito che a debito: riporterai il credito al mese
                  successivo. Nessun acquisto aggiuntivo è necessario per azzerare il versamento.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-ink-900 mt-0.5">
                  Saldo IVA in pareggio
                </h3>
                <p className="text-sm text-ink-600 mt-1">
                  Nessun versamento previsto per il mese corrente.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grafico a barre ultimi 6 mesi + riepilogo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-ink-900">Andamento IVA — ultimi 6 mesi</h3>
              <p className="text-xs text-ink-500">
                Confronto IVA a debito (vendite) vs IVA a credito (acquisti)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-ink-900" /> Vendite
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-accent-500" /> Acquisti
              </span>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-3 items-end h-48">
            {last6.map((m) => (
              <div key={m.mese} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="flex items-end gap-1 h-full w-full justify-center">
                  <div
                    className="w-3.5 bg-ink-900 rounded-t-sm"
                    style={{ height: `${(m.vendite / maxBar) * 100}%` }}
                    title={`Vendite: ${fmtEUR(m.vendite)}`}
                  />
                  <div
                    className="w-3.5 bg-accent-500 rounded-t-sm"
                    style={{ height: `${(m.acquisti / maxBar) * 100}%` }}
                    title={`Acquisti: ${fmtEUR(m.acquisti)}`}
                  />
                </div>
                <div className="text-[10px] uppercase tracking-wide text-ink-500">
                  {meseShortLabel(m.mese)}
                </div>
                <div
                  className={`text-[11px] num ${m.saldo > 0 ? 'text-amber-700' : 'text-accent-700'}`}
                >
                  {fmtEUR(m.saldo)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink-900">Riepilogo per mese</h3>
          <p className="text-xs text-ink-500 mb-3">Saldo IVA per ciascun periodo</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {riepilogo.length === 0 && (
              <div className="text-sm text-ink-500">Nessun movimento registrato.</div>
            )}
            {riepilogo.map((r) => (
              <div
                key={r.mese}
                className="flex items-center justify-between border-b border-ink-100 last:border-0 py-1.5"
              >
                <div>
                  <div className="text-sm font-medium text-ink-800">{meseLabel(r.mese)}</div>
                  <div className="text-[11px] text-ink-500">
                    {r.nDocVendita} fatt. · {r.nDocAcquisto} acq.
                  </div>
                </div>
                <div
                  className={`num text-sm font-semibold ${
                    r.saldoIVA > 0
                      ? 'text-amber-700'
                      : r.saldoIVA < 0
                        ? 'text-accent-700'
                        : 'text-ink-600'
                  }`}
                >
                  {fmtEUR(r.saldoIVA)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ultimi documenti */}
      <div className="card">
        <div className="px-5 py-3 border-b border-ink-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-900">Ultimi documenti</h3>
        </div>
        {ultimi.length === 0 ? (
          <div className="p-6 text-sm text-ink-500 text-center">
            Nessun documento ancora registrato.
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {ultimi.map((d) => (
              <li key={d.id} className="px-5 py-2.5 flex items-center gap-3 text-sm">
                <span
                  className={`h-7 w-7 rounded-full flex items-center justify-center ${
                    d.tipo === 'vendita'
                      ? 'bg-ink-900 text-white'
                      : 'bg-accent-500 text-white'
                  }`}
                >
                  {d.tipo === 'vendita' ? <IconInvoice size={14} /> : <IconCart size={14} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink-900 truncate">
                    {d.numero} · {d.controparteNome || '—'}
                  </div>
                  <div className="text-[11px] text-ink-500">
                    {yyyymmOf(d.data)} · {d.tipo === 'vendita' ? 'Vendita' : 'Acquisto'}
                  </div>
                </div>
                <div className="num text-sm">
                  {fmtEUR(
                    d.righe.reduce((acc, r) => {
                      const imp = (r.quantita || 0) * (r.prezzoUnitario || 0) * (1 - (r.scontoPct || 0) / 100);
                      return acc + imp * (1 + r.aliquota / 100);
                    }, 0),
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const mense = (m: string) => m;

const meseShortLabel = (yyyymm: string) => {
  const [y, mo] = yyyymm.split('-').map((v) => parseInt(v, 10));
  if (!y || !mo) return yyyymm;
  return new Date(y, mo - 1, 1).toLocaleDateString('it-IT', { month: 'short' });
};

interface KpiProps {
  label: string;
  subtitle: string;
  value: string;
  hint?: string;
  tone: 'neutral' | 'accent' | 'warning' | 'success';
  big?: boolean;
}
const Kpi = ({ label, subtitle, value, hint, tone, big }: KpiProps) => {
  const toneClasses = {
    neutral: 'bg-white border-ink-100',
    accent: 'bg-white border-ink-100',
    warning: 'bg-amber-50 border-amber-200',
    success: 'bg-accent-50 border-accent-200',
  }[tone];
  const valueClasses = {
    neutral: 'text-ink-900',
    accent: 'text-accent-700',
    warning: 'text-amber-700',
    success: 'text-accent-700',
  }[tone];
  return (
    <div className={`card p-4 ${toneClasses}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wide text-ink-500">{label}</span>
        <span className="text-[10px] text-ink-400">{subtitle}</span>
      </div>
      <div
        className={`mt-2 num font-semibold ${valueClasses} ${big ? 'text-3xl' : 'text-2xl'}`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-ink-500">{hint}</div>}
    </div>
  );
};
