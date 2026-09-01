import React, { useState } from 'react';
import { Calculator, Plus, Trash2, RefreshCw, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';
import { ParlaySelection } from '../types';

export const ParlayCalculator: React.FC = () => {
  const [stake, setStake] = useState<number>(100000);
  const [selections, setSelections] = useState<ParlaySelection[]>([
    { id: '1', matchTitle: 'Arsenal vs Man City', selectionName: 'Arsenal HDP -0.25', odds: 1.95 },
    { id: '2', matchTitle: 'Real Madrid vs Barcelona', selectionName: 'Over 3.0 Goals', odds: 1.85 },
    { id: '3', matchTitle: 'Bayern vs PSG', selectionName: 'Bayern Win', odds: 1.90 },
  ]);

  const [newMatch, setNewMatch] = useState('');
  const [newPick, setNewPick] = useState('');
  const [newOdds, setNewOdds] = useState<number>(1.85);

  const handleAddSelection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch.trim() || !newPick.trim() || newOdds <= 1) return;

    setSelections([
      ...selections,
      {
        id: Date.now().toString(),
        matchTitle: newMatch,
        selectionName: newPick,
        odds: newOdds,
      },
    ]);

    setNewMatch('');
    setNewPick('');
    setNewOdds(1.85);
  };

  const handleRemoveSelection = (id: string) => {
    setSelections(selections.filter((s) => s.id !== id));
  };

  // Total Odds Calculation
  const totalOdds = selections.reduce((acc, curr) => acc * curr.odds, 1);
  const potentialPayout = Math.round(stake * totalOdds);
  const netProfit = potentialPayout - stake;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-static p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-amber-300 border border-orange-500/40">
            <Calculator className="w-5 h-5" />
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            KALKULATOR MIX PARLAY KAPSUL4D
          </span>
        </div>
        <h2 className="text-2xl font-black text-white">Simulasi Hitung Odds & Kemenangan Mix Parlay</h2>
        <p className="text-xs text-slate-300">
          Hitung estimasi total odds perkalian dan potensi pembayaran kemenangan paket taruhan berganda (mix parlay) Anda dengan akurat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form & Selections List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add Match Form */}
          <div className="glass-static p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Tambah Tim / Pertandingan ke Paket Parlay
            </h3>

            <form onSubmit={handleAddSelection} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Match (misal: Persib vs Persija)"
                value={newMatch}
                onChange={(e) => setNewMatch(e.target.value)}
                className="px-3.5 py-2 text-xs bg-slate-900 text-white rounded-xl border border-slate-800 focus:border-cyan-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Pilihan (misal: Persib -0.5)"
                value={newPick}
                onChange={(e) => setNewPick(e.target.value)}
                className="px-3.5 py-2 text-xs bg-slate-900 text-white rounded-xl border border-slate-800 focus:border-cyan-400 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Odds (1.85)"
                  value={newOdds}
                  onChange={(e) => setNewOdds(parseFloat(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-900 text-white rounded-xl border border-slate-800 focus:border-cyan-400 focus:outline-none font-bold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Current Selections List */}
          <div className="glass-static p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-extrabold text-sm text-white">Daftar Pilihan ({selections.length} Laga)</h3>
              {selections.length > 0 && (
                <button
                  onClick={() => setSelections([])}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            {selections.length > 0 ? (
              <div className="space-y-2">
                {selections.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-500 w-4 text-center">{idx + 1}.</span>
                      <div>
                        <p className="font-extrabold text-white">{item.matchTitle}</p>
                        <p className="text-[11px] text-cyan-300 font-bold">{item.selectionName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
                        @{item.odds.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveSelection(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                Belum ada tim dalam paket parlay. Tambahkan tim di form atas.
              </p>
            )}
          </div>

        </div>

        {/* Right Column: Calculation Summary */}
        <div className="space-y-6">
          <div className="glass-static p-6 space-y-5 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Hasil Perkalian Mix Parlay
            </h3>

            {/* Stake Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Nilai Taruhan (Stake IDR):</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-black bg-slate-900 text-amber-300 rounded-xl border border-slate-800 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Calculated Values */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Jumlah Laga:</span>
                <span className="font-bold text-white">{selections.length} Laga</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Total Perkalian Odds:</span>
                <span className="font-black text-amber-400 text-sm">@{totalOdds.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 pt-2 border-t border-slate-800">
                <span>Estimasi Kemenangan Bersih:</span>
                <span className="font-black text-emerald-400">
                  Rp {netProfit > 0 ? netProfit.toLocaleString('id-ID') : '0'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                <span>Total Pembayaran (Payout):</span>
                <span className="text-cyan-300 text-base drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                  Rp {potentialPayout > 0 ? potentialPayout.toLocaleString('id-ID') : '0'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
              <b>Catatan:</b> Hasil simulasi berdasarkan perkalian standar desimal. Laga dengan status seri setengah (Win 1/2) atau kalah setengah (Lose 1/2) akan dihitung otomatis sesuai aturan resmi.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
