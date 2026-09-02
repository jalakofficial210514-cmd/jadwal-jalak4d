import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroSpotlight } from './components/HeroSpotlight';
import { MatchList } from './components/MatchList';
import { MatchDetailModal } from './components/MatchDetailModal';
import { PredictionsView } from './components/PredictionsView';
import { StandingsView } from './components/StandingsView';
import { StatsView } from './components/StatsView';
import { Footer } from './components/Footer';
import { MOCK_MATCHES } from './data/mockData';
import { Match } from './types';
import { fetchAllESPNMatches } from './utils/espnMatches';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('matches');
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState<boolean>(false);
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [isESPNLive, setIsESPNLive] = useState<boolean>(false);

  // Load real match schedule from ESPN
  const loadESPNMatches = useCallback(async () => {
    setIsLoadingMatches(true);
    try {
      const liveMatches = await fetchAllESPNMatches();
      if (liveMatches && liveMatches.length > 0) {
        setMatches(liveMatches);
        setIsESPNLive(true);
      }
    } catch (err) {
      console.warn('Fallback to mock matches due to fetch error:', err);
    } finally {
      setIsLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    loadESPNMatches();
    // Auto-refresh match scores every 60 seconds
    const interval = setInterval(loadESPNMatches, 60000);
    return () => clearInterval(interval);
  }, [loadESPNMatches]);

  // Featured match for Hero Spotlight
  const spotlightMatch = matches.find((m) => m.isHot) || matches[0];

  // Count live matches
  const liveMatchesCount = matches.filter((m) => m.status === 'LIVE').length;

  // Scroll spy to update activeTab based on current scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['matches', 'predictions', 'standings', 'stats', 'social'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveTab(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (tabId: string) => {
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'auto'
      });
    }
  };

  return (
    <div className="min-h-screen text-white bg-[#09090b] flex flex-col relative font-sans">
      
      {/* Main Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenMobileMenu={() => setIsOpenMobileMenu(true)}
        liveMatchesCount={liveMatchesCount}
        activeTab={activeTab}
        setActiveTab={scrollToSection}
        matches={matches}
        onSelectMatch={(m) => setSelectedMatch(m)}
      />

      {/* Main Body Layout - Single Scrollable Page showing all sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pt-6 sm:pt-8 relative z-10 space-y-16">
        
        {/* Section 1: Jadwal (Matches) */}
        <section id="matches" className="space-y-6 pt-2">
          {!searchQuery && selectedLeagueFilter === 'all' && (
            <HeroSpotlight
              onSelectMatch={(m) => setSelectedMatch(m)}
            />
          )}
          <MatchList
            matches={matches}
            selectedLeagueFilter={selectedLeagueFilter}
            setSelectedLeagueFilter={setSelectedLeagueFilter}
            onSelectMatch={(m) => setSelectedMatch(m)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            isLoadingMatches={isLoadingMatches}
            onRefreshMatches={loadESPNMatches}
            isESPNLive={isESPNLive}
          />
        </section>

        {/* Section 2: Prediksi */}
        <section id="predictions" className="space-y-6 pt-6 border-t border-yellow-950/40">
          <div className="text-center pb-2">
            <span className="text-xs font-black uppercase tracking-widest text-yellow-400">ANALISIS & PREDIKSI AKURAT</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Prediksi Pertandingan WIFI4D</h2>
          </div>
          <PredictionsView
            matches={matches}
            onSelectMatch={(m) => setSelectedMatch(m)}
          />
        </section>

        {/* Section 3: Klasemen */}
        <section id="standings" className="space-y-6 pt-6 border-t border-yellow-950/40">
          <div className="text-center pb-2">
            <span className="text-xs font-black uppercase tracking-widest text-yellow-400">TANGGA KLASEMEN RESMI</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Klasemen Liga & Turnamen</h2>
          </div>
          <StandingsView />
        </section>

        {/* Section 4: Top Score & Stats */}
        <section id="stats" className="space-y-6 pt-6 border-t border-yellow-950/40 pb-8">
          <div className="text-center pb-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-yellow-400">
              STATISTIK PEMAIN MUSIM 2026/2027
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mt-1 uppercase tracking-tight drop-shadow-md">
              TOP SCORE & ASSIST
            </h2>
          </div>
          <StatsView />
        </section>

      </div>

      {/* Match Details & H2H Modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      {/* Section 5: Social Media & Footer */}
      <div id="social">
        <Footer setActiveTab={scrollToSection} />
      </div>

    </div>
  );
}
