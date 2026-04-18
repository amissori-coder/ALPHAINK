import type { AppStateApi } from '../lib/storage';
import type { AliquotaIVA, Impostazioni as Imp } from '../types';
import { ALIQUOTE } from '../types';

interface Props {
  api: AppStateApi;
}

export const Impostazioni = ({ api }: Props) => {
  const imp = api.state.impostazioni;
  const set = (p: Partial<Imp>) =>
    api.setState((s) => ({ ...s, impostazioni: { ...s.impostazioni, ...p } }));

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900">Azienda</h3>
        <p className="text-xs text-ink-500 mb-4">
          Dati intestazione usati nei report IVA.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Ragione sociale</label>
            <input
              className="input"
              value={imp.ragioneSociale}
              onChange={(e) => set({ ragioneSociale: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Partita IVA</label>
            <input
              className="input font-mono"
              value={imp.piva || ''}
              onChange={(e) => set({ piva: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Valuta</label>
            <input className="input" value="EUR" readOnly />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900">Liquidazione IVA</h3>
        <p className="text-xs text-ink-500 mb-4">
          Utilizzato per calcolare saldi e suggerimenti.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Regime</label>
            <select
              className="input"
              value={imp.regimeIVA}
              onChange={(e) => set({ regimeIVA: e.target.value as Imp['regimeIVA'] })}
            >
              <option value="mensile">Mensile</option>
              <option value="trimestrale">Trimestrale</option>
            </select>
          </div>
          <div>
            <label className="label">Aliquota di riferimento</label>
            <select
              className="input"
              value={imp.aliquotaDefault}
              onChange={(e) =>
                set({ aliquotaDefault: parseInt(e.target.value, 10) as AliquotaIVA })
              }
            >
              {ALIQUOTE.map((a) => (
                <option key={a} value={a}>
                  {a}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Credito IVA pregresso</label>
            <input
              type="number"
              step="0.01"
              className="input num text-right"
              value={imp.aperturaSaldoIVA}
              onChange={(e) => set({ aperturaSaldoIVA: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      <div className="card p-5 border-red-200">
        <h3 className="text-sm font-semibold text-red-700">Area pericolosa</h3>
        <p className="text-xs text-ink-500 mt-1 mb-3">
          Cancella tutti i dati locali. L'operazione non è reversibile, esporta prima un backup.
        </p>
        <button
          className="btn-danger"
          onClick={() => {
            if (confirm('Sei sicuro di voler cancellare tutti i dati?')) api.resetAll();
          }}
        >
          Azzera archivio
        </button>
      </div>
    </div>
  );
};
