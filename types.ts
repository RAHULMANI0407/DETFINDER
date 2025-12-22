
export enum ContentType {
  MOVIE = 'Movie',
  EPISODE = 'Episode',
  SPECIAL = 'Special',
  SHORT_FILM = 'Short Film'
}

export enum Language {
  TAMIL = 'Tamil',
  NOT_IN_TAMIL = 'Not in Tamil'
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  season?: string;
  description: string;
  language: Language;
  keywords: string[];
  telegram_link: string;
  image?: string;
  imdbRating?: string;
}

export type MatchType = 'Title-match' | 'Event-based' | 'Scene-based' | 'Story-based' | 'Keyword-based';

export interface SearchResult {
  matches: ContentItem[];
  reasoningMap?: Record<string, string[]>;
  matchTypeMap?: Record<string, MatchType>;
  relevanceScoreMap?: Record<string, number>;
  rejectionMap?: Record<string, string>;
  didYouMean?: string;
  isLowConfidence?: boolean;
  isVagueQuery?: boolean;
  intentType?: string;
}
