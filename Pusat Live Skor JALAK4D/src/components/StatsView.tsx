import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import {
  LEAGUE_TOP_SCORERS,
  LEAGUE_TOP_ASSISTS,
  OVERVIEW_TOP_SCORERS,
  OVERVIEW_TOP_ASSISTS,
} from '../data/mockData';
import { TopScorer, TopAssist } from '../types';
import { getTeamLogoUrl, DEFAULT_TEAM_LOGO } from '../utils/teamLogos';
import { fetchLiveESPNStats, ESPNStatsData } from '../utils/espnStats';
import { PlayerAvatar } from './PlayerAvatar';

interface LeagueFilter {
  id: 'all' | 'ucl' | 'epl' | 'laliga' | 'seriea' | 'bundesliga' | 'ligue1';
  name: string;
  shortName: string;
  flag: string;
}

const LEAGUES: LeagueFilter[] = [
  { id: 'all', name: 'Semua Liga', shortName: 'SEMUA', flag: '' },
  { id: 'ucl', name: 'UCL', shortName: 'UCL', flag: 'https://flagcdn.com/w40/eu.png' },
  { id: 'epl', name: 'Premier League', shortName: 'EPL', flag: 'https://flagcdn.com/w40/gb-eng.png' },
  { id: 'laliga', name: 'LaLiga', shortName: 'LALIGA', flag: 'https://flagcdn.com/w40/es.png' },
  { id: 'seriea', name: 'Serie A', shortName: 'SERIE A', flag: 'https://flagcdn.com/w40/it.png' },
  { id: 'bundesliga', name: 'Bundesliga', shortName: 'BUNDESLIGA', flag: 'https://flagcdn.com/w40/de.png' },
  { id: 'ligue1', name: 'Ligue 1', shortName: 'LIGUE 1', flag: 'https://flagcdn.com/w40/fr.png' },
];

// Helper to get 2-letter initials
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface PlayerDetailModalProps {
  player: TopScorer | TopAssist;
  onClose: () => void;
  type: 'scorer' | 'assist';
}

