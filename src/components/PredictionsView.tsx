import React, { useState } from 'react';
import { Match } from '../types';
import { Target, Sparkles, ChevronRight, History, Shield, TrendingUp, HelpCircle } from 'lucide-react';
import { getTeamLogoUrl, DEFAULT_TEAM_LOGO } from '../utils/teamLogos';

interface PredictionsViewProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({ matches, onSelectMatch }) => {
  const [selectedLeague, setSelectedLeague] = useState<string>('all');

  const matchesWithPredictions = matches.filter(
    (m) => m.prediction && (selectedLeague === 'all' || m.leagueId === selectedLeague)
  );

  return (
    <div id="predictions-view" className="space-y-6">
      
      {/* Hero Header for Predictions */}
      <div id="predictions-hero" className="glass-static p-6 sm:p-8 space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-sky-950/60 text-sky-300 border border-sky-400/50 shadow-2xs">
            <Target className="w-5 h-5" />
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-white bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-400/50">
            JALAK4D PREDIKSI UPDATE
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Prediksi Skor & Analisis Handicap SepakBola
        </h2>
        <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed font-semibold">
          Ulasan akurat pertandingan sepakbola dengan kalkulasi power rating tim real-time, rekor head-to-head (H2H), estimasi skor akhir, pasaran Asian Handicap, serta analisis taktik terpercaya.
        </p>
      </div>

      {/* Transparent Blur Blue Container for Predictions (same as MatchList) */}
      <div id="predictions-container" className="relative overflow-hidden glass-static p-4 sm:p-6 space-y-4">
        
        {/* Outer Box Header - Aligned in single row */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-sky-400/30">
          {/* Quick League Filter Tabs - Rounded Rectangle with Country Flags */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1 min-w-0">
            {[
              { id: 'all', name: 'Semua', flagUrl: '' },
              { id: 'epl', name: 'Premier League', flagUrl: 'https://flagcdn.com/w40/gb-eng.png' },
              { id: 'laliga', name: 'La Liga', flagUrl: 'https://flagcdn.com/w40/es.png' },
              { id: 'bundesliga', name: 'Bundesliga', flagUrl: 'https://flagcdn.com/w40/de.png' },
              { id: 'seriea', name: 'Serie A', flagUrl: 'https://flagcdn.com/w40/it.png' },
              { id: 'ligue1', name: 'Ligue 1', flagUrl: 'https://flagcdn.com/w40/fr.png' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`filter-tab-${tab.id}`}
                onClick={() => setSelectedLeague(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 border ${
                  selectedLeague === tab.id
                    ? 'bg-sky-400 text-black border-white shadow-md'
                    : 'bg-sky-950/60 text-white hover:bg-sky-950/80 border-sky-500/30'
                }`}
              >
                {tab.flagUrl ? (
                  <img src={tab.flagUrl} alt={tab.name} className="w-4 h-3 object-cover rounded-xs shadow-2xs" />
                ) : (
                  <span className="text-xs">🌍</span>
                )}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Laga count badge on the right */}
          <div className="flex-shrink-0">
            <span className="px-3.5 py-1.5 rounded-full bg-sky-950/70 text-white text-xs sm:text-sm font-black border border-sky-400/50 shadow-xs whitespace-nowrap">
              {matchesWithPredictions.length} Laga
            </span>
          </div>
        </div>

        {/* 2-Column Grid for Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 pt-1">
          {matchesWithPredictions.map((match) => {
            const pred = match.prediction;
            const confidence = pred?.confidence || 65;
            const predictedScore = pred?.predictedScore || '2 - 1';
            const handicapText = pred?.handicap || match.handicap || '0 : 0';

            // Clean format: "[Nama Tim] Menang ( X - Y )" or "Imbang ( X - Y )"
            let recommendationText = `${match.homeTeam.name} Menang ( ${predictedScore} )`;
            if (pred?.predictedHomeScore !== undefined && pred?.predictedAwayScore !== undefined) {
              if (pred.predictedHomeScore > pred.predictedAwayScore) {
                recommendationText = `${match.homeTeam.name} Menang ( ${pred.predictedHomeScore} - ${pred.predictedAwayScore} )`;
              } else if (pred.predictedHomeScore < pred.predictedAwayScore) {
                recommendationText = `${match.awayTeam.name} Menang ( ${pred.predictedHomeScore} - ${pred.predictedAwayScore} )`;
              } else {
                recommendationText = `Imbang ( ${pred.predictedHomeScore} - ${pred.predictedAwayScore} )`;
              }
            } else if (pred?.pick) {
              // Strip words like "Handicap", "Tipis", "Telak", etc.
              recommendationText = pred.pick
                .replace(/Handicap|Telak|Tipis|Le Classique|Unggul Tipis|Menang Tandang/gi, '')
                .replace(/\s+/g, ' ')
                .trim();
            }

            // Accurate Over / Under based on predicted score goals
            let overUnderBadge = pred?.overUnder || 'Over 2.5 Gol';
            if (pred?.predictedHomeScore !== undefined && pred?.predictedAwayScore !== undefined) {
              const totalGoals = pred.predictedHomeScore + pred.predictedAwayScore;
              overUnderBadge = totalGoals >= 3 ? 'Over 2.5 Gol' : 'Under 2.5 Gol';
            } else if (pred?.predictedScore) {
              const parts = pred.predictedScore.split('-').map((s) => parseInt(s.trim(), 10));
              if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                overUnderBadge = parts[0] + parts[1] >= 3 ? 'Over 2.5 Gol' : 'Under 2.5 Gol';
              }
            }

            return (
              <div
                key={match.id}
                id={`prediction-card-${match.id}`}
                onClick={() => onSelectMatch(match)}
                className="group relative rounded-2xl bg-sky-950/40 backdrop-blur-md border-2 border-sky-400/50 p-4 sm:p-5 shadow-[0_6px_20px_rgba(2,132,199,0.35)] transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_8px_28px_rgba(14,165,233,0.5)] active:translate-y-0 active:scale-[0.99] flex flex-col justify-between overflow-hidden space-y-3.5"
              >
                {/* 1. Header: League & Win Rate Badge (Dynamic Power Winrate) */}
                <div className="flex items-center justify-between border-b border-sky-500/20 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={match.leagueFlag} alt={match.leagueName} className="w-4 h-3 rounded-sm object-cover shadow-2xs border border-zinc-700 flex-shrink-0" />
                    <span className="text-xs font-bold text-sky-300 truncate">{match.leagueName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-black bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 px-2.5 py-0.5 rounded-full border border-white shadow-2xs">
                      <TrendingUp className="w-3 h-3 text-black" />
                      Win Rate {confidence}%
                    </span>
                  </div>
                </div>

                {/* 2. Teams & Center Predicted Score Box with Handicap Below */}
                <div className="p-3 sm:p-4 rounded-xl bg-sky-950/60 border border-sky-500/20 flex items-center justify-between gap-2 sm:gap-3">
                  {/* Home Team */}
                  <div className="flex flex-col items-center text-center flex-1 min-w-0 space-y-1.5">
                    <div className="relative">
                      <img
                        src={getTeamLogoUrl(
                          match.homeTeam.logoUrl || (match.homeTeam.badgeBg?.startsWith('http') ? match.homeTeam.badgeBg : match.homeTeam.name),
                          match.homeTeam.shortName
                        )}
                        alt={match.homeTeam.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-[0_4px_8px_rgba(255,255,255,0.2)]"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_TEAM_LOGO;
                        }}
                      />
                    </div>
                    <span className="font-black text-xs sm:text-sm text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                      {match.homeTeam.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                      KANDANG
                    </span>
                  </div>

                  {/* Center Box: PREDIKSI SKOR & KETERANGAN HANDICAP */}
                  <div className="flex flex-col items-center justify-center flex-shrink-0 px-2 min-w-[130px] sm:min-w-[145px]">
                    <span className="text-[10px] font-black uppercase text-sky-300 tracking-wider mb-1 flex items-center gap-1">
                      <Target className="w-3 h-3 text-sky-300" />
                      PREDIKSI SKOR
                    </span>
                    
                    {/* Kotak Skor Prediksi Match */}
                    <div className="w-full py-1.5 px-3 bg-gradient-to-r from-sky-400 to-blue-600 rounded-xl border-2 border-white shadow-[0_4px_14px_rgba(14,165,233,0.45)] text-center">
                      <span className="text-base sm:text-lg font-black text-black tracking-widest font-mono">
                        {predictedScore}
                      </span>
                    </div>

                    {/* Keterangan Handicap di Bawah Kotak Skor */}
                    <div className="w-full mt-1.5 px-2 py-0.5 rounded-lg bg-sky-950/70 border border-sky-400/90 text-center shadow-2xs">
                      <span className="text-[11px] font-black text-sky-300 whitespace-nowrap block truncate">
                        HDP: {handicapText}
                      </span>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center text-center flex-1 min-w-0 space-y-1.5">
                    <div className="relative">
                      <img
                        src={getTeamLogoUrl(
                          match.awayTeam.logoUrl || (match.awayTeam.badgeBg?.startsWith('http') ? match.awayTeam.badgeBg : match.awayTeam.name),
                          match.awayTeam.shortName
                        )}
                        alt={match.awayTeam.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-[0_4px_8px_rgba(255,255,255,0.2)]"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_TEAM_LOGO;
                        }}
                      />
                    </div>
                    <span className="font-black text-xs sm:text-sm text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                      {match.awayTeam.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                      TANDANG
                    </span>
                  </div>
                </div>

                {/* 3. Rekomendasi Utama (Pick / Pasaran) */}
                <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-400/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1 rounded-md bg-sky-400 text-black flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-black text-sky-300 block tracking-wider">
                        REKOMENDASI PASARAN
                      </span>
                      <span className="text-xs sm:text-sm font-black text-white truncate block">
                        {recommendationText}
                      </span>
                    </div>
                  </div>
                  {overUnderBadge && (
                    <span className="text-[10px] font-black text-sky-300 bg-sky-950/70 px-2 py-1 rounded-md border border-sky-500/30 whitespace-nowrap flex-shrink-0">
                      {overUnderBadge}
                    </span>
                  )}
                </div>

                {/* 4. Rekor Pertemuan / Head-to-Head (H2H) jika tersedia */}
                {match.h2h && match.h2h.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/20 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-sky-300 border-b border-sky-500/20 pb-1">
                      <span className="flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-sky-300" />
                        Rekor Head-to-Head (H2H)
                      </span>
                      <span className="text-zinc-400 text-[10px] font-medium">{match.h2h.slice(0, 5).length} Pertemuan Terakhir</span>
                    </div>
                    <div className="space-y-1">
                      {match.h2h.slice(0, 5).map((h, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] text-zinc-300 py-0.5 px-1 rounded-md bg-black/40">
                          <span className="text-zinc-400 text-[10px] w-20 flex-shrink-0">{h.date}</span>
                          <div className="flex items-center gap-1.5 flex-1 justify-center min-w-0 px-1 font-medium">
                            <span className={`truncate text-right flex-1 ${h.winner === 'home' ? 'text-sky-300 font-bold' : 'text-zinc-200'}`}>
                              {h.homeTeam}
                            </span>
                            <span className="px-1.5 py-0.5 bg-sky-950/70 text-sky-300 rounded font-mono font-bold border border-sky-500/30 text-[10px] flex-shrink-0">
                              {h.score}
                            </span>
                            <span className={`truncate text-left flex-1 ${h.winner === 'away' ? 'text-sky-300 font-bold' : 'text-zinc-200'}`}>
                              {h.awayTeam}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Analisis Singkat & Taktikal */}
                <div className="p-2.5 rounded-xl bg-sky-950/50 border border-sky-500/20 text-xs text-zinc-300 leading-relaxed font-semibold">
                  <span className="text-sky-300 font-bold mr-1.5">Analisis:</span>
                  {pred?.aiAnalysis || 'Berdasarkan performa terkini, tim tuan rumah memiliki kans lebih besar meraih poin penuh.'}
                </div>

                {/* 6. Footer Action */}
                <div className="pt-2 border-t border-sky-500/20 flex items-center justify-between text-xs font-bold text-sky-300 group-hover:text-sky-200">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    Lihat Statistik & Detail Match
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
