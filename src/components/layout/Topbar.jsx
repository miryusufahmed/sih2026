import React from 'react';
import { Languages, User, ShieldCheck, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export default function Topbar() {
  const { t, lang, toggleLang, role, switchRole } = useApp();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {role === 'entrepreneur' ? t.roles.entrepreneur : t.roles.officer} {t.roles.switchTo && ''}
        </p>
        <p className="text-xs text-slate-400">{t.govLine}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Role switcher */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => switchRole('entrepreneur')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              role === 'entrepreneur' ? 'bg-white text-governance-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <User size={14} /> {t.roles.entrepreneur}
          </button>
          <button
            onClick={() => switchRole('officer')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              role === 'officer' ? 'bg-white text-governance-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <ShieldCheck size={14} /> {t.roles.officer}
          </button>
        </div>

        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <Languages size={15} />
          <span>{lang === 'en' ? 'English' : 'मराठी'}</span>
          <ChevronDown size={13} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}
