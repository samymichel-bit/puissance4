export type PlayerSymbol = 'X' | 'O' | string;

export type AIDifficulty = 'STANDARD' | 'EXPERT' | 'MAITRE';

export type GameMode = 'PVP' | 'PVE' | 'EVE' | 'ONLINE'; // Joueur vs Joueur, Joueur vs IA, IA vs IA, En ligne / Même réseau

export type BoardTheme = 'classic' | 'cyberpunk' | 'wood';

export interface Position {
  x: number; // row: 0 to 5 (0 is top, 5 is bottom)
  y: number; // column: 0 to 6
}

export interface PlayerConfig {
  id: 1 | 2;
  name: string;
  symbol: string;
  color: string;
  isAI: boolean;
  difficulty?: AIDifficulty;
}

export interface MoveRecord {
  player: 1 | 2;
  column: number;
  row: number;
  symbol: string;
  timestamp: number;
}

export interface GameStats {
  p1Wins: number;
  p2Wins: number;
  draws: number;
  totalGames: number;
}

export interface TournamentRoundResult {
  round: number;
  winnerId: 1 | 2 | 'draw';
  winnerName: string;
}

export interface TournamentState {
  isActive: boolean;
  totalMatches: 3 | 5; // Série de 3 ou 5 matchs
  currentRound: number;
  p1Wins: number;
  p2Wins: number;
  draws: number;
  roundHistory: TournamentRoundResult[];
  isCompleted: boolean;
  champion: PlayerConfig | 'draw' | null;
}

