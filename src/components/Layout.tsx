import React, { useState } from 'react';
import {
  BookOpen,
  Compass,
  Cpu,
  Target,
  ClipboardCheck,
  RotateCcw,
  BarChart3,
  Settings,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Cloud,
} from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  dueReviewCount: number;
  distractionFree?: boolean;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Compass },
  { id: 'learn', label: 'Curriculum', icon: BookOpen },
  { id: 'services', label: 'AWS Services Guide', icon: Cpu },
  { id: 'practice', label: 'Practice Engine', icon: Target },
  { id: 'exam', label: 'Exam Simulator', icon: ClipboardCheck },
  { id: 'review', label: 'Review & SRS', icon: RotateCcw },
  { id: 'progress', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const VIEW_TITLES: Record<AppView, string> = {
  dashboard: 'Study Overview',
  learn: 'AIF-C01 Curriculum',
  services: 'AWS AI Services & Decision Guide',
  practice: 'Randomized Practice Engine',
  exam: 'AIF-C01 Exam Simulator',
  review: 'Answer Review & Spaced Repetition',
  progress: 'Progress & Readiness Analytics',
  settings: 'Settings & Exam Blueprint',
};

export const Layout: React.FC<LayoutProps> = ({
  currentView,
  onNavigate,
  theme,
  onToggleTheme,
  onOpenSearch,
  dueReviewCount,
  distractionFree = false,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectNav = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col lg:flex-row">
      {distractionFree ? null : (
        <>
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
            <Cloud className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white truncate">
              AIF-C01 Prep Studio
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              AI Practitioner Workspace
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === 'review' && dueReviewCount > 0 && (
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.5 rounded tabular-nums ${
                      active
                        ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}
                  >
                    {dueReviewCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Independent AIF-C01 study platform. Not affiliated with AWS or official AWS exam banks.
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-30 h-14 px-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white truncate">
            {VIEW_TITLES[currentView]}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search study content"
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full flex flex-col border-r border-slate-200 dark:border-slate-800 z-10">
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                  <Cloud className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  AIF-C01 Prep Studio
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </span>
                    {item.id === 'review' && dueReviewCount > 0 && (
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 tabular-nums">
                        {dueReviewCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              Independent study prep tool. Not affiliated with AWS.
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Main Content Shell */}
      <div className={`flex-1 flex flex-col min-w-0 ${distractionFree ? '' : 'lg:pl-60'}`}>
        {distractionFree ? null : (
          <header className="hidden lg:flex sticky top-0 z-20 h-16 px-8 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                {VIEW_TITLES[currentView]}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenSearch}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search lessons, AWS services, topics...</span>
                <kbd className="hidden xl:inline-block font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  ⌘K
                </kbd>
              </button>
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label="Toggle light or dark theme"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-600" />
                    <span>Dark</span>
                  </>
                )}
              </button>
            </div>
          </header>
        )}

        <main
          className={
            distractionFree
              ? 'flex-1 w-full'
              : 'flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto'
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
};
