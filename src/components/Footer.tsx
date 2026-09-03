import React from 'react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-100/90 text-slate-600 text-sm py-14 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Brand & Socials (Col 1-6) */}
          <div className="space-y-5 md:col-span-6">
            <a
              href="https://jalak4d.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer inline-flex items-center gap-3 sm:gap-3.5 group"
            >
              <img
                src="https://ik.imagekit.io/i22mizicx/jhk.png"
                alt="JALAK4D Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform group-hover:scale-105 group-active:scale-95 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-black text-2xl sm:text-3xl tracking-wider text-slate-900">
                    JALAK<span className="text-amber-500">4D</span>
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-black text-amber-600 tracking-widest uppercase">
                  PREDIKSI & LIVE SCORE Eropa
                </span>
              </div>
            </a>

            <p className="text-slate-800 text-sm sm:text-base leading-relaxed max-w-lg font-bold">
              Sumber informasi resmi seputar Liga Top Eropa (Premier League, La Liga, Serie A, Bundesliga, Ligue 1). Dapatkan update terbaru, jadwal pertandingan, klasemen, dan statistik terlengkap.
            </p>

            {/* Social media icons */}
            <div className="pt-2">
              <ul className="example-2">
                {/* Telegram */}
                <li className="icon-content" data-social="telegram">
                  <a
                    href="https://telegram.me/Jalak4DTerpercaya"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Telegram"
                    data-social="telegram"
                  >
                    <div className="filled"></div>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                  </a>
                  <div className="tooltip">Telegram</div>
                </li>

                {/* WhatsApp */}
                <li className="icon-content" data-social="whatsapp">
                  <a
                    href="http://mauaja.link/wajalak"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    data-social="whatsapp"
                  >
                    <div className="filled"></div>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.68-1.2 1.26-1.68 1.32-.47.06-1.07.09-3.48-.91-2.9-1.2-4.76-4.14-4.9-4.34-.15-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.11 1-2.4.26-.29.58-.36.77-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 2.03.9 2.18.07.15.12.33.02.53-.1.19-.15.31-.29.48-.15.17-.31.37-.44.5-.15.15-.31.31-.13.61.17.3.77 1.27 1.66 2.05 1.14 1.02 2.1 1.33 2.4 1.48.3.15.47.13.65-.08.18-.2.77-.9 1-.21.23-.31.45-.26.75-.15.3.11 1.9.89 2.23 1.05.33.16.55.24.63.37.08.13.08.77-.16 1.45z" />
                    </svg>
                  </a>
                  <div className="tooltip">WhatsApp</div>
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation Columns - Menu (Title Case with larger size & comfortable spacing) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-black text-slate-900 text-base sm:text-lg tracking-wide border-b-2 border-amber-400 pb-1.5 inline-block">
              Menu
            </h4>
            <ul className="space-y-3 font-bold text-slate-800 text-sm sm:text-base">
              <li>
                <button
                  onClick={() => setActiveTab('matches')}
                  className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-2 hover:translate-x-1 duration-150"
                >
                  Jadwal
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('predictions')}
                  className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-2 hover:translate-x-1 duration-150"
                >
                  Prediksi
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('standings')}
                  className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-2 hover:translate-x-1 duration-150"
                >
                  Klasemen
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('stats')}
                  className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-2 hover:translate-x-1 duration-150"
                >
                  Top Score
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('social')}
                  className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-2 hover:translate-x-1 duration-150"
                >
                  Social Media
                </button>
              </li>
            </ul>
          </div>

          {/* Bantuan Column (Title Case with larger size & comfortable spacing) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-black text-slate-900 text-base sm:text-lg tracking-wide border-b-2 border-amber-400 pb-1.5 inline-block">
              Bantuan
            </h4>
            <ul className="space-y-3 font-extrabold text-slate-900 text-sm sm:text-base">
              <li>
                <a
                  href="http://coastalcarolinaconnection.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-2 hover:translate-x-1 duration-150"
                >
                  Statistik Kami
                </a>
              </li>
              <li>
                <a
                  href="http://coastalcarolinaconnection.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-2 hover:translate-x-1 duration-150"
                >
                  Kontak
                </a>
              </li>
              <li>
                <a
                  href="http://coastalcarolinaconnection.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-2 hover:translate-x-1 duration-150"
                >
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a
                  href="http://coastalcarolinaconnection.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-2 hover:translate-x-1 duration-150"
                >
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a
                  href="http://coastalcarolinaconnection.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-2 hover:translate-x-1 duration-150"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright line */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-slate-500 font-semibold">
          <p>© 2026 JALAk4D PREDIKSI & LIVE SCORE Liga Top Eropa. All rights reserved.</p>
          <p className="text-amber-700 font-bold">Light Edition 2026</p>
        </div>

      </div>
    </footer>
  );
};
