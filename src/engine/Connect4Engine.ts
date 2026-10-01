import { Position, AIDifficulty } from '../types';

export const NB_LIGNES = 6;
export const NB_COLONNES = 7;

// Table de poids positionnels (identique au C++ original)
const POIDS_POSITIONNELS: number[][] = [
  [3, 4, 7, 10, 7, 4, 3],
  [4, 7, 10, 15, 10, 7, 4],
  [5, 9, 13, 20, 13, 9, 5],
  [5, 9, 13, 20, 13, 9, 5],
  [4, 7, 10, 15, 10, 7, 4],
  [3, 4, 7, 10, 7, 4, 3],
];

export class Connect4Engine {
  private grid: (number | null)[][]; // 6 rows, 7 cols. 1 = Joueur 1, 2 = Joueur 2, null = vide
  private bitboards: [bigint, bigint]; // bitboard[0] pour J1, bitboard[1] pour J2
  private nbPions: number;
  private winningPositions: Position[];

  constructor() {
    this.grid = Array.from({ length: NB_LIGNES }, () => Array(NB_COLONNES).fill(null));
    this.bitboards = [0n, 0n];
    this.nbPions = 0;
    this.winningPositions = [];
  }

  // Cloner l'état de l'échiquier
  clone(): Connect4Engine {
    const copie = new Connect4Engine();
    copie.grid = this.grid.map(row => [...row]);
    copie.bitboards = [this.bitboards[0], this.bitboards[1]];
    copie.nbPions = this.nbPions;
    copie.winningPositions = [...this.winningPositions];
    return copie;
  }

  getGrid(): (number | null)[][] {
    return this.grid;
  }

  getCase(row: number, col: number): number | null {
    if (row < 0 || row >= NB_LIGNES || col < 0 || col >= NB_COLONNES) return null;
    return this.grid[row][col];
  }

  getWinningPositions(): Position[] {
    return this.winningPositions;
  }

  getNbPions(): number {
    return this.nbPions;
  }

  estPleine(): boolean {
    return this.nbPions >= 42;
  }

  ouValide(colonne: number): boolean {
    if (colonne < 0 || colonne >= NB_COLONNES) return false;
    return this.grid[0][colonne] === null;
  }

  getValidColumns(): number[] {
    const cols: number[] = [];
    for (let c = 0; c < NB_COLONNES; c++) {
      if (this.ouValide(c)) cols.push(c);
    }
    return cols;
  }

  placer(joueur: 1 | 2, colonne: number): { row: number; col: number } | null {
    if (!this.ouValide(colonne)) return null;
    const pIndex = joueur - 1;

    for (let row = NB_LIGNES - 1; row >= 0; row--) {
      if (this.grid[row][colonne] === null) {
        this.grid[row][colonne] = joueur;

        // Mise à jour bitboard
        // bit index = colonne * 7 + (nbLignes - 1 - row)
        const rIndex = NB_LIGNES - 1 - row;
        const bit = colonne * 7 + rIndex;
        this.bitboards[pIndex] |= 1n << BigInt(bit);
        this.nbPions++;

        return { row, col: colonne };
      }
    }
    return null;
  }

  annulerCoup(colonne: number): boolean {
    for (let row = 0; row < NB_LIGNES; row++) {
      const joueur = this.grid[row][colonne];
      if (joueur !== null) {
        const pIndex = joueur - 1;
        const rIndex = NB_LIGNES - 1 - row;
        const bit = colonne * 7 + rIndex;

        this.bitboards[pIndex] &= ~(1n << BigInt(bit));
        this.grid[row][colonne] = null;
        this.nbPions--;
        this.winningPositions = [];
        return true;
      }
    }
    return false;
  }

