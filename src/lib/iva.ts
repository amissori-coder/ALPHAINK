import type { AliquotaIVA, Documento, RigaDocumento } from '../types';
import { yyyymmOf } from './format';

export interface TotaliRiga {
  imponibile: number;
  iva: number;
  totale: number;
}

export const calcRiga = (r: RigaDocumento): TotaliRiga => {
  const lordo = (r.quantita || 0) * (r.prezzoUnitario || 0);
  const sconto = lordo * ((r.scontoPct || 0) / 100);
  const imponibile = +(lordo - sconto).toFixed(2);
  const iva = +(imponibile * (r.aliquota / 100)).toFixed(2);
  const totale = +(imponibile + iva).toFixed(2);
  return { imponibile, iva, totale };
};

export interface TotaliDocumento {
  imponibile: number;
  iva: number;
  totale: number;
  perAliquota: Record<AliquotaIVA, { imponibile: number; iva: number }>;
}

export const calcDocumento = (d: Documento): TotaliDocumento => {
  const perAliquota = {} as Record<AliquotaIVA, { imponibile: number; iva: number }>;
  let imponibile = 0;
  let iva = 0;
  for (const r of d.righe) {
    const t = calcRiga(r);
    imponibile += t.imponibile;
    iva += t.iva;
    const p = perAliquota[r.aliquota] ?? { imponibile: 0, iva: 0 };
    p.imponibile += t.imponibile;
    p.iva += t.iva;
    perAliquota[r.aliquota] = p;
  }
  return {
    imponibile: +imponibile.toFixed(2),
    iva: +iva.toFixed(2),
    totale: +(imponibile + iva).toFixed(2),
    perAliquota,
  };
};

export interface RiepilogoMese {
  mese: string; // yyyy-mm
  vendite: { imponibile: number; iva: number };
  acquisti: { imponibile: number; iva: number };
  /** IVA a debito = vendite - acquisti (positivo = da versare, negativo = credito). */
  saldoIVA: number;
  nDocVendita: number;
  nDocAcquisto: number;
}

export const riepilogoPerMese = (documenti: Documento[]): RiepilogoMese[] => {
  const map = new Map<string, RiepilogoMese>();
  for (const d of documenti) {
    const m = yyyymmOf(d.data);
    if (!m) continue;
    const t = calcDocumento(d);
    const cur =
      map.get(m) ??
      {
        mese: m,
        vendite: { imponibile: 0, iva: 0 },
        acquisti: { imponibile: 0, iva: 0 },
        saldoIVA: 0,
        nDocVendita: 0,
        nDocAcquisto: 0,
      };
    if (d.tipo === 'vendita') {
      cur.vendite.imponibile += t.imponibile;
      cur.vendite.iva += t.iva;
      cur.nDocVendita += 1;
    } else {
      cur.acquisti.imponibile += t.imponibile;
      cur.acquisti.iva += t.iva;
      cur.nDocAcquisto += 1;
    }
    cur.saldoIVA = +(cur.vendite.iva - cur.acquisti.iva).toFixed(2);
    cur.vendite.imponibile = +cur.vendite.imponibile.toFixed(2);
    cur.vendite.iva = +cur.vendite.iva.toFixed(2);
    cur.acquisti.imponibile = +cur.acquisti.imponibile.toFixed(2);
    cur.acquisti.iva = +cur.acquisti.iva.toFixed(2);
    map.set(m, cur);
  }
  return Array.from(map.values()).sort((a, b) => (a.mese < b.mese ? 1 : -1));
};

/**
 * Dato un saldo IVA a debito per il mese, suggerisce il volume di acquisti
 * (imponibile) da effettuare entro lo stesso mese per azzerare l'IVA da versare,
 * calcolato su un'aliquota di riferimento (di default 22%).
 */
export const suggerimentoAcquistiPerPareggio = (
  saldoIVADebito: number,
  aliquota: AliquotaIVA = 22,
): { imponibileDaAcquistare: number; ivaRecuperata: number; totaleLordo: number } => {
  if (saldoIVADebito <= 0 || aliquota === 0) {
    return { imponibileDaAcquistare: 0, ivaRecuperata: 0, totaleLordo: 0 };
  }
  const imponibile = saldoIVADebito / (aliquota / 100);
  const totale = imponibile * (1 + aliquota / 100);
  return {
    imponibileDaAcquistare: +imponibile.toFixed(2),
    ivaRecuperata: +saldoIVADebito.toFixed(2),
    totaleLordo: +totale.toFixed(2),
  };
};

export const meseCorrente = () => new Date().toISOString().slice(0, 7);

export const meseSuccessivoLabel = (yyyymm: string) => {
  const [y, m] = yyyymm.split('-').map((v) => parseInt(v, 10));
  const d = new Date(y, m, 1);
  return d.toISOString().slice(0, 7);
};