const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, onClose, type }) => {
  const goals = player.goals ?? (type === 'scorer' ? (player as TopScorer).goals : 0);
  const assists = player.assists ?? (type === 'assist' ? (player as TopAssist).assists : 0);
  const totalGA = goals + assists;
  const initials = getInitials(player.name);

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
      style={{ zIndex: 99999 }}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white border-2 border-yellow-400 modal-gold-glow p-6 text-center space-y-5 my-auto animate-scale-up text-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (X) - Styled after Login Button without glow */}
        <button
          onClick={onClose}
          className="btn-close-stat-x absolute top-4 right-4 w-8 h-8 rounded-full z-20 cursor-pointer"
          aria-label="Tutup"
          title="Tutup"
        >
          <X className="w-4 h-4 text-black stroke-[3]" />
        </button>

        {/* Big Circular Avatar with Responsive Touch/Hover Glow */}
        <div className="flex justify-center pt-2">
          <PlayerAvatar
            name={player.name}
            photoUrl={player.photoUrl}
            team={player.team}
            size="xl"
            showTeamBadge={true}
            className="avatar-touch-glow"
          />
        </div>

        {/* Country Flag, Club Logo & Team Name */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <img
              src={getTeamLogoUrl(player.team)}
              alt={player.team}
              className="w-4 h-4 object-contain"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_TEAM_LOGO;
              }}
            />
            {player.flag && (
              <img src={player.flag} alt="" className="w-3.5 h-2.5 rounded-xs object-cover" />
            )}
            <span className="text-[11px] font-black tracking-wider uppercase text-amber-900">
              {player.team.toUpperCase()}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-wide">{player.name}</h3>

          <div className="inline-block px-3.5 py-1 rounded-full bg-yellow-400 text-black border border-yellow-500 shadow-xs text-[11px] font-black uppercase tracking-wider">
            {type === 'scorer'
              ? `${goals} Goals – ${player.matches} Matchs`
              : `${assists} Assists – ${player.matches} Matchs`}
          </div>
        </div>

        {/* 3 Stat Cards in a row with responsive touch glow & sharp black text */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {/* Card 1: Gol */}
          <div className="p-3 rounded-2xl stat-box-touch-glow text-center space-y-1 cursor-pointer">
            <div className="text-base">⚽</div>
            <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Gol</div>
            <div className="text-lg font-black text-slate-950">{goals}</div>
          </div>

          {/* Card 2: Assist */}
          <div className="p-3 rounded-2xl stat-box-touch-glow text-center space-y-1 cursor-pointer">
            <div className="text-base">👟</div>
            <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Assist</div>
            <div className="text-lg font-black text-slate-950">{assists}</div>
          </div>

          {/* Card 3: Kontribusi (G/A) */}
          <div className="p-3 rounded-2xl stat-box-touch-glow text-center space-y-1 cursor-pointer">
            <div className="text-base">🎯</div>
            <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Kontribusi</div>
            <div className="text-sm font-black text-slate-950">{totalGA} G/A</div>
          </div>
        </div>

        {/* Bottom Action Button: KEMBALI */}
        <button
          onClick={onClose}
          className="btn-kembali-glow w-full py-3.5 text-black text-sm font-black uppercase tracking-wider cursor-pointer"
        >
          KEMBALI
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

interface Top10ModalProps {
  onClose: () => void;
  title: string;
  leagueId: LeagueFilter['id'];
  onSelectPlayer: (player: TopScorer | TopAssist) => void;
  type: 'scorer' | 'assist';
  leagueScorers?: Record<string, TopScorer[]>;
  leagueAssists?: Record<string, TopAssist[]>;
}

const Top10Modal: React.FC<Top10ModalProps> = ({
  onClose,
  title,
  leagueId,
  onSelectPlayer,
  type,
  leagueScorers = LEAGUE_TOP_SCORERS,
  leagueAssists = LEAGUE_TOP_ASSISTS,
}) => {
  const [selectedModalLeague, setSelectedModalLeague] = useState<LeagueFilter['id']>(
    leagueId === 'all' ? 'epl' : leagueId
  );

  const currentLeagueList =
    type === 'scorer'
      ? leagueScorers[selectedModalLeague] || LEAGUE_TOP_SCORERS[selectedModalLeague] || []
      : leagueAssists[selectedModalLeague] || LEAGUE_TOP_ASSISTS[selectedModalLeague] || [];

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in"
      onClick={onClose}
      style={{ zIndex: 99999 }}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white border-2 border-yellow-400 modal-gold-glow p-4 sm:p-6 space-y-4 my-auto flex flex-col max-h-[90vh] animate-scale-up text-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Title & Close / Kembali Button */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-7 bg-yellow-400 rounded-full shadow-[0_0_12px_rgba(250,204,21,0.85)]"></div>
            <h2 className="font-black text-slate-950 text-base sm:text-xl uppercase tracking-wider italic">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-kembali-glow px-4 sm:px-6 py-1.5 sm:py-2 text-black text-xs font-black uppercase tracking-wider cursor-pointer hidden sm:block"
            >
              KEMBALI
            </button>
            <button
              onClick={onClose}
              className="btn-close-stat-x w-8 h-8 rounded-full flex-shrink-0 cursor-pointer"
              aria-label="Tutup"
              title="Tutup"
            >
              <X className="w-4 h-4 text-black stroke-[3]" />
            </button>
          </div>
        </div>

        {/* 5 League Tabs inside Top 10 Popup */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 no-scrollbar flex-shrink-0">
          {LEAGUES.filter((l) => l.id !== 'all').map((league) => {
            const isActive = selectedModalLeague === league.id;
            return (
              <button
                key={league.id}
                onClick={() => setSelectedModalLeague(league.id)}
                className={`px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-2 flex-shrink-0 transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'btn-login-style text-black'
                    : 'bg-slate-100 text-slate-800 border border-slate-300 hover:border-yellow-400 hover:text-black hover:bg-slate-200'
                }`}
              >
                {league.flag && (
                  <img src={league.flag} alt="" className="w-4 h-3 object-cover rounded-[2px]" />
                )}
                {league.shortName}
              </button>
            );
          })}
        </div>

        {/* Top 10 Players List with Sharp Black Text */}
        <div className="space-y-2 overflow-y-auto p-1 pr-2 custom-gold-scrollbar flex-grow">
          {currentLeagueList.map((player) => {
            const initials = getInitials(player.name);
            const value =
              type === 'scorer'
                ? `${(player as TopScorer).goals} Gol`
                : `${(player as TopAssist).assists} Assist`;

            return (
              <div
                key={`${player.rank}-${player.name}`}
                onClick={() => onSelectPlayer(player)}
                className="group relative py-2.5 px-3 rounded-xl bg-white border-2 border-slate-200 hover:border-yellow-400 hover:bg-amber-50/50 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99] transition-all duration-300 ease-out cursor-pointer flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Rank Number */}
                  <span className={`font-black text-xs sm:text-sm w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                    player.rank === 1
                      ? 'bg-yellow-400 text-black font-black'
                      : player.rank <= 3
                      ? 'bg-slate-100 text-slate-950 border border-slate-300 font-black'
                      : 'text-slate-700 font-bold'
                  }`}>
                    {player.rank}
                  </span>

                  {/* Player Photo Avatar */}
                  <PlayerAvatar
                    name={player.name}
                    photoUrl={player.photoUrl}
                    team={player.team}
                    size="sm"
                    className="transition-all duration-200 group-hover:scale-105"
                  />

                  {/* Player Name & Team with Sharp Black Text */}
                  <div className="min-w-0">
                    <h4 className="font-black text-xs text-slate-950 group-hover:text-amber-800 transition-colors truncate">
                      {player.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <img
                        src={getTeamLogoUrl(player.team)}
                        alt={player.team}
                        className="w-3.5 h-3.5 object-contain flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_TEAM_LOGO;
                        }}
                      />
                      <img
                        src={player.flag}
                        alt=""
                        className="w-3.5 h-2.5 rounded-xs object-cover flex-shrink-0"
                      />
                      <span className="text-[10px] text-slate-700 font-bold truncate">
                        {player.team} ({value} – {player.matches} Matchs)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Value Badge */}
                <div className="px-2.5 sm:px-3 py-1 rounded-lg bg-yellow-400 text-black text-[11px] font-black group-hover:bg-yellow-300 border border-yellow-500 shadow-xs flex-shrink-0 transition-all duration-300">
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export const StatsView: React.FC = () => {
  // State for live stats from ESPN (initialized with updated 2026/2027 fallback)
  const [statsData, setStatsData] = useState<ESPNStatsData>({
    leagueScorers: LEAGUE_TOP_SCORERS,
    leagueAssists: LEAGUE_TOP_ASSISTS,
    overviewScorers: OVERVIEW_TOP_SCORERS,
    overviewAssists: OVERVIEW_TOP_ASSISTS,
  });

  useEffect(() => {
    let isMounted = true;

    const loadStats = () => {
      fetchLiveESPNStats()
        .then((data) => {
          if (isMounted) {
            setStatsData(data);
          }
        })
        .catch((err) => {
          console.warn('Live ESPN stats fetch fallback used:', err);
        });
    };

    // Initial load
    loadStats();

    // Fast polling every 30 seconds to keep stats synchronized as soon as matches finish
    const intervalId = setInterval(loadStats, 30000);

    // Also refresh immediately when user focuses the tab
    const handleFocus = () => loadStats();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // State for Top Score
  const [selectedScorerLeague, setSelectedScorerLeague] = useState<LeagueFilter['id']>('all');

  // State for Top Assists
  const [selectedAssistLeague, setSelectedAssistLeague] = useState<LeagueFilter['id']>('all');

  // Modal States
  const [top10ModalOpen, setTop10ModalOpen] = useState<boolean>(false);
  const [top10ModalType, setTop10ModalType] = useState<'scorer' | 'assist'>('scorer');
  const [selectedPlayer, setSelectedPlayer] = useState<TopScorer | TopAssist | null>(null);
  const [selectedPlayerType, setSelectedPlayerType] = useState<'scorer' | 'assist'>('scorer');

  // Get displayed scorers (top 5 or overview)
  const getDisplayedScorers = (): TopScorer[] => {
    if (selectedScorerLeague === 'all') {
      return statsData.overviewScorers || OVERVIEW_TOP_SCORERS;
    }
    const leagueList = statsData.leagueScorers[selectedScorerLeague] || LEAGUE_TOP_SCORERS[selectedScorerLeague] || [];
    return leagueList.slice(0, 5);
  };

  // Get displayed assists (top 5 or overview)
  const getDisplayedAssists = (): TopAssist[] => {
    if (selectedAssistLeague === 'all') {
      return statsData.overviewAssists || OVERVIEW_TOP_ASSISTS;
    }
    const leagueList = statsData.leagueAssists[selectedAssistLeague] || LEAGUE_TOP_ASSISTS[selectedAssistLeague] || [];
    return leagueList.slice(0, 5);
  };

  const displayedScorers = getDisplayedScorers();
  const displayedAssists = getDisplayedAssists();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 2 Column Layout for Top Score & Top Assists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ======================================================== */}
        {/* COLUMN 1: TOP SCORE */}
        {/* ======================================================== */}
        <div className="glass-static p-4 sm:p-5 space-y-4 border-2 border-white/80 rounded-2xl bg-black">
          {/* Header Title & LIHAT SEMUA Button */}
          <div className="flex items-center justify-between border-b border-black/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-6 bg-slate-950 rounded-full shadow-xs"></div>
              <h3 className="font-black text-slate-950 text-base sm:text-lg md:text-xl uppercase tracking-wide font-sans">
                TOP SCORE
              </h3>
            </div>

            <button
              onClick={() => {
                setTop10ModalType('scorer');
                setTop10ModalOpen(true);
              }}
              className="btn-gold-glow px-3 py-1 text-[10px] sm:text-[11px] text-black font-black uppercase tracking-wider cursor-pointer"
            >
              LIHAT SEMUA &gt;
            </button>
          </div>

          {/* 5 League Selector Buttons below TOP SCORE */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 px-1 no-scrollbar">
            {LEAGUES.map((league) => {
              const isActive = selectedScorerLeague === league.id;
              return (
                <button
                  key={league.id}
                  onClick={() => setSelectedScorerLeague(league.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'btn-gold-glow text-black'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-yellow-400 hover:text-white'
                  }`}
                >
                  {league.flag && (
                    <img
                      src={league.flag}
                      alt=""
                      className="w-3.5 h-2.5 object-cover rounded-[2px]"
                    />
                  )}
                  {league.shortName}
                </button>
              );
            })}
          </div>

          {/* Top Score Players List */}
          <div className="space-y-2 pt-1">
            {displayedScorers.map((scorer, idx) => {
              const isRank1 = scorer.rank === 1 && selectedScorerLeague !== 'all';
              return (
                <div
                  key={`${scorer.leagueId || 'all'}-${scorer.rank}-${scorer.name}`}
                  onClick={() => {
                    setSelectedPlayer(scorer);
                    setSelectedPlayerType('scorer');
                  }}
                  className={`group relative py-2.5 px-3 rounded-xl bg-white border-2 flex items-center justify-between gap-2.5 transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] ${
                    isRank1
                      ? 'border-yellow-400 bg-amber-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-yellow-400 hover:bg-amber-50/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`font-black text-xs w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 flex-shrink-0 ${
                        scorer.rank === 1
                          ? 'bg-yellow-400 text-black border-yellow-500 shadow-xs'
                          : scorer.rank === 2
                          ? 'bg-slate-100 text-slate-950 border-slate-300 font-black'
                          : scorer.rank === 3
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200 font-bold'
                      }`}
                    >
                      {selectedScorerLeague === 'all' ? idx + 1 : scorer.rank}
                    </span>

                    {/* Player Photo Avatar */}
                    <PlayerAvatar
                      name={scorer.name}
                      photoUrl={scorer.photoUrl}
                      team={scorer.team}
                      size="sm"
                      className="transition-all duration-200 group-hover:scale-105"
                    />

                    <div className="min-w-0">
                      <h4 className="font-black text-xs text-slate-950 group-hover:text-amber-800 transition-colors flex items-center gap-1.5 truncate">
                        <span className="truncate">{scorer.name}</span>
                        {selectedScorerLeague === 'all' && scorer.leagueName && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400 text-black border border-yellow-500 font-black flex-shrink-0">
                            {scorer.leagueName}
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <img
                          src={getTeamLogoUrl(scorer.team)}
                          alt={scorer.team}
                          className="w-3.5 h-3.5 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_TEAM_LOGO;
                          }}
                        />
                        <img
                          src={scorer.flag}
                          alt=""
                          className="w-3.5 h-2.5 rounded-xs object-cover flex-shrink-0"
                        />
                        <span className="text-[10px] text-slate-700 font-bold truncate">
                          {scorer.team} ({scorer.goals} Gol - {scorer.matches} Match)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-yellow-400 text-black text-[10px] font-black shadow-xs border border-yellow-500 flex-shrink-0 transition-all duration-200">
                    {scorer.goals} Gol
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 2: TOP ASSISTS */}
        {/* ======================================================== */}
        <div className="glass-static p-4 sm:p-5 space-y-4 border-2 border-white/80 rounded-2xl bg-black">
          {/* Header Title & LIHAT SEMUA Button */}
          <div className="flex items-center justify-between border-b border-black/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-6 bg-slate-950 rounded-full shadow-xs"></div>
              <h3 className="font-black text-slate-950 text-base sm:text-lg md:text-xl uppercase tracking-wide font-sans">
                TOP ASSISTS
              </h3>
            </div>

            <button
              onClick={() => {
                setTop10ModalType('assist');
                setTop10ModalOpen(true);
              }}
              className="btn-gold-glow px-3 py-1 text-[10px] sm:text-[11px] text-black font-black uppercase tracking-wider cursor-pointer"
            >
              LIHAT SEMUA &gt;
            </button>
          </div>

          {/* 5 League Selector Buttons below TOP ASSISTS */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 px-1 no-scrollbar">
            {LEAGUES.map((league) => {
              const isActive = selectedAssistLeague === league.id;
              return (
                <button
                  key={league.id}
                  onClick={() => setSelectedAssistLeague(league.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'btn-gold-glow text-black'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-yellow-400 hover:text-white'
                  }`}
                >
                  {league.flag && (
                    <img
                      src={league.flag}
                      alt=""
                      className="w-3.5 h-2.5 object-cover rounded-[2px]"
                    />
                  )}
                  {league.shortName}
                </button>
              );
            })}
          </div>

          {/* Top Assists Players List */}
          <div className="space-y-2 pt-1">
            {displayedAssists.map((assist, idx) => {
              const isRank1 = assist.rank === 1 && selectedAssistLeague !== 'all';
              return (
                <div
                  key={`${assist.leagueId || 'all'}-${assist.rank}-${assist.name}`}
                  onClick={() => {
                    setSelectedPlayer(assist);
                    setSelectedPlayerType('assist');
                  }}
                  className={`group relative py-2.5 px-3 rounded-xl bg-white border-2 flex items-center justify-between gap-2.5 transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] ${
                    isRank1
                      ? 'border-yellow-400 bg-amber-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-yellow-400 hover:bg-amber-50/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`font-black text-xs w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 flex-shrink-0 ${
                        assist.rank === 1
                          ? 'bg-yellow-400 text-black border-yellow-500 shadow-xs'
                          : assist.rank === 2
                          ? 'bg-slate-100 text-slate-950 border-slate-300 font-black'
                          : assist.rank === 3
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200 font-bold'
                      }`}
                    >
                      {selectedAssistLeague === 'all' ? idx + 1 : assist.rank}
                    </span>

                    {/* Player Photo Avatar */}
                    <PlayerAvatar
                      name={assist.name}
                      photoUrl={assist.photoUrl}
                      team={assist.team}
                      size="sm"
                      className="transition-all duration-200 group-hover:scale-105"
                    />

                    <div className="min-w-0">
                      <h4 className="font-black text-xs text-slate-950 group-hover:text-amber-800 transition-colors flex items-center gap-1.5 truncate">
                        <span className="truncate">{assist.name}</span>
                        {selectedAssistLeague === 'all' && assist.leagueName && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400 text-black border border-yellow-500 font-black flex-shrink-0">
                            {assist.leagueName}
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <img
                          src={getTeamLogoUrl(assist.team)}
                          alt={assist.team}
                          className="w-3.5 h-3.5 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_TEAM_LOGO;
                          }}
                        />
                        <img
                          src={assist.flag}
                          alt=""
                          className="w-3.5 h-2.5 rounded-xs object-cover flex-shrink-0"
                        />
                        <span className="text-[10px] text-slate-700 font-bold truncate">
                          {assist.team} ({assist.assists} Assists - {assist.matches} Match)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-yellow-400 text-black text-[10px] font-black shadow-xs border border-yellow-500 flex-shrink-0 transition-all duration-200">
                    {assist.assists} Assist
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* POPUP MODAL 1: TOP 10 SCORE / ASSISTS */}
      {top10ModalOpen && (
        <Top10Modal
          onClose={() => setTop10ModalOpen(false)}
          title={top10ModalType === 'scorer' ? 'TOP 10 SCORE' : 'TOP 10 ASSISTS'}
          leagueId={top10ModalType === 'scorer' ? selectedScorerLeague : selectedAssistLeague}
          type={top10ModalType}
          leagueScorers={statsData.leagueScorers}
          leagueAssists={statsData.leagueAssists}
          onSelectPlayer={(player) => {
            setSelectedPlayer(player);
            setSelectedPlayerType(top10ModalType);
          }}
        />
      )}

      {/* POPUP MODAL 2: PLAYER DETAIL STATS */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          type={selectedPlayerType}
        />
      )}
    </div>
  );
};
