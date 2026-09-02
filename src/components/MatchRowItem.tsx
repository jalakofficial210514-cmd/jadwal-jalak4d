import React, { useState, useEffect } from 'react';
import { Match } from '../types';
import { Clock, Activity, RotateCcw, Check, Sparkles } from 'lucide-react';
import { getTeamLogoUrl, DEFAULT_TEAM_LOGO } from '../utils/teamLogos';

interface MatchRowItemProps {
  match: Match;
  onSelectMatch: (match: Match) => void;
}

export const MatchRowItem: React.FC<MatchRowItemProps> = ({ match, onSelectMatch }) => {
  const [homeGuess, setHomeGuess] = useState<string>('');
  const [awayGuess, setAwayGuess] = useState<string>('');
  const [isGuessed, setIsGuessed] = useState<boolean>(false);

  // Load saved guess from localStorage
  useEffect(() => {
    try {
      const savedGuesses = localStorage.getItem('wifi4d_match_guesses');
      if (savedGuesses) {
        const parsed = JSON.parse(savedGuesses);
        if (parsed[match.id]) {
          setHomeGuess(parsed[match.id].home);
          setAwayGuess(parsed[match.id].away);
          setIsGuessed(true);
        }
      }
    } catch {
      // ignore
    }
  }, [match.id]);

  const handleTebak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (homeGuess.trim() === '' || awayGuess.trim() === '') {
      return;
    }
    setIsGuessed(true);
    try {
      const savedGuesses = localStorage.getItem('wifi4d_match_guesses');
      const parsed = savedGuesses ? JSON.parse(savedGuesses) : {};
      parsed[match.id] = { home: homeGuess.trim(), away: awayGuess.trim() };
      localStorage.setItem('wifi4d_match_guesses', JSON.stringify(parsed));
    } catch {
      // ignore
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHomeGuess('');
    setAwayGuess('');
    setIsGuessed(false);
    try {
      const savedGuesses = localStorage.getItem('wifi4d_match_guesses');
      if (savedGuesses) {
        const parsed = JSON.parse(savedGuesses);
        delete parsed[match.id];
        localStorage.setItem('wifi4d_match_guesses', JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
  };

  const homeLogo = getTeamLogoUrl(
    match.homeTeam.logoUrl || (match.homeTeam.badgeBg?.startsWith('http') ? match.homeTeam.badgeBg : match.homeTeam.name),
    match.homeTeam.shortName
  );

  const awayLogo = getTeamLogoUrl(
    match.awayTeam.logoUrl || (match.awayTeam.badgeBg?.startsWith('http') ? match.awayTeam.badgeBg : match.awayTeam.name),
    match.awayTeam.shortName
  );

  return (
    <div
      onClick={() => onSelectMatch(match)}
      className="group relative rounded-2xl bg-black border-2 border-white/90 p-4 sm:p-5 shadow-[0_6px_20px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:border-yellow-400 hover:shadow-[0_8px_28px_rgba(234,179,8,0.7)] active:translate-y-0 active:scale-[0.99] flex flex-col justify-between gap-4 overflow-hidden"
    >
      {/* Background ambient shine on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      {/* Top Meta Bar: League & Live Match Status / Time */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-zinc-800 pb-3 text-xs">
        <div className="flex items-center gap-2">
          <img
            src={match.leagueFlag}
            alt={match.leagueName}
            className="w-4 h-3 rounded-[2px] object-cover flex-shrink-0 shadow-2xs border border-zinc-700"
          />
          <span className="font-black text-yellow-400 uppercase tracking-wider text-[11px] sm:text-xs truncate">
            {match.leagueName}
          </span>
        </div>

        {/* Top-Right: Live Status Badge + Date & Time Info */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {match.status === 'LIVE' ? (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-white bg-rose-600 px-3 py-0.5 rounded-full shadow-2xs animate-pulse whitespace-nowrap border border-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              LIVE {match.minute ? `${match.minute}'` : ''}
            </span>
          ) : match.status === 'FINISHED' ? (
            <span className="inline-block text-[11px] sm:text-xs font-black text-black bg-white px-3 py-0.5 rounded-full uppercase whitespace-nowrap border-2 border-yellow-400 shadow-2xs tracking-wide">
              FT
            </span>
          ) : null}

          <span className="btn-login-style text-[11px] sm:text-xs font-black text-black px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs whitespace-nowrap flex-shrink-0">
            <Clock className="w-3.5 h-3.5 text-black flex-shrink-0 stroke-[2.5]" />
            {match.date ? `${match.date} • ` : ''}{match.time}
          </span>
        </div>
      </div>

      {/* Middle Main Section: Home Team - Score/VS - Away Team */}
      <div className="relative z-10 grid grid-cols-12 items-center gap-2 sm:gap-4 py-1">
        
        {/* Home Team (Cols 1-5): Direct Logo (No Box Container), Name next to it */}
        <div className="col-span-5 flex items-center justify-start gap-2.5 sm:gap-4 min-w-0">
          <img
            src={homeLogo}
            alt={match.homeTeam.name}
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain flex-shrink-0 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-[0_4px_8px_rgba(255,255,255,0.2)]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_TEAM_LOGO;
            }}
          />
          <span className="font-black text-xs sm:text-base text-white group-hover:text-yellow-400 transition-colors truncate text-left">
            {match.homeTeam.name}
          </span>
        </div>

        {/* Center Score / VS Box (Cols 6-7) */}
        <div className="col-span-2 flex flex-col items-center justify-center">
          {match.status === 'LIVE' || match.status === 'FINISHED' ? (
            <div className="px-2.5 sm:px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-400 text-black rounded-xl border-2 border-white shadow-md flex items-center justify-center gap-1.5">
              <span className="font-black text-base sm:text-2xl text-black">
                {match.homeScore}
              </span>
              <span className="text-black font-extrabold text-xs sm:text-sm">-</span>
              <span className="font-black text-base sm:text-2xl text-black">
                {match.awayScore}
              </span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-400 text-black rounded-xl border-2 border-white shadow-md flex items-center justify-center">
              <span className="font-black text-xs sm:text-sm text-black tracking-wider">
                VS
              </span>
            </div>
          )}
        </div>

        {/* Away Team (Cols 8-12): Name next to logo, Direct Logo */}
        <div className="col-span-5 flex items-center justify-end gap-2.5 sm:gap-4 min-w-0">
          <span className="font-black text-xs sm:text-base text-white group-hover:text-yellow-400 transition-colors truncate text-right">
            {match.awayTeam.name}
          </span>
          <img
            src={awayLogo}
            alt={match.awayTeam.name}
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain flex-shrink-0 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-[0_4px_8px_rgba(255,255,255,0.2)]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_TEAM_LOGO;
            }}
          />
        </div>

      </div>

      {/* Bottom Bar: Handicap Analysis & Tebak Skor Section */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800 text-xs">
        {/* Left: Handicap Analysis */}
        <div className="flex items-center gap-1.5 text-zinc-300 text-[11px] font-bold">
          <Activity className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
          <span>Analisis Handicap:</span>
          <span className="text-white font-extrabold bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-700">
            {match.handicap || '0 : 0'}
          </span>
        </div>

        {/* Right: Tebak Skor Input Boxes & Actions */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!isGuessed ? (
            /* Input Mode */
            <div className="flex items-center gap-2">
              {/* Home Score Input */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                placeholder="-"
                value={homeGuess}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setHomeGuess(val);
                }}
                className="w-8 h-8 text-center bg-zinc-900 text-white placeholder-zinc-500 font-black rounded-lg border border-zinc-700 focus:border-yellow-400 focus:bg-black focus:outline-none text-xs shadow-2xs"
                title="Tebakan Skor Tuan Rumah"
              />

              <span className="text-zinc-500 font-bold text-xs">-</span>

              {/* Away Score Input */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                placeholder="-"
                value={awayGuess}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setAwayGuess(val);
                }}
                className="w-8 h-8 text-center bg-zinc-900 text-white placeholder-zinc-500 font-black rounded-lg border border-zinc-700 focus:border-yellow-400 focus:bg-black focus:outline-none text-xs shadow-2xs"
                title="Tebakan Skor Tamu"
              />

              {/* TEBAK Button */}
              <button
                type="button"
                onClick={handleTebak}
                disabled={homeGuess.trim() === '' || awayGuess.trim() === ''}
                className={`px-3.5 py-1.5 rounded-xl border font-black text-[11px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  homeGuess.trim() !== '' && awayGuess.trim() !== ''
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-400 border-white text-black shadow-xs hover:brightness-105 active:scale-95'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <span>TEBAK</span>
              </button>
            </div>
          ) : (
            /* Guessed Mode: Shows TEBAKAN ANDA & RESET Button */
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-yellow-400 text-yellow-400 text-[11px] font-black shadow-2xs">
                <Check className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                <span>TEBAKAN ANDA:</span>
                <span className="text-black bg-white px-2 py-0.5 rounded-md border border-yellow-400 text-xs font-black">
                  {homeGuess} - {awayGuess}
                </span>
              </div>

              {/* RESET Button */}
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-600 text-white font-black text-[11px] uppercase tracking-wider shadow-2xs hover:bg-zinc-700 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                title="Reset Tebakan Skor"
              >
                <RotateCcw className="w-3 h-3 text-white" />
                <span>RESET</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



