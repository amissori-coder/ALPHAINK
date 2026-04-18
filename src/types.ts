export type UUID = string;

export type AliquotaIVA = 0 | 4 | 5 | 10 | 22;

export const ALIQUOTE: AliquotaIVA[] = [0, 4, 5, 10, 22];

export type UnitaMisura = 'pz' | 'ore' | 'giorni' | 'kg' | 'lt' | 'mt' | 'forfait';

export const UNITA: UnitaMisura[] = ['pz', 'ore', 'giorni', 'kg', 'lt', 'mt', 'forfait'];

/** Anagrafica prodotto / servizio. I prezzi NON sono qui per scelta. */
export interface Prodotto {
  id: UUID;
  codice: string;
  nome: string;
  descrizione?: string;
  unita: UnitaMisura;
  aliquotaDefault: AliquotaIVA;
  attivo: boolean;
  creatoIl: string;
  aggiornatoIl: string;
}

export interface Controparte {
  id: UUID;
  ragioneSociale: string;
  piva?: string;
  cf?: string;
  email?: string;
  note?: string;
}

/** Riga fattura: il prezzo è DENTRO la fattura, non nel prodotto. */
export interface RigaDocumento {
  id: UUID;
  prodottoId?: UUID;
  descrizione: string;
  quantita: number;
  prezzoUnitario: number; // imponibile unitario
  aliquota: AliquotaIVA;
  scontoPct?: number;
}

export type TipoDocumento = 'vendita' | 'acquisto';

export type StatoDocumento = 'bozza' | 'emessa' | 'pagata' | 'da_pagare';

export interface Documento {
  id: UUID;
  tipo: TipoDocumento;
  numero: string;
  data: string; // ISO yyyy-mm-dd
  controparteId?: UUID;
  controparteNome?: string; // cached display
  note?: string;
  righe: RigaDocumento[];
  stato: StatoDocumento;
  creatoIl: string;
  aggiornatoIl: string;
}

export interface Impostazioni {
  ragioneSociale: string;
  piva?: string;
  regimeIVA: 'mensile' | 'trimestrale';
  aliquotaDefault: AliquotaIVA;
  aperturaSaldoIVA: number; // credito IVA pregresso (positivo = credito a favore)
  valuta: 'EUR';
}

export interface AppState {
  schemaVersion: number;
  prodotti: Prodotto[];
  controparti: Controparte[];
  documenti: Documento[];
  impostazioni: Impostazioni;
  ultimoSalvataggio?: string;
}

export const SCHEMA_VERSION = 1;

export const DEFAULT_IMPOSTAZIONI: Impostazioni = {
  ragioneSociale: '',
  piva: '',
  regimeIVA: 'mensile',
  aliquotaDefault: 22,
  aperturaSaldoIVA: 0,
  valuta: 'EUR',
};

export const EMPTY_STATE: AppState = {
  schemaVersion: SCHEMA_VERSION,
  prodotti: [],
  controparti: [],
  documenti: [],
  impostazioni: DEFAULT_IMPOSTAZIONI,
};
