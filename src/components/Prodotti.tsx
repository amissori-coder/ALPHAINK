import { useMemo, useState } from 'react';
import type { AppStateApi } from '../lib/storage';
import type { AliquotaIVA, Prodotto, UnitaMisura } from '../types';
import { ALIQUOTE, UNITA } from '../types';
import { uid } from '../lib/format';
import { EmptyState } from './ui/EmptyState';
import { Modal } from './ui/Modal';
import { IconBox, IconEdit, IconPlus, IconSearch, IconTrash } from './ui/Icon';

interface Props {
  api: AppStateApi;
}

const empty = (impAliquota: AliquotaIVA): Prodotto => {
  const now = new Date().toISOString();
  return {
    id: uid(),
    codice: '',
    nome: '',
    descrizione: '',
    unita: 'pz',
    aliquotaDefault: impAliquota,
    attivo: true,
    creatoIl: now,
    aggiornatoIl: now,
  };
};

export const Prodotti = ({ api }: Props) => {
  const [editing, setEditing] = useState<Prodotto | null>(null);
  const [filter, setFilter] = useState('');

  const items = useMemo(
    () =>
      api.state.prodotti
        .filter((p) => {
          if (!filter) return true;
          const q = filter.toLowerCase();
          return (
            p.nome.toLowerCase().includes(q) ||
            p.codice.toLowerCase().includes(q) ||
            (p.descrizione || '').toLowerCase().includes(q)
          );
        })
        .sort((a, b) => a.nome.localeCompare(b.nome)),
    [api.state.prodotti, filter],
  );

  const salva = (p: Prodotto) => {
    const upd: Prodotto = { ...p, aggiornatoIl: new Date().toISOString() };
    api.setState((s) => {
      const exists = s.prodotti.some((x) => x.id === upd.id);
      return {
        ...s,
        prodotti: exists ? s.prodotti.map((x) => (x.id === upd.id ? upd : x)) : [...s.prodotti, upd],
      };
    });
    setEditing(null);
  };

  const elimina = (id: string) => {
    if (!confirm('Eliminare questo prodotto/servizio?')) return;
    api.setState((s) => ({ ...s, prodotti: s.prodotti.filter((p) => p.id !== id) }));
  };

  return (
    <div className="p-6 space-y-5">
      <div className="card p-4 flex items-start gap-3 bg-accent-50/60 border-accent-200">
        <div className="h-8 w-8 rounded-full bg-accent-500 text-white flex items-center justify-center shrink-0">
          <IconBox size={16} />
        </div>
        <div className="text-sm text-accent-900">
          <div className="font-semibold">Anagrafica prodotti & servizi</div>
          <p className="text-accent-800/80 mt-0.5">
            Qui non si inseriscono prezzi. I prezzi di vendita e di acquisto si impostano
            direttamente dentro ogni fattura o acquisto. Questo catalogo serve solo per avere
            codici, unità di misura e aliquota IVA di riferimento.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className="input pl-9"
            placeholder="Cerca per nome, codice, descrizione…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex-1" />
        <button
          className="btn-primary"
          onClick={() => setEditing(empty(api.state.impostazioni.aliquotaDefault))}
        >
          <IconPlus /> Nuovo
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<IconBox size={22} />}
          title="Nessun prodotto o servizio"
          description="Aggiungi voci catalogo: i prezzi rimarranno nelle singole fatture."
          action={
            <button
              className="btn-primary"
              onClick={() => setEditing(empty(api.state.impostazioni.aliquotaDefault))}
            >
              <IconPlus /> Aggiungi
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500 bg-ink-50 border-b border-ink-100">
            <div className="col-span-2">Codice</div>
            <div className="col-span-4">Nome</div>
            <div className="col-span-3">Descrizione</div>
            <div className="col-span-1">Unità</div>
            <div className="col-span-1 text-right">IVA %</div>
            <div className="col-span-1 text-right">Stato</div>
          </div>
          {items.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-12 gap-3 items-center px-4 py-3 text-sm border-b border-ink-100 last:border-0 hover:bg-ink-50"
            >
              <div className="col-span-2 font-mono text-xs text-ink-700">{p.codice || '—'}</div>
              <div className="col-span-4 font-medium text-ink-900">{p.nome}</div>
              <div className="col-span-3 text-ink-600 truncate">{p.descrizione || '—'}</div>
              <div className="col-span-1 text-ink-600">{p.unita}</div>
              <div className="col-span-1 text-right num">{p.aliquotaDefault}%</div>
              <div className="col-span-1 flex justify-end items-center gap-1">
                <span
                  className={`badge ${p.attivo ? 'bg-accent-50 text-accent-700 border border-accent-200' : 'bg-ink-100 text-ink-600'}`}
                >
                  {p.attivo ? 'Attivo' : 'Arch.'}
                </span>
                <button className="btn-ghost !p-1.5" onClick={() => setEditing(p)}>
                  <IconEdit />
                </button>
                <button
                  className="btn-ghost !p-1.5 text-ink-400 hover:text-red-600"
                  onClick={() => elimina(p.id)}
                >
                  <IconTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal
          open
          size="md"
          onClose={() => setEditing(null)}
          title={editing.nome ? `Modifica ${editing.nome}` : 'Nuovo prodotto / servizio'}
          subtitle="I prezzi non si inseriscono qui: vanno in ogni singola fattura o acquisto."
          footer={
            <>
              <button className="btn-secondary" onClick={() => setEditing(null)}>
                Annulla
              </button>
              <button
                className="btn-primary"
                disabled={!editing.nome.trim()}
                onClick={() => salva(editing)}
              >
                Salva
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label">Nome</label>
              <input
                className="input"
                value={editing.nome}
                onChange={(e) => setEditing({ ...editing, nome: e.target.value })}
                autoFocus
              />
            </div>
            <div>
              <label className="label">Codice</label>
              <input
                className="input font-mono"
                value={editing.codice}
                onChange={(e) => setEditing({ ...editing, codice: e.target.value })}
                placeholder="SKU-001"
              />
            </div>
            <div>
              <label className="label">Unità</label>
              <select
                className="input"
                value={editing.unita}
                onChange={(e) => setEditing({ ...editing, unita: e.target.value as UnitaMisura })}
              >
                {UNITA.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Aliquota IVA di riferimento</label>
              <select
                className="input"
                value={editing.aliquotaDefault}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    aliquotaDefault: parseInt(e.target.value, 10) as AliquotaIVA,
                  })
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
              <label className="label">Stato</label>
              <select
                className="input"
                value={editing.attivo ? 'attivo' : 'archiviato'}
                onChange={(e) => setEditing({ ...editing, attivo: e.target.value === 'attivo' })}
              >
                <option value="attivo">Attivo</option>
                <option value="archiviato">Archiviato</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Descrizione</label>
              <textarea
                className="input min-h-[80px]"
                value={editing.descrizione || ''}
                onChange={(e) => setEditing({ ...editing, descrizione: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
