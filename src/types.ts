export type MatchStatus = 'LIVE' | 'FINISHED' | 'UPCOMING' | 'POSTPONED' | 'TODAY';

export type LeagueId = 'epl' | 'laliga' | 'seriea' | 'bundesliga' | 'ligue1' | 'ucl';

export interface League {
  id: LeagueId;
  name: string;
  country: string;
  countryCode: string;
  flagUrl: string;
  season: string;
  logo: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  badgeBg: string;
  badgeTextColor: string;
  logoUrl?: string;
  country: string;
  form: ('W' | 'D' | 'L' | '-')[];
}

export interface MatchStats {
  possession: [number, number];
  shotsOnTarget: [number, number];
  totalShots: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  passAccuracy?: [number, number];
  offsides?: [number, number];
}

export interface HeadToHead {
  date: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  winner: 'home' | 'away' | 'draw';
}

export interface PredictionDetail {
  pick: string;
  handicap: string;
  overUnder: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedScore?: string;
  predictedHomeScore?: number;
  predictedAwayScore?: number;
  keyFactors: string[];
  aiAnalysis: string;
  recommendedOdds: string;
  confidence: number;
  votesHome: number;
  votesDraw: number;
  votesAway: number;
}

export interface Match {
  id: string;
  espnEventId?: string;
  leagueId: LeagueId;
  leagueName: string;
  leagueFlag: string;
  status: MatchStatus;
  minute?: number | string;
  date: string;
  time: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  handicap: string;
  overUnderOdds?: string;
  homeOdds?: number;
  drawOdds?: number;
  awayOdds?: number;
  venue: string;
  prediction?: PredictionDetail;
  stats?: MatchStats;
  goalScorersHome?: string[];
  goalScorersAway?: string[];
  h2h?: HeadToHead[];
  isHot?: boolean;
}

export interface StandingRow {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: ('W' | 'D' | 'L' | '')[];
  zone: 'ucl' | 'ucl-qualifier' | 'uel' | 'conference' | 'uecl' | 'playoff' | 'relegation-playoff' | 'relegation' | 'none';
}

export interface TopScorer {
  rank: number;
  name: string;
  team: string;
  flag: string;
  goals: number;
  assists?: number;
  matches: number;
  leagueId?: string;
  leagueName?: string;
  country?: string;
  photoUrl?: string;
}

export interface TopAssist {
  rank: number;
  name: string;
  team: string;
  flag: string;
  assists: number;
  goals?: number;
  matches: number;
  leagueId?: string;
  leagueName?: string;
  country?: string;
  photoUrl?: string;
}

export interface TournamentStats {
  totalMatches: number;
  totalGoals: number;
  redCards: number;
  cleanSheets: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  category: 'Prediksi' | 'Transfer' | 'Review Match' | 'Liga Indonesia' | 'Taktik';
  imageUrl: string;
  publishedAt: string;
  leagueId?: LeagueId;
  views: number;
  isTrending?: boolean;
}

export interface ParlaySelection {
  id: string;
  matchTitle: string;
  selectionName: string;
  odds: number;
}
