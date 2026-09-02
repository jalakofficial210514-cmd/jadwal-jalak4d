import React from 'react';

interface HeaderProps {
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onOpenMobileMenu?: () => void;
  liveMatchesCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const navItems = [
    { id: 'matches', label: 'JADWAL' },
    { id: 'predictions', label: 'PREDIKSI' },
    { id: 'standings', label: 'KLASEMEN' },
    { id: 'stats', label: 'TOP SCORE' },
    { id: 'social', label: 'SOCIAL MEDIA' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-black border-b-2 border-yellow-500 shadow-[0_4px_20px_rgba(234,179,8,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo JALAK4D */}
          <div className="flex items-center">
            <a
              href="http://coastalcarolinaconnection.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer flex items-center gap-2.5 sm:gap-3 group"
            >
              <img
                src="https://ik.imagekit.io/i22mizicx/jhk.png"
                alt="JALAK4D Logo"
                className="w-9 h-9 sm:w-11 sm:h-11 object-contain transition-transform group-hover:scale-105 group-active:scale-95 filter drop-shadow-[0_0_12px_rgba(234,179,8,0.6)]"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-black text-xl sm:text-2xl tracking-wider text-white">
                    JALAK<span className="text-yellow-400">4D</span>
                  </span>
                </div>
                <span className="text-[9px] sm:text-[11px] font-bold text-yellow-400 tracking-wider uppercase">
                  LIGA TOP EROPA & UCL
                </span>
              </div>
            </a>
          </div>

          {/* Navigation Items (Desktop) */}
<nav className="hidden md:flex items-center gap-2">
  {navItems.map((item) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => {
          setActiveTab(item.id);
          if (item.id === 'social') {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
          }
        }}
        className={`relative px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-75 cursor-pointer border-2 ${
          isActive
            ? 'text-black bg-gradient-to-r from-sky-400 to-blue-500 border-white shadow-[0_2px_12px_rgba(14,165,233,0.6)]'
            : 'text-white bg-zinc-900 border-zinc-800 hover:text-sky-400 hover:border-sky-400'
        }`}
      >
        {item.label}
      </button>
    );
  })}
</nav>

          {/* Login Button (Right Side) */}
          <div className="flex items-center">
            <a
              href="https://mauaja.link/pesonawifi/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold-glow flex items-center justify-center px-6 sm:px-8 py-2 rounded-full text-black text-xs sm:text-sm font-black tracking-wider uppercase transition-all cursor-pointer"
            >
              <span>LOGIN</span>
            </a>
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-t border-zinc-800">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'social') {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
                  }
                }}
                className={`relative px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase whitespace-nowrap flex-shrink-0 cursor-pointer border ${
                  isActive
                    ? 'text-black bg-yellow-400 border-white'
                    : 'text-zinc-300 bg-zinc-900 border-zinc-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
