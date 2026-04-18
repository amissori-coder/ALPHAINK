import { IconBox, IconCart, IconDashboard, IconInvoice, IconSettings } from './ui/Icon';

export type Tab = 'dashboard' | 'fatture' | 'acquisti' | 'prodotti' | 'impostazioni';

interface Props {
  tab: Tab;
  onChange: (t: Tab) => void;
}

const items: { key: Tab; label: string; hint: string; icon: JSX.Element }[] = [
  { key: 'dashboard', label: 'Dashboard IVA', hint: 'Saldo e suggerimenti', icon: <IconDashboard /> },
  { key: 'fatture', label: 'Fatture', hint: 'Ricavi / IVA a debito', icon: <IconInvoice /> },
  { key: 'acquisti', label: 'Acquisti', hint: 'Costi / IVA a credito', icon: <IconCart /> },
  { key: 'prodotti', label: 'Anagrafica', hint: 'Prodotti & servizi', icon: <IconBox /> },
  { key: 'impostazioni', label: 'Impostazioni', hint: 'Azienda & dati', icon: <IconSettings /> },
];

export const Sidebar = ({ tab, onChange }: Props) => (
  <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-ink-100 bg-white">
    <div className="px-5 pt-5 pb-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-ink-900 text-white flex items-center justify-center font-bold">
        α
      </div>
      <div>
        <div className="text-sm font-semibold text-ink-900 leading-tight">AlphaInk</div>
        <div className="text-xs text-ink-500">Controllo IVA & Cashflow</div>
      </div>
    </div>
    <nav className="flex-1 px-3 py-2 space-y-1">
      {items.map((it) => {
        const active = tab === it.key;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
              active
                ? 'bg-ink-900 text-white shadow-sm'
                : 'text-ink-700 hover:bg-ink-100'
            }`}
          >
            <span className={active ? 'text-white' : 'text-ink-500'}>{it.icon}</span>
            <span className="flex-1">
              <span className="block text-sm font-medium">{it.label}</span>
              <span
                className={`block text-[11px] ${active ? 'text-white/70' : 'text-ink-500'}`}
              >
                {it.hint}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
    <div className="p-4 text-[11px] text-ink-400">
      v0.1 · Dati locali cifrati per sessione browser
    </div>
  </aside>
);
