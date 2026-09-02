import React, { useState } from 'react';
import { Match } from '../types';
import { MatchRowItem } from './MatchRowItem';
import { LEAGUES } from '../data/mockData';
import { Calendar, RefreshCw, Wifi, Search, X } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  selectedLeagueFilter: string;
  setSelectedLeagueFilter: (league: string) => void;
  onSelectMatch: (match: Match) => void;
  searchQuery: string;
  setSearchQuery?: (q: string) => void;
  onClearSearch?: () => void;
  isLoadingMatches?: boolean;
  onRefreshMatches?: () => void;
  isESPNLive?: boolean;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  selectedLeagueFilter,
  setSelectedLeagueFilter,
  onSelectMatch,
  searchQuery,
  setSearchQuery,
  onClearSearch,
  isLoadingMatches = false,
  onRefreshMatches,
  isESPNLive = true,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'LIVE' | 'TODAY' | 'UPCOMING' | 'FINISHED'>('all');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Filter matches by search query, status, and league
  const filteredMatches = matches.filter((m) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${m.homeTeam.name} ${m.awayTeam.name} ${m.leagueName} ${m.venue}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // League filter
    if (selectedLeagueFilter !== 'all' && m.leagueId !== selectedLeagueFilter) {
      return false;
    }

    // Status filter
    if (statusFilter === 'LIVE' && m.status !== 'LIVE') return false;
    if (statusFilter === 'FINISHED' && m.status !== 'FINISHED') return false;
    if (statusFilter === 'UPCOMING' && m.status !== 'UPCOMING') return false;
    if (statusFilter === 'TODAY' && m.date !== 'Hari Ini') return false;

    return true;
  });

  // Group matches by league for clean presentation
  const groupedByLeague: Record<string, Match[]> = {};
  filteredMatches.forEach((match) => {
    if (!groupedByLeague[match.leagueName]) {
      groupedByLeague[match.leagueName] = [];
    }
    groupedByLeague[match.leagueName].push(match);
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="glass-static p-4 space-y-3">

        {/* Row 1: Status Filters + LIVE UPDATE (Top Right) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`klasemen-tab ${statusFilter === 'all' ? 'active' : ''}`}
            >
              Semua Laga ({matches.length})
            </button>
            <button
              onClick={() => setStatusFilter('LIVE')}
              className={`klasemen-tab flex items-center gap-1.5 ${statusFilter === 'LIVE' ? 'active' : ''}`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>🔴 Live</span>
            </button>
            <button
              onClick={() => setStatusFilter('TODAY')}
              className={`klasemen-tab ${statusFilter === 'TODAY' ? 'active' : ''}`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setStatusFilter('UPCOMING')}
              className={`klasemen-tab ${statusFilter === 'UPCOMING' ? 'active' : ''}`}
            >
              Jadwal Mendatang
            </button>
            <button
              onClick={() => setStatusFilter('FINISHED')}
              className={`klasemen-tab ${statusFilter === 'FINISHED' ? 'active' : ''}`}
            >
              Selesai
            </button>
          </div>

          {/* LIVE UPDATE Button (Row 1 Top Right) */}
          {onRefreshMatches && (
            <div className="flex items-center flex-shrink-0 ml-auto">
              <button
                onClick={onRefreshMatches}
                disabled={isLoadingMatches}
                className="flex items-center gap-1.5 px-3.5 py-1.5 btn-login-style text-xs font-black cursor-pointer flex-shrink-0 disabled:opacity-50"
                title="Perbarui Jadwal Pertandingan"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-black ${isLoadingMatches ? 'animate-spin' : ''}`} />
                <span>LIVE UPDATE</span>
              </button>
            </div>
          )}
        </div>

        {/* Row 2: Leagues + Glowing Search Pill (Bottom Right) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-sky-400/20">

          {/* League Quick Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedLeagueFilter('all')}
              className={`klasemen-tab ${selectedLeagueFilter === 'all' ? 'active' : ''}`}
            >
              Semua Liga
            </button>
            {LEAGUES.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLeagueFilter(selectedLeagueFilter === l.id ? 'all' : l.id)}
                className={`klasemen-tab ${selectedLeagueFilter === l.id ? 'active' : ''} flex items-center gap-1.5`}
              >
                {l.flagUrl && (
                  <img src={l.flagUrl} alt="" className="w-3.5 h-2.5 rounded-[2px] object-cover flex-shrink-0" />
                )}
                <span>{l.name}</span>
              </button>
            ))}
          </div>

          {/* Glowing Search Pill (Row 2 Bottom Right) */}
          <div className="flex items-center flex-shrink-0 ml-auto">
            <div
              className={`search-pill-style flex items-center px-3 py-1.5 text-xs font-black cursor-text flex-shrink-0 transition-all ${
                isSearchFocused || searchQuery ? 'is-focused has-value' : ''
              }`}
            >
              <Search className="w-3.5 h-3.5 text-black flex-shrink-0 mr-1.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Cari Tim..."
                className="bg-transparent text-xs font-black text-black placeholder:text-black/70 focus:outline-none w-20 sm:w-28 focus:w-32 sm:focus:w-40 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    if (onClearSearch) onClearSearch();
                    else if (setSearchQuery) setSearchQuery('');
                  }}
                  className="p-0.5 ml-1 rounded-full text-black hover:bg-black/20 transition-colors cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5 text-black" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Matches List grouped by League */}
      {Object.keys(groupedByLeague).length > 0 ? (
        Object.entries(groupedByLeague).map(([leagueName, leagueMatches]) => (
          <div key={leagueName} className="glass-static p-4 sm:p-5">
            {/* League Section Header */}
            <div className="league-card-header flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap min-w-0">
                <img
                  src={leagueMatches[0].leagueFlag}
                  alt={leagueName}
                  className="w-5 h-3.5 rounded-sm object-cover shadow-xs border border-white flex-shrink-0"
                />
                <h3 className="font-black text-sm sm:text-lg text-white tracking-wide uppercase truncate">{leagueName}</h3>
                <span className="text-[10px] sm:text-[11px] text-sky-300 font-black bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-400/50 whitespace-nowrap flex-shrink-0">
                  {leagueMatches.length} Laga
                </span>
                {isESPNLive && (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 btn-login-style">
                    <Wifi className="w-3 h-3 text-black animate-pulse" />
                    LIVE UPDATE
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs text-white font-extrabold bg-sky-950/50 backdrop-blur-sm px-3 py-1 rounded-full border border-sky-400/60 whitespace-nowrap flex-shrink-0">{leagueMatches[0].date}</span>
            </div>

            {/* Matches Boxes List - 2 columns (kiri & kanan) on tablet/desktop, 1 column on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {leagueMatches.map((match) => (
                <MatchRowItem key={match.id} match={match} onSelectMatch={onSelectMatch} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="glass-static p-10 sm:p-12 text-center space-y-3.5">
          <Calendar className="w-12 h-12 text-sky-300 stroke-[2.5] mx-auto animate-bounce" />
          <p className="font-black text-white text-lg sm:text-xl tracking-tight">Tidak ada pertandingan ditemukan</p>
          <p className="text-sm font-bold text-sky-100 max-w-md mx-auto leading-relaxed">
            Coba ubah kata kunci pencarian atau ganti filter status &amp; liga untuk melihat pertandingan lainnya.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setStatusFilter('all');
                setSelectedLeagueFilter('all');
                if (onClearSearch) onClearSearch();
                else if (setSearchQuery) setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-700 text-white border-2 border-sky-400 text-xs sm:text-sm font-black hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-md"
            >
              Reset Semua Filter
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
