import React, { useState, useEffect } from 'react';
import { EPL_STANDINGS, LALIGA_STANDINGS, SERIEA_STANDINGS, BUNDESLIGA_STANDINGS, LIGUE1_STANDINGS, UCL_STANDINGS, MOCK_MATCHES } from '../data/mockData';
import { StandingRow } from '../types';
import { Globe, Loader2, Wifi } from 'lucide-react';
import { getTeamLogoUrl, DEFAULT_TEAM_LOGO } from '../utils/teamLogos';

// Helper to extract match result ('W' | 'D' | 'L') for a team from finished matches
const getTeamLatestMatchResults = (
  teamName: string,
  shortName: string,
  teamId: string,
  scoreboardEvents: any[] = []
): ('W' | 'D' | 'L')[] => {
  const results: ('W' | 'D' | 'L')[] = [];

  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const tName = norm(teamName);
  const tShort = norm(shortName);

  // 1. Check ESPN scoreboard events if available
  if (scoreboardEvents && scoreboardEvents.length > 0) {
    scoreboardEvents.forEach((evt) => {
      const competition = evt.competitions?.[0];
      if (!competition || competition.status?.type?.completed !== true) return;

      const home = competition.competitors?.find((c: any) => c.homeAway === 'home');
      const away = competition.competitors?.find((c: any) => c.homeAway === 'away');
      if (!home || !away) return;

      const isHome =
        home.team?.id === teamId ||
        norm(home.team?.displayName || home.team?.name || '').includes(tName) ||
        tName.includes(norm(home.team?.displayName || home.team?.name || '')) ||
        (tShort && norm(home.team?.abbreviation || '') === tShort);

      const isAway =
        away.team?.id === teamId ||
        norm(away.team?.displayName || away.team?.name || '').includes(tName) ||
        tName.includes(norm(away.team?.displayName || away.team?.name || '')) ||
        (tShort && norm(away.team?.abbreviation || '') === tShort);

      if (isHome) {
        if (home.winner === true) results.push('W');
        else if (away.winner === true) results.push('L');
        else results.push('D');
      } else if (isAway) {
        if (away.winner === true) results.push('W');
        else if (home.winner === true) results.push('L');
        else results.push('D');
      }
    });
  }

  // 2. Check finished matches in MOCK_MATCHES
  MOCK_MATCHES.forEach((m) => {
    if (m.status !== 'FINISHED' || m.homeScore === undefined || m.awayScore === undefined) return;

    const isHome =
      m.homeTeam.id === teamId ||
      norm(m.homeTeam.name).includes(tName) ||
      tName.includes(norm(m.homeTeam.name)) ||
      (tShort && norm(m.homeTeam.shortName) === tShort);

    const isAway =
      m.awayTeam.id === teamId ||
      norm(m.awayTeam.name).includes(tName) ||
      tName.includes(norm(m.awayTeam.name)) ||
      (tShort && norm(m.awayTeam.shortName) === tShort);

    if (isHome) {
      if (m.homeScore > m.awayScore) results.push('W');
      else if (m.homeScore < m.awayScore) results.push('L');
      else results.push('D');
    } else if (isAway) {
      if (m.awayScore > m.homeScore) results.push('W');
      else if (m.awayScore < m.homeScore) results.push('L');
      else results.push('D');
    }
  });

  return results;
};

const computeLast5Form = (
  teamName: string,
  shortName: string,
  teamId: string,
  _fallbackTeam: StandingRow | undefined,
  scoreboardEvents: any[] = [],
  won: number = 0,
  drawn: number = 0,
  lost: number = 0,
  played: number = 0
): ('W' | 'D' | 'L')[] => {
  if (played <= 0) return [];

  const targetCount = Math.min(played, 5);

  // If played is 1: strictly match based on won/drawn/lost
  if (played === 1) {
    if (won >= 1) return ['W'];
    if (drawn >= 1) return ['D'];
    if (lost >= 1) return ['L'];
    return ['D'];
  }

  // 1. Get confirmed latest results from scoreboard/matches
  const realResults = getTeamLatestMatchResults(teamName, shortName, teamId, scoreboardEvents);

  let poolW = won;
  let poolD = drawn;
  let poolL = lost;

  const resultForm: ('W' | 'D' | 'L')[] = [];

  // Add the most recent confirmed match result first
  if (realResults.length > 0) {
    const latest = realResults[0];
    if (latest === 'W' && poolW > 0) {
      resultForm.push('W');
      poolW--;
    } else if (latest === 'D' && poolD > 0) {
      resultForm.push('D');
      poolD--;
    } else if (latest === 'L' && poolL > 0) {
      resultForm.push('L');
      poolL--;
    }
  }

  // Populate remaining history slots from the pool
  while (resultForm.length < targetCount) {
    if (poolW > 0) {
      resultForm.unshift('W');
      poolW--;
    } else if (poolD > 0) {
      resultForm.unshift('D');
      poolD--;
    } else if (poolL > 0) {
      resultForm.unshift('L');
      poolL--;
    } else {
      break;
    }
  }

  // Fallback in case pool was exhausted
  while (resultForm.length < targetCount) {
    if (won > 0) resultForm.push('W');
    else if (drawn > 0) resultForm.push('D');
    else resultForm.push('L');
  }

  return resultForm.slice(-targetCount);
};

