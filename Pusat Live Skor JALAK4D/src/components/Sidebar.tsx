import React from 'react';
import { Calendar, Target, Trophy, BarChart3, Newspaper, Calculator, Flame, X, ChevronRight } from 'lucide-react';
import { LEAGUES } from '../data/mockData';
import { LeagueId } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedLeagueFilter: string;
  setSelectedLeagueFilter: (league: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedLeagueFilter,
  setSelectedLeagueFilter,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuItems = [
    { id: 'matches', label: 'Jadwal & Hasil', icon: Calendar, badge: 'LIVE' },
    { id: 'predictions', label: 'Prediksi & H2H', icon: Target, badge: 'HOT' },
    { id: 'standings', label: 'Klasemen Liga', icon: Trophy },
    { id: 'stats', label: 'Top Skor & Stats', icon: BarChart3 },
    { id: 'news', label: 'Berita SepakBola', icon: Newspaper },
    { id: 'calculator', label: 'Kalkulator Parlay', icon: Calculator, badge: 'TOOL' },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  const handleSelectLeague = (leagueId: string) => {
    setSelectedLeagueFilter(selectedLeagueFilter === leagueId ? 'all' : leagueId);
    if (activeTab !== 'matches' && activeTab !== 'standings') {
      setActiveTab('matches');
    }
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[80px] left-0 z-50 lg:z-10 h-screen lg:h-[calc(100vh-80px)] w-72 lg:w-64 glass-sidebar p-4 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between lg:hidden pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-cyan-400">KAPSUL4D</span>
              <span className="text-xs text-slate-400 font-semibold">Navigasi Utama</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Menu Links */}
          <div className="space-y-2">
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-cyan-400/80">
              Menu Utama
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="flex-1 text-xs sm:text-sm font-semibold">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        item.badge === 'LIVE'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : item.badge === 'HOT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Liga Populer Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400/80">
                Liga Populer
              </span>
              {selectedLeagueFilter !== 'all' && (
                <button
                  onClick={() => setSelectedLeagueFilter('all')}
                  className="text-[10px] text-slate-400 hover:text-cyan-300 underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-1">
              {LEAGUES.map((league) => {
                const isSelected = selectedLeagueFilter === league.id;
                return (
                  <button
                    key={league.id}
                    onClick={() => handleSelectLeague(league.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                        : 'text-slate-300 hover:bg-slate-900/60 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={league.flagUrl}
                        alt={league.name}
                        className="w-4 h-3 rounded-sm object-cover flex-shrink-0"
                      />
                      <span className="truncate">{league.name}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Info Banner at bottom */}
        <div className="pt-4 border-t border-slate-800/80 text-center">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-200">KAPSUL4D Portal</p>
            <p className="text-[10px] text-slate-400">Jadwal & Prediksi SepakBola Terpercaya Update 24/7</p>
          </div>
        </div>
      </aside>
    </>
  );
};
