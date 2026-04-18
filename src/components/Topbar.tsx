import { ReactNode } from 'react';
import type { AppStateApi } from '../lib/storage';
import { IconCheck, IconCloud, IconDownload, IconUpload } from './ui/Icon';

interface Props {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  api: AppStateApi;
}

const statusLabel = (s: AppStateApi['status'], lastSavedAt?: string) => {
  switch (s) {
    case 'saving':
      return { text: 'Salvataggio…', tone: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'saved':
      return {
        text: `Salvato ${lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''}`,
        tone: 'bg-accent-50 text-accent-700 border-accent-200',
      };
    case 'error':
      return { text: 'Errore salvataggio', tone: 'bg-red-50 text-red-700 border-red-200' };
    default:
      return {
        text: lastSavedAt
          ? `Ultimo salvataggio ${new Date(lastSavedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
          : 'Autosalvataggio attivo',
        tone: 'bg-ink-50 text-ink-600 border-ink-200',
      };
  }
};

export const Topbar = ({ title, subtitle, right, api }: Props) => {
  const st = statusLabel(api.status, api.lastSavedAt);
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-ink-100">
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-ink-900 truncate">{title}</h1>
          {subtitle && <p className="text-sm text-ink-500 truncate">{subtitle}</p>}
        </div>
        <div className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${st.tone}`}>
          {api.status === 'saved' ? <IconCheck size={13} /> : <IconCloud size={13} />}
          {st.text}
        </div>
        <div className="flex items-center gap-2">
          <label className="btn-ghost cursor-pointer !px-2.5">
            <IconUpload />
            <span className="hidden lg:inline">Importa</span>
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void api.importJSON(f);
                e.target.value = '';
              }}
            />
          </label>
          <button className="btn-ghost !px-2.5" onClick={api.exportJSON}>
            <IconDownload />
            <span className="hidden lg:inline">Esporta</span>
          </button>
          {right}
        </div>
      </div>
    </header>
  );
};
