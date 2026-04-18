import { useMemo, useState } from 'react';
import type { AppStateApi } from '../lib/storage';
import type { Documento, StatoDocumento, TipoDocumento } from '../types';
import { calcDocumento } from '../lib/iva';
import { fmtDate, fmtEUR, todayISO, uid, yyyymmOf } from '../lib/format';
import { DocumentoEditor } from './DocumentoEditor';
import { Modal } from './ui/Modal';
import { EmptyState } from './ui/EmptyState';
import { IconCart, IconInvoice, IconPlus, IconSearch, IconTrash } from './ui/Icon';

interface Props {
  api: AppStateApi;
  tipo: TipoDocumento;
}

const statoBadge: Record<StatoDocumento, string> = {
  bozza: 'bg-ink-100 text-ink-700',
  emessa: 'bg-sky-50 text-sky-700 border border-sky-200',
  da_pagare: 'bg-amber-50 text-amber-700 border border-amber-200',
  pagata: 'bg-accent-50 text-accent-700 border border-accent-200',
};
const statoLabel: Record<StatoDocumento, string> = {
  bozza: 'Bozza',
  emessa: 'Emessa',
  da_pagare: 'Da pagare',
  pagata: 'Pagata',
};

const numeroSuccessivo = (docs: Documento[], tipo: TipoDocumento) => {
  const prefix = tipo === 'vendita' ? 'FV' : 'FA';
  const year = new Date().getFullYear();
  const regex = new RegExp(`^${prefix}-${year}/(\\d+)$`);
  const max = docs
    .filter((d) => d.tipo === tipo)
    .reduce((acc, d) => {
      const m = d.numero.match(regex);
      if (!m) return acc;
      return Math.max(acc, parseInt(m[1], 10));
    }, 0);
  return `${prefix}-${year}/${String(max + 1).padStart(3, '0')}`;
};

