import React, { useState } from 'react';
import { MOCK_NEWS } from '../data/mockData';
import { NewsArticle } from '../types';
import { Newspaper, Eye, Clock, Flame, ChevronRight, X } from 'lucide-react';

export const NewsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const categories = ['Semua', 'Prediksi', 'Liga Indonesia', 'Transfer', 'Taktik'];

  const filteredNews = MOCK_NEWS.filter(
    (item) => selectedCategory === 'Semua' || item.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      
      {/* News Header */}
      <div className="glass-static p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Newspaper className="w-5 h-5" />
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-blue-400">
            BERITA SEPAKBOLA TERBARU
          </span>
        </div>
        <h2 className="text-2xl font-black text-white">Kabar SepakBola, Transfer & Ulasan Laga</h2>
        <p className="text-xs text-slate-300">
          Update informasi terkini seputar liga top dunia dan sepakbola tanah air BRI Liga 1 secara akurat dan terpercaya.
        </p>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`klasemen-tab ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNews.map((article) => (
          <div
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="glass p-5 cursor-pointer space-y-4 flex flex-col justify-between hover:scale-[1.01] transition-transform"
          >
            <div className="space-y-3">
              {/* Image & Tag */}
              <div className="relative h-44 rounded-xl overflow-hidden group">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-slate-950/80 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                  {article.category}
                </span>
                {article.isTrending && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-amber-500 text-slate-950 flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                    <Flame className="w-3 h-3 fill-slate-950" /> TRENDING
                  </span>
                )}
              </div>

              {/* Title & Summary */}
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug hover:text-amber-700 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {article.summary}
              </p>
            </div>

            {/* Meta Footer */}
            <div className="pt-3 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  {article.publishedAt}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-amber-600" />
                  {article.views.toLocaleString()} Dibaca
                </span>
              </div>
              <span className="text-amber-700 font-extrabold flex items-center gap-1">
                Baca Artikel <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
          <div className="relative w-full max-w-2xl glass-static p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto border-cyan-500/40">
            <button
              onClick={() => setSelectedArticle(null)}
              className="btn-close-stat-x absolute top-4 right-4 w-8 h-8 rounded-full z-20 cursor-pointer"
              title="Tutup"
              aria-label="Tutup"
            >
              <X className="w-4 h-4 text-black stroke-[3]" />
            </button>

            <div className="space-y-3">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                {selectedArticle.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {selectedArticle.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold border-b border-slate-800 pb-3">
                <span>Oleh {selectedArticle.author}</span>
                <span>•</span>
                <span>{selectedArticle.publishedAt}</span>
              </div>
            </div>

            <img
              src={selectedArticle.imageUrl}
              alt={selectedArticle.title}
              className="w-full h-64 object-cover rounded-2xl border border-slate-800"
            />

            <div className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
              {selectedArticle.content}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-all"
              >
                Tutup Artikel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
