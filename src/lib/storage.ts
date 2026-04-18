import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  DEFAULT_IMPOSTAZIONI,
  EMPTY_STATE,
  SCHEMA_VERSION,
} from '../types';

const STORAGE_KEY = 'alphaink.state.v1';
const BACKUP_KEY = 'alphaink.state.backup.v1';
const AUTOSAVE_DEBOUNCE_MS = 400;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const migrate = (raw: unknown): AppState => {
  if (!raw || typeof raw !== 'object') return EMPTY_STATE;
  const obj = raw as Partial<AppState>;
  return {
    schemaVersion: SCHEMA_VERSION,
    prodotti: obj.prodotti ?? [],
    controparti: obj.controparti ?? [],
    documenti: obj.documenti ?? [],
    impostazioni: { ...DEFAULT_IMPOSTAZIONI, ...(obj.impostazioni ?? {}) },
    ultimoSalvataggio: obj.ultimoSalvataggio,
  };
};

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    return migrate(JSON.parse(raw));
  } catch {
    try {
      const bak = localStorage.getItem(BACKUP_KEY);
      if (bak) return migrate(JSON.parse(bak));
    } catch {
      /* ignore */
    }
    return EMPTY_STATE;
  }
};

const writeStorage = (state: AppState) => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) localStorage.setItem(BACKUP_KEY, existing);
  const payload: AppState = { ...state, ultimoSalvataggio: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload.ultimoSalvataggio!;
};

/**
 * Hook di stato globale con autosalvataggio debounciato su localStorage.
 * - Salva ad ogni modifica dopo `AUTOSAVE_DEBOUNCE_MS`
 * - Esegue un flush sincrono su `beforeunload` e `visibilitychange=hidden`
 * - Mantiene un backup della versione precedente
 */
export const useAppState = () => {
  const [state, setState] = useState<AppState>(() => loadState());
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>(
    () => loadState().ultimoSalvataggio,
  );
  const timerRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const dirtyRef = useRef(false);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      const ts = writeStorage(stateRef.current);
      setLastSavedAt(ts);
      setStatus('saved');
      dirtyRef.current = false;
    } catch (err) {
      console.error('Autosave error', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      return;
    }
    setStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(flush, AUTOSAVE_DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, flush]);

  useEffect(() => {
    const onUnload = () => flush();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(migrate(JSON.parse(e.newValue)));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('beforeunload', onUnload);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('storage', onStorage);
    };
  }, [flush]);

  const api = useMemo(
    () => ({
      state,
      setState,
      flush,
      status,
      lastSavedAt,
      exportJSON: () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alphaink-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      importJSON: async (file: File) => {
        const txt = await file.text();
        const parsed = migrate(JSON.parse(txt));
        setState(parsed);
      },
      resetAll: () => setState(EMPTY_STATE),
    }),
    [state, flush, status, lastSavedAt],
  );

  return api;
};

export type AppStateApi = ReturnType<typeof useAppState>;