export const DocumentiList = ({ api, tipo }: Props) => {
  const [editing, setEditing] = useState<Documento | null>(null);
  const [filter, setFilter] = useState('');
  const [meseSel, setMeseSel] = useState<string>('');

  const docs = useMemo(
    () =>
      api.state.documenti
        .filter((d) => d.tipo === tipo)
        .filter((d) => (meseSel ? yyyymmOf(d.data) === meseSel : true))
        .filter((d) => {
          if (!filter) return true;
          const q = filter.toLowerCase();
          return (
            d.numero.toLowerCase().includes(q) ||
            (d.controparteNome || '').toLowerCase().includes(q) ||
            (d.note || '').toLowerCase().includes(q)
          );
        })
        .sort((a, b) => (a.data < b.data ? 1 : -1)),
    [api.state.documenti, tipo, filter, meseSel],
  );

  const mesiDisponibili = useMemo(() => {
    const set = new Set<string>();
    api.state.documenti.filter((d) => d.tipo === tipo).forEach((d) => set.add(yyyymmOf(d.data)));
    return Array.from(set).sort().reverse();
  }, [api.state.documenti, tipo]);

  const totali = useMemo(() => {
    let imponibile = 0;
    let iva = 0;
    for (const d of docs) {
      const t = calcDocumento(d);
      imponibile += t.imponibile;
      iva += t.iva;
    }
    return { imponibile: +imponibile.toFixed(2), iva: +iva.toFixed(2) };
  }, [docs]);

  const openNew = () => {
    const now = new Date().toISOString();
    const nuovo: Documento = {
      id: uid(),
      tipo,
      numero: numeroSuccessivo(api.state.documenti, tipo),
      data: todayISO(),
      controparteNome: '',
      note: '',
      righe: [],
      stato: 'bozza',
      creatoIl: now,
      aggiornatoIl: now,
    };
    setEditing(nuovo);
  };

  const salva = (d: Documento) => {
    api.setState((s) => {
      const exists = s.documenti.some((x) => x.id === d.id);
      return {
        ...s,
        documenti: exists
          ? s.documenti.map((x) => (x.id === d.id ? d : x))
          : [...s.documenti, d],
      };
    });
    setEditing(null);
  };

  const elimina = (id: string) => {
    if (!confirm('Eliminare questo documento?')) return;
    api.setState((s) => ({ ...s, documenti: s.documenti.filter((d) => d.id !== id) }));
  };

  const isVendita = tipo === 'vendita';
  const Icon = isVendita ? IconInvoice : IconCart;
  const ivaLabel = isVendita ? 'IVA a debito' : 'IVA a credito';

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className="input pl-9"
            placeholder={`Cerca ${isVendita ? 'fatture' : 'acquisti'}…`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <select
          className="input max-w-[180px]"
          value={meseSel}
          onChange={(e) => setMeseSel(e.target.value)}
        >
          <option value="">Tutti i mesi</option>
          {mesiDisponibili.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <div className="chip">
          {docs.length} documenti · Imponibile{' '}
          <span className="num font-semibold">{fmtEUR(totali.imponibile)}</span> · {ivaLabel}{' '}
          <span className="num font-semibold">{fmtEUR(totali.iva)}</span>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <IconPlus /> Nuovo {isVendita ? 'documento' : 'acquisto'}
        </button>
      </div>

      {docs.length === 0 ? (
        <EmptyState
          icon={<Icon size={22} />}
          title={isVendita ? 'Nessuna fattura' : 'Nessun acquisto registrato'}
          description={
            isVendita
              ? 'Registra le fatture di vendita per calcolare l’IVA a debito del mese.'
              : 'Registra gli acquisti, con i relativi prezzi dentro ogni documento, per ottenere l’IVA a credito.'
          }
          action={
            <button className="btn-primary" onClick={openNew}>
              <IconPlus /> Crea il primo
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500 bg-ink-50 border-b border-ink-100">
            <div className="col-span-2">Numero</div>
            <div className="col-span-2">Data</div>
            <div className="col-span-4">{isVendita ? 'Cliente' : 'Fornitore'}</div>
            <div className="col-span-1 text-right">Imponib.</div>
            <div className="col-span-1 text-right">IVA</div>
            <div className="col-span-1 text-right">Totale</div>
            <div className="col-span-1 text-right">Stato</div>
          </div>
          {docs.map((d) => {
            const t = calcDocumento(d);
            return (
              <button
                key={d.id}
                onClick={() => setEditing(d)}
                className="group grid grid-cols-12 gap-3 items-center px-4 py-3 text-sm text-left border-b border-ink-100 last:border-0 hover:bg-ink-50 transition-colors w-full"
              >
                <div className="col-span-2 font-medium text-ink-900">{d.numero}</div>
                <div className="col-span-2 text-ink-600">{fmtDate(d.data)}</div>
                <div className="col-span-4 truncate text-ink-800">
                  {d.controparteNome || <span className="text-ink-400">—</span>}
                </div>
                <div className="col-span-1 text-right num">{fmtEUR(t.imponibile)}</div>
                <div className="col-span-1 text-right num text-ink-600">{fmtEUR(t.iva)}</div>
                <div className="col-span-1 text-right num font-semibold">{fmtEUR(t.totale)}</div>
                <div className="col-span-1 flex justify-end items-center gap-2">
                  <span className={`badge ${statoBadge[d.stato]}`}>{statoLabel[d.stato]}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      elimina(d.id);
                    }}
                    role="button"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-400 hover:text-red-600 p-1"
                  >
                    <IconTrash />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {editing && (
        <Modal
          open
          size="xl"
          onClose={() => setEditing(null)}
          title={`${isVendita ? 'Fattura di vendita' : 'Fattura di acquisto'} · ${editing.numero}`}
          subtitle={
            isVendita
              ? 'I prezzi unitari vanno inseriti qui, riga per riga.'
              : 'Inserisci i prezzi di acquisto direttamente in questa fattura.'
          }
          footer={
            <>
              <button className="btn-secondary" onClick={() => setEditing(null)}>
                Chiudi
              </button>
              <button className="btn-primary" onClick={() => salva(editing)}>
                Salva
              </button>
            </>
          }
        >
          <DocumentoEditor api={api} doc={editing} onChange={setEditing} />
        </Modal>
      )}
    </div>
  );
};
