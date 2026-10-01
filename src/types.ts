export type PlayerSymbol = 'X' | 'O' | string;

export type AIDifficulty = 'STANDARD' | 'EXPERT' | 'MAITRE';

export type GameMode = 'PVP' | 'PVE' | 'EVE'; // Joueur vs Joueur, Joueur vs IA, IA vs IA

export interface Position {
  x: number; // row: 0 to 5 (0 is top, 5 is bottom)
  y: number; // column: 0 to 6
}

export interface PlayerConfig {
  id: 1 | 2;
  name: string;
  symbol: string;
  color: string; // Tailwind color class or hex
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