  // Vérification de victoire ultra-rapide par Bitboard (identique au C++)
  estVictoire(joueur: 1 | 2): boolean {
    const p = joueur - 1;
    const b = this.bitboards[p];

    // Horizontal
    let m = b & (b >> 7n);
    if ((m & (m >> 14n)) !== 0n) return true;

    // Vertical
    m = b & (b >> 1n);
    if ((m & (m >> 2n)) !== 0n) return true;

    // Diagonale \ (direction -6)
    m = b & (b >> 6n);
    if ((m & (m >> 12n)) !== 0n) return true;

    // Diagonale / (direction -8)
    m = b & (b >> 8n);
    if ((m & (m >> 16n)) !== 0n) return true;

    return false;
  }

  // Vérifie la victoire et calcule les positions exactes de la ligne gagnante
  verifierVictoire(joueur: 1 | 2): Position[] | null {
    if (!this.estVictoire(joueur)) {
      this.winningPositions = [];
      return null;
    }

    const directions = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonale \
      [1, -1], // Diagonale /
    ];

    for (let r = 0; r < NB_LIGNES; r++) {
      for (let c = 0; c < NB_COLONNES; c++) {
        if (this.grid[r][c] !== joueur) continue;

        for (const [dr, dc] of directions) {
          const ligne: Position[] = [{ x: r, y: c }];
          for (let step = 1; step < 4; step++) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if (nr >= 0 && nr < NB_LIGNES && nc >= 0 && nc < NB_COLONNES && this.grid[nr][nc] === joueur) {
              ligne.push({ x: nr, y: nc });
            } else {
              break;
            }
          }

          if (ligne.length >= 4) {
            this.winningPositions = ligne;
            return ligne;
          }
        }
      }
    }

    return null;
  }

  // Évaluation heuristique conforme au C++ (poids de cases + motifs de 3)
  evaluer(joueurIA: 1 | 2): number {
    const joueurHumain: 1 | 2 = joueurIA === 1 ? 2 : 1;
    let score = 0;

    for (let i = 0; i < NB_LIGNES; i++) {
      for (let j = 0; j < NB_COLONNES; j++) {
        const c = this.grid[i][j];
        if (c === joueurIA) {
          score += POIDS_POSITIONNELS[i][j];
        } else if (c === joueurHumain) {
          score -= POIDS_POSITIONNELS[i][j];
        }
      }
    }

    // Compter les alignements de 3
    const compterTriplets = (joueur: 1 | 2): number => {
      let count = 0;
      const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
      for (let r = 0; r < NB_LIGNES; r++) {
        for (let c = 0; c < NB_COLONNES; c++) {
          for (const [dr, dc] of dirs) {
            let pionsJoueur = 0;
            let casesVides = 0;
            for (let k = 0; k < 4; k++) {
              const nr = r + dr * k;
              const nc = c + dc * k;
              if (nr >= 0 && nr < NB_LIGNES && nc >= 0 && nc < NB_COLONNES) {
                const val = this.grid[nr][nc];
                if (val === joueur) pionsJoueur++;
                else if (val === null) casesVides++;
              }
            }
            if (pionsJoueur === 3 && casesVides === 1) {
              count++;
            }
          }
        }
      }
      return count;
    };

    score += compterTriplets(joueurIA) * 100;
    score -= compterTriplets(joueurHumain) * 100;

    return score;
  }

  // IA Minimax avec élagage Alpha-Bêta et ordonnancement de coups
  choisirCoupIA(joueurIA: 1 | 2, difficulte: AIDifficulty): number {
    let maxProfondeur: number;
    switch (difficulte) {
      case 'STANDARD':
        maxProfondeur = 4;
        break;
      case 'EXPERT':
        maxProfondeur = 6;
        break;
      case 'MAITRE':
        maxProfondeur = 8;
        break;
      default:
        maxProfondeur = 4;
    }

    // Si premier coup sur grille vide, jouer au centre directement (colonne 3)
    if (this.nbPions === 0 && this.ouValide(3)) {
      return 3;
    }

    // Vérification rapide de coup gagnant immédiat (profondeur 1)
    const validMoves = this.getValidColumns();
    for (const col of validMoves) {
      this.placer(joueurIA, col);
      const win = this.estVictoire(joueurIA);
      this.annulerCoup(col);
      if (win) return col;
    }

    // Vérification rapide de contre immédiat de l'adversaire
    const joueurAdverse: 1 | 2 = joueurIA === 1 ? 2 : 1;
    for (const col of validMoves) {
      this.placer(joueurAdverse, col);
      const opponentWin = this.estVictoire(joueurAdverse);
      this.annulerCoup(col);
      if (opponentWin) return col;
    }

    // Ordre statique favorisant le centre (identique au C++)
    const staticOrdre = [3, 2, 4, 1, 5, 0, 6];
    const orderedMoves = staticOrdre.filter(col => this.ouValide(col));

    let meilleurCoupGlobal = orderedMoves[0];
    let meilleurScoreGlobal = -Infinity;

    // Iterative deepening jusqu'à maxProfondeur
    for (let depth = 1; depth <= maxProfondeur; depth++) {
      let meilleurScore = -Infinity;
      let meilleurCoupIter = orderedMoves[0];

      for (const col of orderedMoves) {
        this.placer(joueurIA, col);
        const score = this.minimax(col, depth - 1, -Infinity, Infinity, false, joueurIA);
        this.annulerCoup(col);

        if (score > meilleurScore) {
          meilleurScore = score;
          meilleurCoupIter = col;
        }
      }

      meilleurCoupGlobal = meilleurCoupIter;
      meilleurScoreGlobal = meilleurScore;
      if (meilleurScoreGlobal >= 1000000) break; // Victoire forcée trouvée
    }

    return meilleurCoupGlobal;
  }

  private minimax(
    dernierCoup: number,
    profondeur: number,
    alpha: number,
    beta: number,
    estMaximisant: boolean,
    joueurIA: 1 | 2
  ): number {
    const joueurHumain: 1 | 2 = joueurIA === 1 ? 2 : 1;

    // Détection de fin de partie
    if (this.estVictoire(joueurIA)) return 1000000 + profondeur;
    if (this.estVictoire(joueurHumain)) return -1000000 - profondeur;
    if (this.estPleine() || profondeur === 0) return this.evaluer(joueurIA);

    const staticOrdre = [3, 2, 4, 1, 5, 0, 6];
    const moves = staticOrdre.filter(col => this.ouValide(col));

    if (estMaximisant) {
      let maxEval = -Infinity;
      for (const col of moves) {
        this.placer(joueurIA, col);
        const ev = this.minimax(col, profondeur - 1, alpha, beta, false, joueurIA);
        this.annulerCoup(col);

        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const col of moves) {
        this.placer(joueurHumain, col);
        const ev = this.minimax(col, profondeur - 1, alpha, beta, true, joueurIA);
        this.annulerCoup(col);

        minEval = Math.min(minEval, ev);
        beta = Math.min(beta, ev);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  // Génération du texte formaté ANSI / Terminal fidèle au C++
  genererAffichageTerminal(sym1: string, sym2: string): string {
    let out = '   ';
    for (let j = 0; j < NB_COLONNES; j++) {
      out += ` ${j}  `;
    }
    out += '\n';

    for (let i = 0; i < NB_LIGNES; i++) {
      out += '  +';
      for (let j = 0; j < NB_COLONNES; j++) {
        out += '---+';
      }
      out += '\n  |';

      for (let j = 0; j < NB_COLONNES; j++) {
        const val = this.grid[i][j];
        const estGagnant = this.winningPositions.some(p => p.x === i && p.y === j);

        if (val === null) {
          out += '   |';
        } else if (estGagnant) {
          // ANSI Green \033[32m ... \033[0m
          const char = val === 1 ? sym1 : sym2;
          out += ` \u001b[32m${char}\u001b[0m |`;
        } else if (val === 1) {
          // ANSI Red \033[31m
          out += ` \u001b[31m${sym1}\u001b[0m |`;
        } else {
          // ANSI Blue \033[34m
          out += ` \u001b[34m${sym2}\u001b[0m |`;
        }
      }
      out += '\n';
    }

    out += '  +';
    for (let j = 0; j < NB_COLONNES; j++) {
      out += '---+';
    }
    out += '\n';

    return out;
  }
}
