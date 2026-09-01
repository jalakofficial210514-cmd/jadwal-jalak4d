import React, { useState, useEffect } from 'react';
import { Match, MatchStats, HeadToHead } from '../types';
import { X, Calendar, MapPin, Award, Loader2, Wifi, Clock, History } from 'lucide-react';
import { getTeamLogoUrl, DEFAULT_TEAM_LOGO } from '../utils/teamLogos';
import { fetchESPNMatchSummary, formatGoalScorerText, parseESPNSeriesToH2H } from '../utils/espnMatches';

interface MatchDetailModalProps {
  match: Match;
  onClose: () => void;
}

const LEAGUE_KEY_MAP: Record<string, string> = {
  epl: 'eng.1',
  laliga: 'esp.1',
  seriea: 'ita.1',
  bundesliga: 'ger.1',
  ligue1: 'fra.1',
  ucl: 'uefa.champions',
};

// Icon Bola Soccer ⚽
const SoccerBallIcon = ({ className = "text-[13px] leading-none select-none flex-shrink-0 inline-block" }: { className?: string }) => (
  <span className={className} role="img" aria-label="goal">⚽</span>
);

// Icon Sepatu (Football Boot dengan aksen Biru Muda seperti di Gambar 2)
const SoccerBootIcon = ({ className = "w-3.5 h-3.5 flex-shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 14.5C3 13.2 4 12 5.5 11.5L11 9.5L13.5 6.8C14.3 6 15.6 6 16.4 6.8L17.5 7.9C18.3 8.7 18.3 10 17.5 10.8L15 12.8C16.2 13.5 17.5 14.2 19 14.8C20.2 15.3 20.2 17 18.8 17L4.5 17C3.7 17 3 16.2 3 14.5Z"
      fill="#FFFFFF"
      stroke="#0F172A"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M13.5 7.5L16.5 10.5" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M10 11L12.5 13" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
    <path d="M4.5 17L4.5 19.5M8.5 17L8.5 19.5M13.5 17L13.5 19.5M17.5 17L17.5 19.5" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, onClose }) => {
  const initialIsPlayed = match.status === 'LIVE' || match.status === 'FINISHED';

  const [currentStatus, setCurrentStatus] = useState<string>(match.status);
  const [matchMinute, setMatchMinute] = useState<string>(match.minute ? String(match.minute) : '');
  const [liveStats, setLiveStats] = useState<MatchStats | null>(initialIsPlayed ? (match.stats || null) : null);
  const [goalScorersHome, setGoalScorersHome] = useState<string[]>(initialIsPlayed ? (match.goalScorersHome || []) : []);
  const [goalScorersAway, setGoalScorersAway] = useState<string[]>(initialIsPlayed ? (match.goalScorersAway || []) : []);
  const [liveScores, setLiveScores] = useState<{ home: number; away: number } | null>(
    initialIsPlayed
      ? {
          home: match.homeScore ?? 0,
          away: match.awayScore ?? 0,
        }
      : null
  );
  const [venue, setVenue] = useState<string>(match.venue || '');
  const [h2hList, setH2hList] = useState<HeadToHead[]>(match.h2h || []);
  const [isLiveESPN, setIsLiveESPN] = useState<boolean>(Boolean(match.id?.startsWith('espn-')));
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const isPlayed = match.status === 'LIVE' || match.status === 'FINISHED';
    setCurrentStatus(match.status);
    setMatchMinute(match.minute ? String(match.minute) : '');
    setLiveStats(isPlayed ? (match.stats || null) : null);
    setGoalScorersHome(isPlayed ? (match.goalScorersHome || []) : []);
    setGoalScorersAway(isPlayed ? (match.goalScorersAway || []) : []);
    setH2hList(match.h2h || []);
    setLiveScores(
      isPlayed
        ? {
            home: match.homeScore ?? 0,
            away: match.awayScore ?? 0,
          }
        : null
    );
    setVenue(match.venue || '');

    // Fetch deep ESPN summary if it's an ESPN match
    const eventId = match.espnEventId || (match.id.startsWith('espn-') ? match.id.split('-')[2] : null);
    const leagueKey = LEAGUE_KEY_MAP[match.leagueId] || 'eng.1';

    if (eventId) {
      let isMounted = true;
      setLoading(true);
      fetchESPNMatchSummary(leagueKey, eventId)
        .then((summary) => {
          if (!isMounted || !summary) return;
          setIsLiveESPN(true);

          // Extract official ESPN real-time H2H
          const realH2H = parseESPNSeriesToH2H(summary, match.homeTeam.name, match.awayTeam.name);
          if (realH2H && realH2H.length > 0) {
            setH2hList(realH2H);
          }

          const comp = summary.header?.competitions?.[0];
          const state = comp?.status?.type?.state || 'pre';
          const isCompleted = comp?.status?.type?.completed === true || state === 'post';
          const isInProgress = state === 'in';
          const isMatchActiveOrDone = isCompleted || isInProgress;

          if (isMatchActiveOrDone) {
            if (isInProgress) {
              setCurrentStatus('LIVE');
              setMatchMinute(comp?.status?.displayClock ? `${comp.status.displayClock}'` : 'LIVE');
            } else {
              setCurrentStatus('FINISHED');
              setMatchMinute('FT');
            }

            if (comp) {
              const homeC = comp.competitors?.find((c: any) => c.homeAway === 'home');
              const awayC = comp.competitors?.find((c: any) => c.homeAway === 'away');
              if (homeC && awayC) {
                setLiveScores({
                  home: homeC.score !== undefined ? Number(homeC.score) : (match.homeScore ?? 0),
                  away: awayC.score !== undefined ? Number(awayC.score) : (match.awayScore ?? 0),
                });
              }
            }

            // Parse boxscore statistics
            const teams = summary.boxscore?.teams;
            if (Array.isArray(teams) && teams.length >= 2) {
              const homeT = teams[0];
              const awayT = teams[1];

              const getStatVal = (statsArr: any[], ...keys: string[]): number => {
                if (!Array.isArray(statsArr)) return 0;
                for (const k of keys) {
                  const lowerK = k.toLowerCase();
                  const found = statsArr.find(
                    (s: any) =>
                      s.name?.toLowerCase() === lowerK ||
                      s.label?.toLowerCase() === lowerK ||
                      s.abbreviation?.toLowerCase() === lowerK
                  );
                  if (found) {
                    const val = Number(found.displayValue ?? found.value ?? 0);
                    if (!isNaN(val)) return val;
                  }
                }
                return 0;
              };

              const homeStats = homeT.statistics || [];
              const awayStats = awayT.statistics || [];

              const hPoss = getStatVal(homeStats, 'possessionPct', 'possession');
              const aPoss =
                getStatVal(awayStats, 'possessionPct', 'possession') ||
                (hPoss > 0 ? Math.round((100 - hPoss) * 10) / 10 : 0);

              setLiveStats({
                possession: [hPoss, aPoss],
                shotsOnTarget: [
                  getStatVal(homeStats, 'shotsOnTarget', 'onGoal', 'shotsOnGoal'),
                  getStatVal(awayStats, 'shotsOnTarget', 'onGoal', 'shotsOnGoal'),
                ],
                totalShots: [
                  getStatVal(homeStats, 'totalShots', 'shots'),
                  getStatVal(awayStats, 'totalShots', 'shots'),
                ],
                corners: [
                  getStatVal(homeStats, 'wonCorners', 'corners', 'cornerKicks'),
                  getStatVal(awayStats, 'wonCorners', 'corners', 'cornerKicks'),
                ],
                fouls: [
                  getStatVal(homeStats, 'foulsCommitted', 'fouls'),
                  getStatVal(awayStats, 'foulsCommitted', 'fouls'),
                ],
                yellowCards: [
                  getStatVal(homeStats, 'yellowCards'),
                  getStatVal(awayStats, 'yellowCards'),
                ],
                redCards: [
                  getStatVal(homeStats, 'redCards'),
                  getStatVal(awayStats, 'redCards'),
                ],
                offsides: [
                  getStatVal(homeStats, 'offsides'),
                  getStatVal(awayStats, 'offsides'),
                ],
              });
            }

            // Parse key events / details for scorers with GBD support
            const eventsList = (Array.isArray(summary.keyEvents) && summary.keyEvents.length > 0)
              ? summary.keyEvents
              : (Array.isArray(summary.scoringPlays) && summary.scoringPlays.length > 0)
              ? summary.scoringPlays
              : (Array.isArray(comp?.details) && comp.details.length > 0)
              ? comp.details
              : [];

            if (eventsList.length > 0) {
              const hScorers: string[] = [];
              const aScorers: string[] = [];
              const homeId = comp?.competitors?.find((c: any) => c.homeAway === 'home')?.team?.id;

              eventsList.forEach((ke: any) => {
                if (ke.scoringPlay === true || ke.type?.text?.toLowerCase().includes('goal')) {
                  const player =
                    ke.athletesInvolved?.[0]?.displayName ||
                    ke.athletesInvolved?.[0]?.shortName ||
                    ke.participants?.[0]?.athlete?.displayName ||
                    ke.athlete?.displayName ||
                    ke.shortText ||
                    ke.text ||
                    'Pemain';
                  const assistPlayer =
                    ke.athletesInvolved?.[1]?.displayName ||
                    ke.athletesInvolved?.[1]?.shortName ||
                    ke.participants?.[1]?.athlete?.displayName ||
                    ke.participants?.[1]?.athlete?.shortName ||
                    '';
                  const clock = ke.clock?.displayValue || '';
                  const athleteTeamId =
                    ke.athletesInvolved?.[0]?.team?.id ||
                    ke.participants?.[0]?.athlete?.team?.id ||
                    ke.athlete?.team?.id;
                  const goalTeamId = ke.team?.id;

                  const item = formatGoalScorerText(player, clock, {
                    isOwnGoal: ke.ownGoal,
                    isPenalty: ke.penaltyKick,
                    typeText: ke.type?.text,
                    typeType: ke.type?.type,
                    typeId: String(ke.type?.id || ''),
                    text: ke.text,
                    shortText: ke.shortText,
                    athleteTeamId,
                    goalTeamId,
                    assist: assistPlayer,
                  });

                  if (String(ke.team?.id) === String(homeId)) {
                    hScorers.push(item);
                  } else {
                    aScorers.push(item);
                  }
                }
              });

              if (hScorers.length > 0) setGoalScorersHome(hScorers);
              if (aScorers.length > 0) setGoalScorersAway(aScorers);
            }
          } else {
            // Match is upcoming / not yet played
            setCurrentStatus('UPCOMING');
            setLiveScores(null);
            setLiveStats(null);
            setGoalScorersHome([]);
            setGoalScorersAway([]);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [match]);

  const isPlayed = currentStatus === 'LIVE' || currentStatus === 'FINISHED';

  const zeroStats: MatchStats = {
    fouls: [0, 0],
    yellowCards: [0, 0],
    redCards: [0, 0],
    offsides: [0, 0],
    corners: [0, 0],
    possession: [0, 0],
    totalShots: [0, 0],
    shotsOnTarget: [0, 0],
  };

  const stats = isPlayed ? (liveStats || match.stats || zeroStats) : zeroStats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* Clean Off-White / White Modal Card with Wide Glowing Effect */}
      <div className="relative w-full max-w-lg bg-white text-slate-900 p-6 rounded-[28px] modal-gold-glow space-y-5 my-8 max-h-[90vh] overflow-y-auto font-sans animate-scale-up">
        {/* Close Button - Styled after Login Button without glow */}
        <button
          onClick={onClose}
          className="btn-close-stat-x absolute top-5 right-5 w-8 h-8 rounded-full z-20 cursor-pointer"
          title="Tutup"
          aria-label="Tutup"
        >
          <X className="w-4 h-4 text-black stroke-[3]" />
        </button>

        {/* Modal Header Title */}
        <div className="text-center pt-1 flex flex-col items-center justify-center gap-1">
          <h2 className="text-amber-800 font-black text-sm sm:text-base uppercase tracking-wider">
            {match.leagueName || 'FASE GRUP - MATCHDAY 3'}
          </h2>
          {isLiveESPN && (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full btn-login-style text-[11px] font-black">
              <Wifi className="w-3.5 h-3.5 text-black animate-pulse" />
              LIVE UPDATE
            </span>
          )}
        </div>

        {/* Top Match Card Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-2 flex-1 text-center">
              <img
                src={getTeamLogoUrl(
                  match.homeTeam.logoUrl ||
                    (match.homeTeam.badgeBg?.startsWith('http')
                      ? match.homeTeam.badgeBg
                      : match.homeTeam.name),
                  match.homeTeam.shortName
                )}
                alt={match.homeTeam.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md transition-transform hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_TEAM_LOGO;
                }}
              />
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-800">{match.homeTeam.name}</h3>
            </div>

            {/* Score & Status Pill */}
            <div className="flex flex-col items-center justify-center px-2">
              {isPlayed ? (
                <>
                  <div className="font-black text-3xl sm:text-4xl text-slate-900 flex items-center gap-2 tracking-tight">
                    <span>{liveScores?.home ?? 0}</span>
                    <span className="text-amber-600 font-light text-2xl">:</span>
                    <span>{liveScores?.away ?? 0}</span>
                  </div>
                  <span
                    className={`mt-2 px-3 py-1 rounded-full text-white text-[11px] font-black tracking-wider uppercase shadow-2xs ${
                      currentStatus === 'LIVE'
                        ? 'bg-red-600 animate-pulse border border-white'
                        : 'bg-slate-800'
                    }`}
                  >
                    {currentStatus === 'LIVE' ? `LIVE ${matchMinute || "45'"}` : 'FULL TIME'}
                  </span>
                </>
              ) : (
                <>
                  <div className="font-black text-2xl sm:text-3xl text-amber-900 tracking-wider">
                    VS
                  </div>
                  <span className="mt-2 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase shadow-2xs bg-amber-500 text-slate-950">
                    BELUM DIMULAI
                  </span>
                </>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-2 flex-1 text-center">
              <img
                src={getTeamLogoUrl(
                  match.awayTeam.logoUrl ||
                    (match.awayTeam.badgeBg?.startsWith('http')
                      ? match.awayTeam.badgeBg
                      : match.awayTeam.name),
                  match.awayTeam.shortName
                )}
                alt={match.awayTeam.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md transition-transform hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_TEAM_LOGO;
                }}
              />
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-800">{match.awayTeam.name}</h3>
            </div>
          </div>

          {/* Goal Scorers Section */}
          <div className="pt-3 border-t border-slate-200">
            {isPlayed ? (
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase">PENCETAK GOL</span>
                  {goalScorersHome.length > 0 ? (
                    goalScorersHome.map((g, idx) => {
                      const isGBD = /\bGBD\b|\(GBD\)|\(OG\)/i.test(g);
                      const isPen = !isGBD && (/\(Pen\)|\(P\)/i.test(g) || /\bPen\b/i.test(g));
                      const astMatch = g.match(/(?:[\(•]\s*)?Ast:\s*([^\)]+)\)?/i) || g.match(/(?:[\(•]\s*)?Assist:\s*([^\)]+)\)?/i);
                      const assistName = astMatch ? astMatch[1].replace(/\)+$/, '').trim() : '';

                      const clean = g
                        .replace(/(?:[\(•]\s*)?Ast:\s*[^\)]+\)?/gi, '')
                        .replace(/(?:[\(•]\s*)?Assist:\s*[^\)]+\)?/gi, '')
                        .replace(/\s*\((?:GBD|OG|Pen|P)\)/gi, '')
                        .replace(/\s+\b(?:GBD|OG|Pen|P)\b/gi, '')
                        .replace(/\(\s*\)/g, '')
                        .replace(/\s*•\s*$/, '')
                        .trim();

                      return (
                        <div key={idx} className="flex flex-col gap-0.5 text-slate-700 font-bold">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <SoccerBallIcon className="w-3.5 h-3.5" />
                            <span>{clean}</span>
                            {isGBD && (
                              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black tracking-wider uppercase shadow-xs">
                                GBD
                              </span>
                            )}
                            {isPen && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black tracking-wider uppercase shadow-xs">
                                PEN
                              </span>
                            )}
                          </div>
                          {assistName && (
                            <div className="text-[10px] text-slate-500 font-medium pl-5 flex items-center gap-1.5">
                              <SoccerBootIcon className="w-3.5 h-3.5" />
                              <span className="text-slate-700 font-bold">{assistName}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-400 italic">-</div>
                  )}
                </div>

                <div className="space-y-1.5 text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase">PENCETAK GOL</span>
                  {goalScorersAway.length > 0 ? (
                    goalScorersAway.map((g, idx) => {
                      const isGBD = /\bGBD\b|\(GBD\)|\(OG\)/i.test(g);
                      const isPen = !isGBD && (/\(Pen\)|\(P\)/i.test(g) || /\bPen\b/i.test(g));
                      const astMatch = g.match(/(?:[\(•]\s*)?Ast:\s*([^\)]+)\)?/i) || g.match(/(?:[\(•]\s*)?Assist:\s*([^\)]+)\)?/i);
                      const assistName = astMatch ? astMatch[1].replace(/\)+$/, '').trim() : '';

                      const clean = g
                        .replace(/(?:[\(•]\s*)?Ast:\s*[^\)]+\)?/gi, '')
                        .replace(/(?:[\(•]\s*)?Assist:\s*[^\)]+\)?/gi, '')
                        .replace(/\s*\((?:GBD|OG|Pen|P)\)/gi, '')
                        .replace(/\s+\b(?:GBD|OG|Pen|P)\b/gi, '')
                        .replace(/\(\s*\)/g, '')
                        .replace(/\s*•\s*$/, '')
                        .trim();

                      return (
                        <div key={idx} className="flex flex-col items-end gap-0.5 text-slate-700 font-bold">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {isPen && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black tracking-wider uppercase shadow-xs">
                                PEN
                              </span>
                            )}
                            {isGBD && (
                              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black tracking-wider uppercase shadow-xs">
                                GBD
                              </span>
                            )}
                            <span>{clean}</span>
                            <SoccerBallIcon className="w-3.5 h-3.5" />
                          </div>
                          {assistName && (
                            <div className="text-[10px] text-slate-500 font-medium pr-5 flex items-center justify-end gap-1.5">
                              <span className="text-slate-700 font-bold">{assistName}</span>
                              <SoccerBootIcon className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-400 italic">-</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-[11px] text-slate-400 italic py-0.5">
                Pertandingan belum dimulai — Belum ada data pencetak gol
              </div>
            )}
          </div>
        </div>

        {/* Date & Venue Info */}
        <div className="space-y-1 text-center text-xs text-slate-600 font-semibold pt-1">
          <div className="flex items-center justify-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>
              {match.date || '31 Juli 2026'} - {match.time || '17:00 WIB'}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-amber-800 font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{venue || match.venue || 'Gelora Bung Karno Stadium, Jakarta'}</span>
          </div>
        </div>

        {/* Rekor Head-to-Head (H2H) */}
        {h2hList && h2hList.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-200 mt-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wide">
                <History className="w-4 h-4 text-amber-600" />
                Rekor Head-to-Head (H2H)
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                {h2hList.length} Pertemuan Terakhir
              </span>
            </div>

            <div className="space-y-1.5">
              {h2hList.slice(0, 5).map((h, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 w-24 flex-shrink-0">{h.date}</span>
                  <div className="flex items-center gap-1.5 flex-1 justify-center min-w-0 px-1 font-bold">
                    <span className={`truncate text-right flex-1 text-[11px] ${h.winner === 'home' ? 'text-amber-800 font-extrabold' : 'text-slate-700'}`}>
                      {h.homeTeam}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-900 text-yellow-400 rounded-md font-mono font-black border border-slate-700 text-[10px] flex-shrink-0">
                      {h.score}
                    </span>
                    <span className={`truncate text-left flex-1 text-[11px] ${h.winner === 'away' ? 'text-amber-800 font-extrabold' : 'text-slate-700'}`}>
                      {h.awayTeam}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr className="border-slate-200 my-2" />

        {/* Match Statistics Header */}
        <div className="text-center space-y-1">
          <h4 className="text-amber-800 font-black text-xs uppercase tracking-widest">
            MATCH STATISTICS
          </h4>
          {!isPlayed && (
            <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-900 text-[11px] font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span>Statistik Belum Diketahui (Pertandingan Belum Dimulai)</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
            <span className="text-xs font-bold text-slate-400">Sinkronisasi Data Pertandingan...</span>
          </div>
        ) : (
          <div className="space-y-2 text-xs font-bold pt-1">
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-black text-slate-900 text-sm w-10">{stats.fouls[0]}</span>
              <span className="text-slate-500 uppercase text-[11px] tracking-wider font-extrabold text-center">
                FOULS
              </span>
              <span className="font-black text-slate-900 text-sm w-10 text-right">{stats.fouls[1]}</span>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-black text-slate-900 text-sm w-10">{stats.yellowCards[0]}</span>
              <span className="text-slate-500 uppercase text-[11px] tracking-wider font-extrabold text-center">
                YELLOW CARDS
              </span>
              <span className="font-black text-slate-900 text-sm w-10 text-right">{stats.yellowCards[1]}</span>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-black text-slate-900 text-sm w-10">{stats.redCards[0]}</span>
              <span className="text-slate-500 uppercase text-[11px] tracking-wider font-extrabold text-center">
                RED CARDS
              </span>
              <span className="font-black text-slate-900 text-sm w-10 text-right">{stats.redCards[1]}</span>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-black text-slate-900 text-sm w-10">{stats.offsides?.[0] ?? 0}</span>
              <span className="text-slate-500 uppercase text-[11px] tracking-wider font-extrabold text-center">
                OFFSIDES
              </span>
              <span className="font-black text-slate-900 text-sm w-10 text-right">
                {stats.offsides?.[1] ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-black text-slate-900 text-sm w-10">{stats.corners[0]}</span>
              <span className="text-slate-500 uppercase text-[11px] tracking-wider font-extrabold text-center">
                CORNERS
              </span>
              <span className="font-black text-slate-900 text-sm w-10 text-right">{stats.corners[1]}</span>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-black text-slate-900 text-sm w-12">
                {stats.possession[0]}%
              </span>
              <span className="text-slate-500 uppercase text-[11px] tracking-wider font-extrabold text-center">
                BALL POSSESSION
              </span>
              <span className="font-black text-slate-900 text-sm w-12 text-right">
                {stats.possession[1]}%
              </span>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-black text-slate-900 text-sm w-10">{stats.totalShots[0]}</span>
              <span className="text-slate-500 uppercase text-[11px] tracking-wider font-extrabold text-center">
                TOTAL SHOTS
              </span>
              <span className="font-black text-slate-900 text-sm w-10 text-right">{stats.totalShots[1]}</span>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-black text-slate-900 text-sm w-10">{stats.shotsOnTarget[0]}</span>
              <span className="text-slate-500 uppercase text-[11px] tracking-wider font-extrabold text-center">
                SHOTS ON TARGET
              </span>
              <span className="font-black text-slate-900 text-sm w-10 text-right">
                {stats.shotsOnTarget[1]}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
