export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Match {
  id: number;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  status: MatchStatus;
  startTime: string | null;
  endTime: string | null;
  homeScore: number;
  awayScore: number;
  createdAt: string;
}

export interface Commentary {
  id: number;
  matchId: number;
  minute?: number | null;
  sequence?: number | null;
  period?: string | null;
  eventType?: string | null;
  actor?: string | null;
  team?: string | null;
  message: string;
  metaData?: Record<string, any> | null;
  tags?: string[];
  createdAt: string;
}

export interface CreateMatchInput {
  sport: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  endTime: string;
  homeScore?: number;
  awayScore?: number;
}

export interface CreateCommentaryInput {
  minute?: number;
  period?: string;
  eventType?: string;
  actor?: string;
  team?: string;
  message: string;
  tags?: string[];
}
