import React from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  GanttChartSquare,
  Landmark,
  ListChecks,
  Building2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-governance-800 text-white shadow-card'
          : 'text-governance-100/80 hover:bg-governance-800/60 hover:text-white'
      )}
    >
      <Icon size={18} strokeWidth={2} className="shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function Sidebar() {
  const { t, role, activeView, setActiveView } = useApp();

  const entrepreneurNav = [
    { key: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { key: 'application', label: t.nav.newApplication, icon: FilePlus2 },
    { key: 'tracker', label: t.nav.approvalTracker, icon: GanttChartSquare },
    { key: 'subsidy', label: t.nav.subsidyEngine, icon: Landmark },
  ];

  const officerNav = [
    { key: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { key: 'queue', label: t.nav.officerQueue, icon: ListChecks },
  ];

  const items = role === 'entrepreneur' ? entrepreneurNav : officerNav;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-governance-950 text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron-500">
          <Building2 size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight">{t.appName}</p>
          <p className="truncate text-[11px] text-governance-200/70">{t.appTagline}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={activeView === item.key}
            onClick={() => setActiveView(item.key)}
          />
        ))}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-[11px] leading-snug text-governance-200/60">{t.govLine}</p>
      </div>
    </aside>
  );
}
