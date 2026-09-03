import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  EPL_STANDINGS,
  LALIGA_STANDINGS,
  SERIEA_STANDINGS,
  BUNDESLIGA_STANDINGS,
  LIGUE1_STANDINGS,
} from '../data/mockData';
import { StandingRow } from '../types';
import { getTeamLogoUrl, DEFAULT_TEAM_LOGO } from '../utils/teamLogos';

interface TeamSeasonStat {
  id: string;
  name: string;
  league: string;
  leagueKey: string;
  country: string;
  logoUrl: string;
  rank: number;
  totalMatches: number;
  win: number;
  draw: number;
  lose: number;
  points: number;
}

// 20 Big Clubs configuration (7 EPL, 4 La Liga, 3 Serie A, 3 Bundesliga, 3 Ligue 1)
const CLUB_DEFINITIONS = [
  // 1. Premier League (7 Clubs)
  { id: 'arsenal', matchKeys: ['arsenal'], name: 'Arsenal', league: 'Premier League', leagueKey: 'epl', country: 'Inggris', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png' },
  { id: 'mancity', matchKeys: ['manchester city', 'man city'], name: 'Manchester City', league: 'Premier League', leagueKey: 'epl', country: 'Inggris', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png' },
  { id: 'liverpool', matchKeys: ['liverpool'], name: 'Liverpool', league: 'Premier League', leagueKey: 'epl', country: 'Inggris', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png' },
  { id: 'chelsea', matchKeys: ['chelsea'], name: 'Chelsea', league: 'Premier League', leagueKey: 'epl', country: 'Inggris', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png' },
  { id: 'manutd', matchKeys: ['manchester united', 'man united', 'man utd'], name: 'Manchester United', league: 'Premier League', leagueKey: 'epl', country: 'Inggris', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png' },
  { id: 'tottenham', matchKeys: ['tottenham', 'spurs'], name: 'Tottenham Hotspur', league: 'Premier League', leagueKey: 'epl', country: 'Inggris', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/367.png' },
  { id: 'newcastle', matchKeys: ['newcastle'], name: 'Newcastle United', league: 'Premier League', leagueKey: 'epl', country: 'Inggris', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/361.png' },

  // 2. La Liga (4 Clubs)
  { id: 'realmadrid', matchKeys: ['real madrid'], name: 'Real Madrid', league: 'La Liga', leagueKey: 'laliga', country: 'Spanyol', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png' },
  { id: 'barcelona', matchKeys: ['barcelona', 'fc barcelona'], name: 'Barcelona', league: 'La Liga', leagueKey: 'laliga', country: 'Spanyol', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png' },
  { id: 'atletico', matchKeys: ['atletico madrid', 'atlético madrid'], name: 'Atletico Madrid', league: 'La Liga', leagueKey: 'laliga', country: 'Spanyol', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png' },
  { id: 'athleticbilbao', matchKeys: ['athletic club', 'athletic bilbao', 'bilbao'], name: 'Athletic Bilbao', league: 'La Liga', leagueKey: 'laliga', country: 'Spanyol', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png' },

  // 3. Serie A (3 Clubs)
  { id: 'inter', matchKeys: ['inter', 'inter milan', 'internazionale'], name: 'Inter Milan', league: 'Serie A', leagueKey: 'seriea', country: 'Italia', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png' },
  { id: 'acmilan', matchKeys: ['milan', 'ac milan'], name: 'AC Milan', league: 'Serie A', leagueKey: 'seriea', country: 'Italia', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png' },
  { id: 'juventus', matchKeys: ['juventus'], name: 'Juventus', league: 'Serie A', leagueKey: 'seriea', country: 'Italia', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png' },

  // 4. Bundesliga (3 Clubs)
  { id: 'bayern', matchKeys: ['bayern munich', 'bayern münchen', 'bayern'], name: 'Bayern Munich', league: 'Bundesliga', leagueKey: 'bundesliga', country: 'Jerman', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png' },
  { id: 'dortmund', matchKeys: ['borussia dortmund', 'dortmund', 'bvb'], name: 'Dortmund', league: 'Bundesliga', leagueKey: 'bundesliga', country: 'Jerman', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png' },
  { id: 'leverkusen', matchKeys: ['bayer 04 leverkusen', 'bayer leverkusen', 'leverkusen'], name: 'Leverkusen', league: 'Bundesliga', leagueKey: 'bundesliga', country: 'Jerman', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/131.png' },

  // 5. Ligue 1 (3 Clubs)
  { id: 'psg', matchKeys: ['paris saint-germain', 'paris sg', 'psg'], name: 'PSG', league: 'Ligue 1', leagueKey: 'ligue1', country: 'Prancis', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png' },
  { id: 'monaco', matchKeys: ['as monaco', 'monaco'], name: 'Monaco', league: 'Ligue 1', leagueKey: 'ligue1', country: 'Prancis', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/174.png' },
  { id: 'marseille', matchKeys: ['olympique de marseille', 'marseille'], name: 'Marseille', league: 'Ligue 1', leagueKey: 'ligue1', country: 'Prancis', logoUrl: 'https://a.espncdn.com/i/teamlogos/soccer/500/166.png' },
];

const LEAGUE_FALLBACKS: Record<string, StandingRow[]> = {
  epl: EPL_STANDINGS,
  laliga: LALIGA_STANDINGS,
  seriea: SERIEA_STANDINGS,
  bundesliga: BUNDESLIGA_STANDINGS,
  ligue1: LIGUE1_STANDINGS,
};

function deriveTeamStats(
  def: typeof CLUB_DEFINITIONS[0],
  standingsByLeague: Record<string, StandingRow[]>
): TeamSeasonStat {
  const standings = standingsByLeague[def.leagueKey] || LEAGUE_FALLBACKS[def.leagueKey] || [];
  
  const foundIdx = standings.findIndex((row) => {
    const rowName = (row.team?.name || '').toLowerCase();
    const rowShort = (row.team?.shortName || '').toLowerCase();
    return def.matchKeys.some((k) => rowName.includes(k) || k.includes(rowName) || rowShort === k);
  });

  if (foundIdx !== -1) {
    const row = standings[foundIdx];
    return {
      id: def.id,
      name: def.name,
      league: def.league,
      leagueKey: def.leagueKey,
      country: def.country,
      logoUrl: def.logoUrl || getTeamLogoUrl(row.team?.name, row.team?.shortName),
      rank: row.position || foundIdx + 1,
      totalMatches: row.played ?? 0,
      win: row.won ?? 0,
      draw: row.drawn ?? 0,
      lose: row.lost ?? 0,
      points: row.points ?? 0,
    };
  }

  // If not found in standings list for season 2026/2027, default strictly to 0
  return {
    id: def.id,
    name: def.name,
    league: def.league,
    leagueKey: def.leagueKey,
    country: def.country,
    logoUrl: def.logoUrl,
    rank: 1,
    totalMatches: 0,
    win: 0,
    draw: 0,
    lose: 0,
    points: 0,
  };
}

interface TeamDetailModalProps {
  team: TeamSeasonStat;
  onClose: () => void;
}

const TeamDetailModal: React.FC<TeamDetailModalProps> = ({ team, onClose }) => {
  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
      style={{ zIndex: 99999 }}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white border-2 border-sky-400 modal-gold-glow p-6 text-center space-y-5 my-auto animate-scale-up text-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (X) */}
        <button
          onClick={onClose}
          className="btn-close-stat-x absolute top-4 right-4 w-8 h-8 rounded-full z-20 cursor-pointer"
          aria-label="Tutup"
          title="Tutup"
        >
          <X className="w-4 h-4 text-black stroke-[3]" />
        </button>

        {/* Big Circular Avatar with Club Crest */}
        <div className="flex justify-center pt-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-300 via-sky-400 to-sky-500 p-3 flex items-center justify-center avatar-touch-glow cursor-pointer">
            <img
              src={team.logoUrl}
              alt={team.name}
              className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_TEAM_LOGO;
              }}
            />
          </div>
        </div>

        {/* Header Info: Club Logo + League & Country Name */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <img
              src={team.logoUrl}
              alt={team.name}
              className="w-4 h-4 object-contain"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_TEAM_LOGO;
              }}
            />
            <span className="text-[11px] font-black tracking-wider uppercase text-sky-900">
              {team.league.toUpperCase()} • {team.country.toUpperCase()}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-wide uppercase">
            {team.name}
          </h3>

          <div className="inline-block px-3.5 py-1 rounded-full bg-sky-400 text-black border border-sky-500 shadow-xs text-[11px] font-black uppercase tracking-wider">
            Peringkat #{team.rank} – {team.totalMatches} Matchs
          </div>
        </div>

        {/* 4 Stat Cards in a row (WIN, DRAW, LOSE, Points) */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {/* Card 1: WIN */}
          <div className="p-2.5 rounded-2xl stat-box-touch-glow text-center space-y-1 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-sky-400 text-black border border-sky-500 flex items-center justify-center text-xs mx-auto font-black shadow-xs">
              🏆
            </div>
            <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
              WIN
            </div>
            <div className="text-base font-black text-slate-950">{team.win}</div>
          </div>

          {/* Card 2: DRAW */}
          <div className="p-2.5 rounded-2xl stat-box-touch-glow text-center space-y-1 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-sky-400 text-black border border-sky-500 flex items-center justify-center text-xs mx-auto font-black shadow-xs">
              ⚖️
            </div>
            <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
              DRAW
            </div>
            <div className="text-base font-black text-slate-950">{team.draw}</div>
          </div>

          {/* Card 3: LOSE */}
          <div className="p-2.5 rounded-2xl stat-box-touch-glow text-center space-y-1 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-rose-500 text-white border border-rose-600 flex items-center justify-center mx-auto font-black text-xs shadow-xs">
              ✕
            </div>
            <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
              LOSE
            </div>
            <div className="text-base font-black text-slate-950">{team.lose}</div>
          </div>

          {/* Card 4: Points */}
          <div className="p-2.5 rounded-2xl stat-box-touch-glow text-center space-y-1 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-sky-400 text-black border border-sky-500 flex items-center justify-center text-[10px] font-black mx-auto shadow-xs">
              PTS
            </div>
            <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
              POINTS
            </div>
            <div className="text-base font-black text-sky-900">{team.points}</div>
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

export interface HeroSpotlightProps {
  onSelectMatch?: (match: any) => void;
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamSeasonStat | null>(null);
  const [standingsByLeague, setStandingsByLeague] = useState<Record<string, StandingRow[]>>({});
  const isResettingRef = useRef(false);
  const isAutoScrollPausedRef = useRef(false);

  // Fetch live 2026/2027 standings from ESPN across 5 leagues to always keep club stats accurate
  useEffect(() => {
    const endpoints: Record<string, string> = {
      epl: 'https://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings',
      laliga: 'https://site.api.espn.com/apis/v2/sports/soccer/esp.1/standings',
      seriea: 'https://site.api.espn.com/apis/v2/sports/soccer/ita.1/standings',
      bundesliga: 'https://site.api.espn.com/apis/v2/sports/soccer/ger.1/standings',
      ligue1: 'https://site.api.espn.com/apis/v2/sports/soccer/fra.1/standings',
    };

    const fetchAllStandings = async () => {
      const updated: Record<string, StandingRow[]> = {};
      
      await Promise.all(
        Object.entries(endpoints).map(async ([leagueKey, url]) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return;
            const data = await res.json();
            const entries =
              data?.children?.[0]?.standings?.entries ||
              data?.standings?.[0]?.entries ||
              data?.standings?.entries ||
              data?.standings ||
              data?.entries ||
              [];
            if (entries && entries.length > 0) {
              const rows: StandingRow[] = entries.map((entry: any, index: number) => {
                const stats = entry.stats || [];
                const getStat = (names: string[]) => {
                  const s = stats.find((x: any) => names.includes(x.name));
                  return s ? Number(s.value) : 0;
                };
                const teamName = entry.team?.displayName || entry.team?.name || '';
                const shortName = entry.team?.abbreviation || teamName.substring(0, 3).toUpperCase();
                return {
                  position: getStat(['rank', 'position']) || index + 1,
                  team: {
                    id: entry.team?.id || `team-${index}`,
                    name: teamName,
                    shortName: shortName,
                    badgeBg: entry.team?.logos?.[0]?.href || '#1e293b',
                    badgeTextColor: '#ffffff',
                    country: 'Eropa',
                    form: [],
                  },
                  played: getStat(['gamesPlayed', 'games', 'played']),
                  won: getStat(['wins', 'won']),
                  drawn: getStat(['ties', 'draws', 'drawn']),
                  lost: getStat(['losses', 'lost']),
                  goalsFor: getStat(['pointsFor', 'goalsFor']),
                  goalsAgainst: getStat(['pointsAgainst', 'goalsAgainst']),
                  goalDifference: getStat(['pointDifferential', 'goalDifference']),
                  points: getStat(['points', 'pts']),
                  zone: 'none',
                };
              });

              if (rows.length > 0) {
                updated[leagueKey] = rows;
              }
            }
          } catch (e) {
            // Silently continue
          }
        })
      );

      if (Object.keys(updated).length > 0) {
        setStandingsByLeague((prev) => ({ ...prev, ...updated }));
      }
    };

    fetchAllStandings();
  }, []);

  // ====== AUTO-SCROLL PELAN (running text) — berhenti saat hover/sentuh ======
  const autoScrollPosRef = useRef<number | null>(null);
  const lastTouchRef = useRef<number>(0);

  useEffect(() => {
    let rafId: number;

    const autoScrollStep = () => {
      const container = scrollContainerRef.current;
      const touchGrace = Date.now() - lastTouchRef.current < 1200;
      const isPaused = isAutoScrollPausedRef.current || touchGrace;

      if (container && !isPaused && !isResettingRef.current) {
        // Posisi disimpan pecahan di ref — scrollLeft browser dibulatkan,
        // jadi += 0.35 langsung ke scrollLeft tidak akan pernah bergerak.
        if (autoScrollPosRef.current === null) {
          autoScrollPosRef.current = container.scrollLeft;
        }
        autoScrollPosRef.current += 0.35; // kecepatan pelan (naikkan = lebih cepat)
        container.scrollLeft = autoScrollPosRef.current;
      } else if (container) {
        // Saat pause/reset/manual: ikuti posisi terkini agar lanjut dari situ
        autoScrollPosRef.current = container.scrollLeft;
      }

      rafId = requestAnimationFrame(autoScrollStep);
    };

    rafId = requestAnimationFrame(autoScrollStep);
    return () => cancelAnimationFrame(rafId);
  }, []);

    // Pause / resume helper untuk auto-scroll (kursor & sentuhan)
  const pauseAutoScroll = () => {
    isAutoScrollPausedRef.current = true;
  };

  const resumeAutoScroll = () => {
    isAutoScrollPausedRef.current = false;
  };

  // Sentuhan HP: berhenti saat disentuh, lanjut lagi 1.2 detik setelah dilepas
  // (jeda memberi waktu momentum scroll selesai supaya tidak "melompat")
  const handleTouchStart = () => {
    isAutoScrollPausedRef.current = true;
  };

  const handleTouchEnd = () => {
    lastTouchRef.current = Date.now();
    isAutoScrollPausedRef.current = false;
  };

  // Compute live 20 big teams automatically from 2026/2027 standings
  const computedClubs = CLUB_DEFINITIONS.map((def) => deriveTeamStats(def, standingsByLeague));

  // Repeat for continuous infinite loop (6 copies ensures seamless wrap-around at any speed)
  const COPIES_COUNT = 6;
  const continuousClubsList = Array.from({ length: COPIES_COUNT }).flatMap(() => computedClubs);

  // Initialize scroll position in the center of the duplicated array
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const initScroll = () => {
      if (container.scrollWidth > 0) {
        const oneSetWidth = container.scrollWidth / COPIES_COUNT;
        container.scrollLeft = oneSetWidth * 2.5;
      }
    };

    // Small timeout to allow DOM layout
    const timer = setTimeout(initScroll, 50);
    return () => clearTimeout(timer);
  }, [computedClubs.length]);

  // Seamless Infinite Loop on scroll handler
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || isResettingRef.current) return;

    const totalWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const oneSetWidth = totalWidth / COPIES_COUNT;

    // If scrolled too far left (in the first copy), silently jump forward
    if (container.scrollLeft < oneSetWidth * 1) {
      isResettingRef.current = true;
      container.scrollLeft += oneSetWidth * 2;
      requestAnimationFrame(() => {
        isResettingRef.current = false;
      });
    }
    // If scrolled too far right (in the last copies), silently jump backward
    else if (container.scrollLeft > totalWidth - clientWidth - oneSetWidth * 1) {
      isResettingRef.current = true;
      container.scrollLeft -= oneSetWidth * 2;
      requestAnimationFrame(() => {
        isResettingRef.current = false;
      });
    }
  };

  // Smooth infinite loop scrolling for Left/Right buttons
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const oneSetWidth = container.scrollWidth / COPIES_COUNT;
      if (container.scrollLeft < oneSetWidth * 1.5) {
        container.scrollLeft += oneSetWidth * 2;
      }
      container.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const totalWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const oneSetWidth = totalWidth / COPIES_COUNT;
      if (container.scrollLeft > totalWidth - clientWidth - oneSetWidth * 1.5) {
        container.scrollLeft -= oneSetWidth * 2;
      }
      container.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Banner Container - VIDEO BACKGROUND (same size & layout) */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-sky-400/50 shadow-[0_12px_36px_rgba(2,132,199,0.35)] p-4 sm:p-5 md:p-6 mb-8 text-center text-white">

        {/* Video Background (autoplay, muted, loop) */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://ik.imagekit.io/i22mizicx/4f75d125ad2878ee51dd7e1e939a6212.mp4/ik-video.mp4?updatedAt=1788389016051"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />

        {/* Overlay tipis agar teks tetap jelas terbaca di atas video */}
        <div className="absolute inset-0 bg-sky-950/50 z-[1] pointer-events-none"></div>

        {/* Subtle radial background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_75%)] z-[2] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center justify-center space-y-3 sm:space-y-4">
          
          {/* Top Header Text */}
          <div className="space-y-1.5 flex flex-col items-center w-full">
            <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-widest text-black bg-white px-4 sm:px-5 py-0.5 sm:py-1 rounded-full shadow-md border border-white/60">
              LIGA TOP EROPA & UEFA CHAMPIONS LEAGUE
            </span>
            
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-hero-3d tracking-normal sm:tracking-wide text-white uppercase leading-none pt-0.5 w-full whitespace-nowrap select-text cursor-text">
              JALAK4D JADWAL & LIVE SCORE BOLA
            </h1>
          </div>

          {/* Middle: 20 Big Teams Logo Carousel (auto-run, pause on hover/touch) */}
          <div
            className="relative w-full flex items-center justify-center gap-2 sm:gap-3 my-0 py-0"
            onMouseEnter={pauseAutoScroll}
            onMouseLeave={resumeAutoScroll}
          >
            
            {/* Scroll Left Button */}
            <button
              onClick={handleScrollLeft}
              className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/90 border-2 border-white hover:border-sky-300 hover:bg-black text-white flex items-center justify-center flex-shrink-0 transition-all cursor-pointer shadow-xl hover:scale-110 active:scale-95 z-20"
              title="Geser Kiri"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>

            {/* Scrollable Logos Container */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar py-2 sm:py-3 px-2 sm:px-4 max-w-full select-none cursor-grab active:cursor-grabbing"
            >
              {continuousClubsList.map((club, idx) => (
                <div
                  key={`${club.id}-${idx}`}
                  onClick={() => setSelectedTeam(club)}
                  className="group relative flex flex-col items-center flex-shrink-0 cursor-pointer"
                  title={`Klik untuk melihat statistik ${club.name}`}
                >
                  {/* Transparent, Compact Logo Container */}
                  <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center p-1 transition-transform duration-300 ease-out group-hover:scale-115 active:scale-95">
                    <img
                      src={club.logoUrl}
                      alt={club.name}
                      draggable={false}
                      className="w-full h-full object-contain transition-all duration-300 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)] group-hover:drop-shadow-[0_0_4px_rgba(255,255,255,1)] group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] group-hover:brightness-110 group-hover:rotate-3 pointer-events-none"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_TEAM_LOGO;
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll Right Button */}
            <button
              onClick={handleScrollRight}
              className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/90 border-2 border-white hover:border-sky-300 hover:bg-black text-white flex items-center justify-center flex-shrink-0 transition-all cursor-pointer shadow-xl hover:scale-110 active:scale-95 z-20"
              title="Geser Kanan"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>

          </div>

          {/* Bottom CTA Button: KLIK DISINI */}
          <div className="pt-1 sm:pt-2 w-full flex justify-center">
            <a
              href="https://fuiyo.click/linkjalak"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold-glow inline-flex items-center justify-center px-10 sm:px-16 md:px-20 py-2.5 sm:py-3.5 rounded-full text-black font-black text-sm sm:text-base md:text-lg tracking-wider transition-all cursor-pointer"
            >
              Klik Disini
            </a>
          </div>

        </div>

      </div>

      {/* Team Season Stats Modal (Portal to body) */}
      {selectedTeam && (
        <TeamDetailModal
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </>
  );
};