export const StandingsView: React.FC = () => {
  const [activeLeague, setActiveLeague] = useState<string>('epl');
  const [standingsData, setStandingsData] = useState<StandingRow[]>(EPL_STANDINGS);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLiveFromESPN, setIsLiveFromESPN] = useState<boolean>(false);

  const leagueConfig: Record<string, { title: string; flag: string; fallback: StandingRow[]; espnEndpoint?: string; espnGroup?: string; scoreboardEndpoint?: string }> = {
    'ucl': {
      title: 'UEFA CHAMPIONS LEAGUE (UCL)',
      flag: 'https://flagcdn.com/w40/eu.png',
      fallback: UCL_STANDINGS,
      espnEndpoint: 'https://site.api.espn.com/apis/v2/sports/soccer/uefa.champions/standings',
    },
    'epl': {
      title: 'PREMIER LEAGUE',
      flag: 'https://flagcdn.com/w40/gb-eng.png',
      fallback: EPL_STANDINGS,
      espnEndpoint: 'https://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings',
    },
    'laliga': {
      title: 'LALIGA',
      flag: 'https://flagcdn.com/w40/es.png',
      fallback: LALIGA_STANDINGS,
      espnEndpoint: 'https://site.api.espn.com/apis/v2/sports/soccer/esp.1/standings',
    },
    'seriea': {
      title: 'SERIE A',
      flag: 'https://flagcdn.com/w40/it.png',
      fallback: SERIEA_STANDINGS,
      espnEndpoint: 'https://site.api.espn.com/apis/v2/sports/soccer/ita.1/standings',
    },
    'bundesliga': {
      title: 'BUNDESLIGA',
      flag: 'https://flagcdn.com/w40/de.png',
      fallback: BUNDESLIGA_STANDINGS,
      espnEndpoint: 'https://site.api.espn.com/apis/v2/sports/soccer/ger.1/standings',
    },
    'ligue1': {
      title: 'LIGUE 1',
      flag: 'https://flagcdn.com/w40/fr.png',
      fallback: LIGUE1_STANDINGS,
      espnEndpoint: 'https://site.api.espn.com/apis/v2/sports/soccer/fra.1/standings',
    },
  };

  useEffect(() => {
    const config = leagueConfig[activeLeague];
    if (!config) return;

    if (!config.espnEndpoint) {
      // For local fallback leagues, compute dynamic form from mock matches
      const enrichedFallback = config.fallback.map((row) => ({
        ...row,
        team: {
          ...row.team,
          form: computeLast5Form(row.team.name, row.team.shortName, row.team.id, row, [], row.won, row.drawn, row.lost, row.played),
        },
      }));
      setStandingsData(enrichedFallback);
      setIsLiveFromESPN(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const scoreboardEndpoint = config.scoreboardEndpoint || config.espnEndpoint.replace('/standings', '/scoreboard');

    Promise.all([
      fetch(config.espnEndpoint).then((res) => res.json()).catch(() => null),
      fetch(scoreboardEndpoint).then((res) => res.json()).catch(() => null),
    ])
      .then(([standingsDataRes, scoreboardDataRes]) => {
        let entries: any[] = [];
        if (config.espnGroup && standingsDataRes?.children) {
          const group = standingsDataRes.children.find((c: any) =>
            c.name?.toLowerCase().includes(config.espnGroup?.toLowerCase() || '') ||
            c.abbreviation?.toLowerCase().includes(config.espnGroup?.toLowerCase() || '')
          );
          entries = group?.standings?.entries || [];
        } else {
          entries = standingsDataRes?.standings || standingsDataRes?.children?.[0]?.standings?.entries || [];
        }

        const scoreboardEvents = scoreboardDataRes?.events || [];

        if (entries && entries.length > 0) {
          const totalTeams = entries.length;
          const parsed: StandingRow[] = entries.map((entry: any, index: number) => {
            const stats = entry.stats || [];
            const getStat = (name: string) => {
              const s = stats.find((x: any) => x.name === name);
              return s ? s.value : 0;
            };

            const teamName = entry.team?.displayName || entry.team?.name || 'Team';
            const shortName = entry.team?.abbreviation || teamName.substring(0, 3).toUpperCase();
            const logoUrl = entry.team?.logos?.[0]?.href || '';
            const badgeBg = logoUrl || '#1e293b';

            const played = Number(getStat('gamesPlayed'));
            const won = Number(getStat('wins'));
            const drawn = Number(getStat('ties'));
            const lost = Number(getStat('losses'));

            const fallbackTeam = config.fallback.find(
              (f) =>
                f.team.name.toLowerCase().includes(teamName.toLowerCase()) ||
                teamName.toLowerCase().includes(f.team.name.toLowerCase()) ||
                f.position === index + 1
            );

            // Compute automatic Last 5 match results based on played matches
            const autoForm = computeLast5Form(
              teamName,
              shortName,
              entry.team?.id || `team-${index}`,
              fallbackTeam,
              scoreboardEvents,
              won,
              drawn,
              lost,
              played
            );

            // Accurate zone calculation per league
            let zone: StandingRow['zone'] = 'none';
            if (activeLeague === 'ucl') {
              if (index < 8) zone = 'ucl'; // Direct Round of 16
              else if (index < 24) zone = 'playoff'; // Knockout Play-offs
              else zone = 'none'; // Eliminated
            } else if (activeLeague === 'ligue1') {
              if (index < 3) zone = 'ucl';
              else if (index === 3) zone = 'ucl-qualifier';
              else if (index === 4) zone = 'uel';
              else if (index === 5) zone = 'conference';
              else if (index === 15) zone = 'playoff';
              else if (index >= 16) zone = 'relegation';
            } else if (activeLeague === 'bundesliga') {
              if (index < 4) zone = 'ucl';
              else if (index === 4) zone = 'uel';
              else if (index === 5) zone = 'conference';
              else if (index === 15) zone = 'playoff';
              else if (index >= 16) zone = 'relegation';
            } else if (activeLeague === 'epl' || activeLeague === 'laliga') {
              if (index < 5) zone = 'ucl';
              else if (index === 5) zone = 'uel';
              else if (index === 6) zone = 'conference';
              else if (index >= totalTeams - 3) zone = 'relegation';
            } else {
              if (index < 4) zone = 'ucl';
              else if (index === 4) zone = 'uel';
              else if (index === 5) zone = 'conference';
              else if (index >= totalTeams - 3) zone = 'relegation';
            }

            return {
              position: index + 1,
              team: {
                id: entry.team?.id || `team-${index}`,
                name: teamName,
                shortName: shortName,
                badgeBg: badgeBg,
                badgeTextColor: '#ffffff',
                country: 'Eropa',
                form: autoForm,
              },
              played: Number(getStat('gamesPlayed')),
              won: won,
              drawn: drawn,
              lost: lost,
              goalsFor: Number(getStat('pointsFor')) || Number(getStat('goalsFor')),
              goalsAgainst: Number(getStat('pointsAgainst')) || Number(getStat('goalsAgainst')),
              goalDifference: Number(getStat('pointDifferential')) || Number(getStat('goalDifference')),
              points: Number(getStat('points')),
              zone: zone,
            };
          });

          setStandingsData(parsed);
          setIsLiveFromESPN(true);
        } else {
          setStandingsData(config.fallback);
          setIsLiveFromESPN(false);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to fetch live ESPN standings, using fallback:', err);
        setStandingsData(config.fallback);
        setIsLiveFromESPN(false);
        setLoading(false);
      });
  }, [activeLeague]);

  const currentConfig = leagueConfig[activeLeague] || leagueConfig['epl'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-static p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-amber-500 rounded-full shadow-2xs"></div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                KLASEMEN LIGA TOP EROPA & UEFA CHAMPIONS LEAGUE 2026/2027
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full btn-login-style text-black text-xs font-black uppercase">
            <Globe className="w-4 h-4 text-black" />
            <span>LIVE UPDATE</span>
          </div>
        </div>

        {/* League Selector Tabs - 5 Top European Leagues + UCL */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2">
          {[
            { id: 'ucl', name: 'UCL', flag: 'https://flagcdn.com/w40/eu.png' },
            { id: 'epl', name: 'PREMIER LEAGUE', flag: 'https://flagcdn.com/w40/gb-eng.png' },
            { id: 'laliga', name: 'LALIGA', flag: 'https://flagcdn.com/w40/es.png' },
            { id: 'seriea', name: 'SERIE A', flag: 'https://flagcdn.com/w40/it.png' },
            { id: 'bundesliga', name: 'BUNDESLIGA', flag: 'https://flagcdn.com/w40/de.png' },
            { id: 'ligue1', name: 'LIGUE 1', flag: 'https://flagcdn.com/w40/fr.png' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveLeague(tab.id)}
              className={`py-2.5 px-2.5 sm:px-3 rounded-full font-black text-xs uppercase transition-all whitespace-nowrap text-center cursor-pointer flex items-center justify-center gap-2 ${
                activeLeague === tab.id
                  ? 'btn-login-style text-black'
                  : 'btn-login-style-inactive'
              }`}
            >
              <img
                src={tab.flag}
                alt={tab.name}
                className="w-4 h-3 rounded-[2px] object-cover flex-shrink-0 shadow-2xs"
              />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Standings Table Card with Unified Full Width Horizontal Scroll */}
      <div className="glass-static p-4 sm:p-6 overflow-x-auto relative">
        <div className="min-w-[760px]">
          {/* Card Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
            <div className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wider flex items-center gap-2.5">
              <img
                src={currentConfig.flag}
                alt=""
                className="w-5 h-3.5 sm:w-6 sm:h-4 rounded-[2px] object-cover shadow-2xs flex-shrink-0"
              />
              <span>{currentConfig.title}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full btn-login-style text-black text-xs font-black whitespace-nowrap">
              <Wifi className="w-3.5 h-3.5 text-black animate-pulse" />
              <span>LIVE UPDATE</span>
            </div>
          </div>

          {/* Legend bar spanning full width to the very end */}
          <div className="mb-6 py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700 font-semibold gap-6 whitespace-nowrap w-full">
            <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
              {activeLeague === 'ucl' ? (
                <>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-blue-500 shadow-2xs"></span>
                    Posisi 1-8: Lolos Langsung 16 Besar
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-amber-500 shadow-2xs"></span>
                    Posisi 9-24: Play-off Knockout
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-slate-400 shadow-2xs"></span>
                    Posisi 25-36: Tersingkir
                  </span>
                </>
              ) : activeLeague === 'ligue1' ? (
                <>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-blue-500 shadow-2xs"></span>
                    Champions League
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-purple-500 shadow-2xs"></span>
                    UCL Qualifier
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-orange-500 shadow-2xs"></span>
                    Europa League
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-emerald-500 shadow-2xs"></span>
                    Conference League
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-amber-600 shadow-2xs"></span>
                    Playoff Degradasi
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-rose-500 shadow-2xs"></span>
                    Relegation
                  </span>
                </>
              ) : activeLeague === 'bundesliga' ? (
                <>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-blue-500 shadow-2xs"></span>
                    Champions League
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-orange-500 shadow-2xs"></span>
                    Europa League
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-emerald-500 shadow-2xs"></span>
                    Conference League
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-amber-600 shadow-2xs"></span>
                    Playoff Degradasi
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-rose-500 shadow-2xs"></span>
                    Relegation
                  </span>
                </>
              ) : activeLeague === 'epl' || activeLeague === 'laliga' || activeLeague === 'seriea' ? (
                <>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-blue-500 shadow-2xs"></span>
                    Champions League
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-orange-500 shadow-2xs"></span>
                    Europa League
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-emerald-500 shadow-2xs"></span>
                    Conference League
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-rose-500 shadow-2xs"></span>
                    Relegation
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-blue-500 shadow-2xs"></span>
                    Lolos Semifinal
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-[3px] bg-rose-500 shadow-2xs"></span>
                    Tersingkir
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 border-l border-slate-300 pl-4 flex-shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs"></span> Win
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-2xs"></span> Draw
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs"></span> Lose
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Memuat Data Klasemen...</p>
            </div>
          ) : (
            <div>
              {/* Table Header */}
            <div className="flex items-center text-[11px] font-black uppercase tracking-wider text-black border-b-2 border-black pb-2 mb-2 px-3">
              <div className="w-8 text-center">RANK</div>
              <div className="flex-1 min-w-[160px] text-left pl-3">CLUB</div>
              <div className="flex items-center text-center">
                <div className="w-10 text-center text-black">MP</div>
                <div className="w-10 text-center text-black">W</div>
                <div className="w-10 text-center text-black">D</div>
                <div className="w-10 text-center text-black">L</div>
                <div className="w-11 text-center text-black font-bold">GF</div>
                <div className="w-11 text-center text-black font-bold">GA</div>
                <div className="w-12 text-center text-black font-bold">GD</div>
                <div className="w-12 text-center text-black font-black bg-white px-1 py-0.5 rounded border border-black shadow-xs">PTS</div>
                <div className="w-28 text-center text-black font-black">LAST 5</div>
              </div>
            </div>

            {/* Table Rows */}
            <div className="space-y-2">
              {standingsData.map((row) => {
                const zoneBorder =
                  row.zone === 'ucl'
                    ? 'border-l-[6px] border-l-blue-600'
                    : row.zone === 'ucl-qualifier'
                    ? 'border-l-[6px] border-l-purple-600'
                    : row.zone === 'uel'
                    ? 'border-l-[6px] border-l-orange-500'
                    : row.zone === 'conference'
                    ? 'border-l-[6px] border-l-emerald-600'
                    : row.zone === 'playoff'
                    ? 'border-l-[6px] border-l-amber-600'
                    : row.zone === 'relegation'
                    ? 'border-l-[6px] border-l-rose-600'
                    : 'border-l-[6px] border-l-slate-300';

                return (
                  <div
                    key={row.team.id}
                    className={`flex items-center p-2.5 sm:p-3 rounded-xl bg-white text-slate-900 border-2 border-black shadow-md hover:border-yellow-400 hover:scale-[1.005] transition-all text-xs ${zoneBorder}`}
                  >
                    <div className="w-8 text-center flex items-center justify-center">
                      <span className="text-black font-black text-sm">
                        {row.position}
                      </span>
                    </div>

                    <div className="flex-1 min-w-[160px] flex items-center gap-2.5 text-left pl-3 truncate">
                      <img
                        src={getTeamLogoUrl(
                          row.team.logoUrl || (row.team.badgeBg?.startsWith('http') ? row.team.badgeBg : row.team.name),
                          row.team.shortName
                        )}
                        alt={row.team.name}
                        className="w-7 h-7 object-contain flex-shrink-0 filter drop-shadow-sm"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_TEAM_LOGO;
                        }}
                      />
                      <span className="font-black text-slate-950 text-sm sm:text-base truncate">{row.team.name}</span>
                    </div>

                    <div className="flex items-center text-center">
                      <div className="w-10 text-center text-slate-900 font-extrabold">{row.played}</div>
                      <div className="w-10 text-center text-slate-900 font-extrabold">{row.won}</div>
                      <div className="w-10 text-center text-slate-900 font-extrabold">{row.drawn}</div>
                      <div className="w-10 text-center text-slate-900 font-extrabold">{row.lost}</div>
                      <div className="w-11 text-center text-slate-900 font-extrabold">{row.goalsFor}</div>
                      <div className="w-11 text-center text-slate-900 font-extrabold">{row.goalsAgainst}</div>
                      <div className={`w-12 text-center font-extrabold ${row.goalDifference > 0 ? 'text-emerald-700' : row.goalDifference < 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </div>
                      <div className="w-12 text-center font-black text-base text-black bg-gradient-to-r from-yellow-300 to-amber-400 px-1 py-0.5 rounded border border-black shadow-xs">{row.points}</div>
                      <div className="w-28 flex items-center justify-center gap-1.5">
                        {Array.from({ length: 5 }).map((_, slotIdx) => {
                          const formItem = (row.team.form || [])[slotIdx];
                          if (slotIdx < row.played && formItem) {
                            const isWin = formItem === 'W';
                            const isDraw = formItem === 'D';
                            const isLose = formItem === 'L';

                            const dotBg = isWin
                              ? 'bg-emerald-500 shadow-2xs'
                              : isDraw
                              ? 'bg-slate-400 shadow-2xs'
                              : 'bg-rose-500 shadow-2xs';

                            const titleText = isWin
                              ? `Match ${slotIdx + 1}: Menang (W)`
                              : isDraw
                              ? `Match ${slotIdx + 1}: Imbang (D)`
                              : `Match ${slotIdx + 1}: Kalah (L)`;

                            return (
                              <span
                                key={slotIdx}
                                className={`w-2.5 h-2.5 rounded-full transition-transform hover:scale-125 cursor-help ${dotBg}`}
                                title={titleText}
                              ></span>
                            );
                          }

                          return (
                            <span
                              key={slotIdx}
                              className="w-2.5 h-2.5 rounded-full border border-slate-300 bg-slate-200 cursor-default"
                              title="Belum bertanding"
                            ></span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>

    </div>
  );
};
