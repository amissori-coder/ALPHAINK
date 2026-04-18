import { useEffect, useState } from 'react';
import { Sidebar, type Tab } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { DocumentiList } from './components/DocumentiList';
import { Prodotti } from './components/Prodotti';
import { Impostazioni } from './components/Impostazioni';
import { useAppState } from './lib/storage';
import { IconBox, IconCart, IconDashboard, IconInvoice, IconSettings } from './components/ui/Icon';

const tabTitles: Record<Tab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard IVA',
    subtitle: 'Saldo del mese e suggerimenti operativi per il CFO',
  },
  fatture: {
    title: 'Fatture di vendita',
    subtitle: 'I prezzi si inseriscono riga per riga dentro ogni fattura',
  },
  acquisti: {
    title: 'Acquisti',
    subtitle: 'Registra i costi con i prezzi dentro ogni documento di acquisto',
  },
  prodotti: {
    title: 'Anagrafica prodotti & servizi',
    subtitle: 'Solo catalogo — i prezzi restano nelle fatture',
  },
  impostazioni: { title: 'Impostazioni', subtitle: 'Azienda, regime IVA e backup' },
};

const mobileNav: { key: Tab; label: string; icon: JSX.Element }[] = [
  { key: 'dashboard', label: 'IVA', icon: <IconDashboard size={18} /> },
  { key: 'fatture', label: 'Fatt.', icon: <IconInvoice size={18} /> },
  { key: 'acquisti', label: 'Acq.', icon: <IconCart size={18} /> },
  { key: 'prodotti', label: 'Anag.', icon: <IconBox size={18} /> },
  { key: 'impostazioni', label: 'Impost.', icon: <IconSettings size={18} /> },
];

export default function App() {
  const api = useAppState();
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem('alphaink.tab') as Tab) || 'dashboard');

  useEffect(() => {
    localStorage.setItem('alphaink.tab', tab);
  }, [tab]);

  const info = tabTitles[tab];

  return (
    <div className="flex min-h-screen">
      <Sidebar tab={tab} onChange={setTab} />
      <div className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0">
        <Topbar title={info.title} subtitle={info.subtitle} api={api} />
        <main className="flex-1">
          {tab === 'dashboard' && <Dashboard api={api} onGoToAcquisti={() => setTab('acquisti')} />}
          {tab === 'fatture' && <DocumentiList api={api} tipo="vendita" />}
          {tab === 'acquisti' && <DocumentiList api={api} tipo="acquisto" />}
          {tab === 'prodotti' && <Prodotti api={api} />}
          {tab === 'impostazioni' && <Impostazioni api={api} />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden bg-white border-t border-ink-100 flex z-40">
        {mobileNav.map((it) => {
          const active = tab === it.key;
          return (
            <button
              key={it.key}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] ${
                active ? 'text-ink-900 font-semibold' : 'text-ink-500'
              }`}
              onClick={() => setTab(it.key)}
            >
              {it.icon}
              {it.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
