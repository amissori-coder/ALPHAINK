import { useMemo } from 'react';
import type { AppStateApi } from '../lib/storage';
import { calcDocumento, calcRiga } from '../lib/iva';
import { fmtEUR, uid } from '../lib/format';
import type { AliquotaIVA, Documento, Prodotto, RigaDocumento } from '../types';
import { ALIQUOTE } from '../types';
import { IconPlus, IconTrash } from './ui/Icon';

interface Props {
  api: AppStateApi;
  doc: Documento;
  onChange: (d: Documento) => void;
}

const newRiga = (aliquota: AliquotaIVA): RigaDocumento => ({
  id: uid(),
  descrizione: '',
  quantita: 1,
  prezzoUnitario: 0,
  aliquota,
  scontoPct: 0,
});

export const DocumentoEditor = ({ api, doc, onChange }: Props) => {
  const prodotti = api.state.prodotti.filter((p) => p.attivo);
  const totali = useMemo(() => calcDocumento(doc), [doc]);
  const acquisto = doc.tipo === 'acquisto';

  const patch = (p: Partial<Documento>) =>
    onChange({ ...doc, ...p, aggiornatoIl: new Date().toISOString() });

  const updateRiga = (id: string, p: Partial<RigaDocumento>) => {
    const righe = doc.righe.map((r) => (r.id === id ? { ...r, ...p } : r));
    patch({ righe });
  };

  const removeRiga = (id: string) => patch({ righe: doc.righe.filter((r) => r.id !== id) });

  const addRiga = () =>
    patch({ righe: [...doc.righe, newRiga(api.state.impostazioni.aliquotaDefault)] });

  const addRigaFromProdotto = (p: Prodotto) => {
    const r: RigaDocumento = {
      id: uid(),
      prodottoId: p.id,
      descrizione: p.nome,
      quantita: 1,
      prezzoUnitario: 0,
      aliquota: p.aliquotaDefault,
      scontoPct: 0,
    };
    patch({ righe: [...doc.righe, r] });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="label">Numero</label>
          <input
            className="input"
            value={doc.numero}
            onChange={(e) => patch({ numero: e.target.value })}
            placeholder={acquisto ? 'FA-2026/001' : 'FV-2026/001'}
          />
        </div>
        <div>
          <label className="label">Data</label>
          <input
            type="date"
            className="input"
            value={doc.data}
            onChange={(e) => patch({ data: e.target.value })}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="label">{acquisto ? 'Fornitore' : 'Cliente'}</label>
          <input
            className="input"
            value={doc.controparteNome || ''}
            onChange={(e) => patch({ controparteNome: e.target.value })}
            placeholder={acquisto ? 'Ragione sociale fornitore' : 'Ragione sociale cliente'}
          />
        </div>
        <div>
          <label className="label">Stato</label>
          <select
            className="input"
            value={doc.stato}
            onChange={(e) => patch({ stato: e.target.value as Documento['stato'] })}
          >
            <option value="bozza">Bozza</option>
            <option value="emessa">{acquisto ? 'Registrata' : 'Emessa'}</option>
            <option value="da_pagare">Da pagare</option>
            <option value="pagata">Pagata</option>
          </select>
        </div>
        <div className="lg:col-span-3">
          <label className="label">Note</label>
          <input
            className="input"
            value={doc.note || ''}
            onChange={(e) => patch({ note: e.target.value })}
            placeholder="Riferimenti, ordine, causale…"
          />
        </div>
      </div>

      <div className="rounded-xl border border-ink-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 bg-ink-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
          <div className="col-span-5">Descrizione</div>
          <div className="col-span-1 text-right">Qtà</div>
          <div className="col-span-2 text-right">Prezzo unit.</div>
          <div className="col-span-1 text-right">Sc. %</div>
          <div className="col-span-1 text-right">IVA %</div>
          <div className="col-span-2 text-right">Totale</div>
        </div>
        {doc.righe.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-ink-500">
            Nessuna riga. Aggiungine una o seleziona un prodotto/servizio dall'anagrafica.
          </div>
        )}
        {doc.righe.map((r) => {
          const t = calcRiga(r);
          return (
            <div
              key={r.id}
              className="grid grid-cols-12 gap-2 items-center px-3 py-2 border-t border-ink-100"
            >
              <div className="col-span-5 flex gap-2">
                <select
                  className="input !py-1.5 !px-2 w-28 shrink-0 text-xs"
                  value={r.prodottoId || ''}
                  onChange={(e) => {
                    const p = api.state.prodotti.find((x) => x.id === e.target.value);
                    if (p) {
                      updateRiga(r.id, {
                        prodottoId: p.id,
                        descrizione: p.nome,
                        aliquota: p.aliquotaDefault,
                      });
                    } else {
                      updateRiga(r.id, { prodottoId: undefined });
                    }
                  }}
                >
                  <option value="">Libero</option>
                  {prodotti.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codice} · {p.nome}
                    </option>
                  ))}
                </select>
                <input
                  className="input !py-1.5"
                  value={r.descrizione}
                  onChange={(e) => updateRiga(r.id, { descrizione: e.target.value })}
                  placeholder="Descrizione riga"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  step="0.01"
                  className="input !py-1.5 text-right num"
                  value={r.quantita}
                  onChange={(e) => updateRiga(r.id, { quantita: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  className="input !py-1.5 text-right num"
                  value={r.prezzoUnitario}
                  onChange={(e) =>
                    updateRiga(r.id, { prezzoUnitario: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  step="0.1"
                  className="input !py-1.5 text-right num"
                  value={r.scontoPct || 0}
                  onChange={(e) => updateRiga(r.id, { scontoPct: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-1">
                <select
                  className="input !py-1.5 !px-2 text-right num"
                  value={r.aliquota}
                  onChange={(e) =>
                    updateRiga(r.id, { aliquota: parseInt(e.target.value, 10) as AliquotaIVA })
                  }
                >
                  {ALIQUOTE.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="num text-sm text-ink-900">{fmtEUR(t.totale)}</span>
                <button
                  className="btn-ghost !p-1.5 text-ink-400 hover:text-red-600"
                  onClick={() => removeRiga(r.id)}
                  aria-label="Elimina riga"
                >
                  <IconTrash />
                </button>
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-2 px-3 py-2 bg-ink-50/50 border-t border-ink-100">
          <button className="btn-secondary" onClick={addRiga}>
            <IconPlus /> Aggiungi riga
          </button>
          {prodotti.length > 0 && (
            <select
              className="input !py-1.5 max-w-xs"
              value=""
              onChange={(e) => {
                const p = api.state.prodotti.find((x) => x.id === e.target.value);
                if (p) addRigaFromProdotto(p);
                e.target.value = '';
              }}
            >
              <option value="">+ da anagrafica…</option>
              {prodotti.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codice} · {p.nome}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="text-xs uppercase tracking-wide text-ink-500">Imponibile</div>
          <div className="text-xl font-semibold num mt-1">{fmtEUR(totali.imponibile)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs uppercase tracking-wide text-ink-500">
            IVA {acquisto ? 'a credito' : 'a debito'}
          </div>
          <div
            className={`text-xl font-semibold num mt-1 ${acquisto ? 'text-accent-700' : 'text-ink-900'}`}
          >
            {fmtEUR(totali.iva)}
          </div>
        </div>
        <div className="card p-4 bg-ink-900 text-white border-ink-900">
          <div className="text-xs uppercase tracking-wide text-white/60">Totale</div>
          <div className="text-xl font-semibold num mt-1">{fmtEUR(totali.totale)}</div>
        </div>
      </div>
    </div>
  );
};
