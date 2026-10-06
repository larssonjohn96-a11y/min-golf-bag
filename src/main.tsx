import { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { MapPinned, Ruler, GitCompareArrows, Download } from 'lucide-react';
import MinBag from './pages/min-bag';
import MapBag from './pages/map-my-bag';
import MapClub from './pages/map-club';
import Compare from './pages/compare';
import Transfer from './pages/transfer';
import './styles.css';

class ErrorBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() { return this.state.failed ? <main className="mx-auto max-w-md p-6"><h1 className="text-3xl">Kunde inte öppna vyn</h1><p className="mt-3">Din sparade bag finns kvar. Kontrollera att webbläsaren tillåter lokal lagring och försök igen.</p><a href="/" className="mt-6 inline-block underline">Till Min Golfbag</a></main> : this.props.children; }
}

const path = window.location.pathname.replace(/\/$/, '') || '/';
const pages: Record<string, ReactNode> = {'/': <MinBag/>, '/min-bag': <MinBag/>, '/map-my-bag': <MapBag/>, '/map-club': <MapClub/>, '/jamfor': <Compare/>, '/data': <Transfer/>};
const links = [{href:'/',label:'Min bag',Icon:MapPinned}, {href:'/map-my-bag',label:'Mappa',Icon:Ruler}, {href:'/jamfor',label:'Jämför',Icon:GitCompareArrows}, {href:'/data',label:'Dela & spara',Icon:Download}];
createRoot(document.getElementById('root')!).render(<ErrorBoundary>
  {pages[path] ?? <main className="mx-auto max-w-md p-8"><h1>Sidan finns inte</h1><a href="/">Till Min Golfbag</a></main>}
  {path !== '/map-my-bag' && path !== '/map-club' && <nav aria-label="Huvudmeny" className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"><div className="mx-auto grid max-w-md grid-cols-4 gap-1">{links.map(({href,label,Icon}) => {const active=path===href||(href==='/'&&path==='/min-bag');return <a key={href} href={href} aria-current={active?'page':undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold ${active?'bg-primary/10 text-primary':'text-muted-foreground'}`}><Icon size={20}/>{label}</a>})}</div></nav>}
</ErrorBoundary>);
