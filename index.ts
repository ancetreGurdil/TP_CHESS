const GRID_SIDE: number = 8;

const WHITE_PAWN_START_Y: number = 6;
const BLACK_PAWN_START_Y: number = 1;
const WHITE_PROMOTION_ROW: number = 0;
const BLACK_PROMOTION_ROW: number = 7;

const WHITE_PLAYER: number = 1;
const BLACK_PLAYER: number = 2;

const BLACK_CELL_CLASS: string = "blackCell";
const WHITE_CELL_CLASS: string = "whiteCell";
const LIT_CELL_CLASS: string = "litCell";
const CELL_CLASS: string = "cell";
const ROW_CLASS: string = "row";
const PIECE_CLASS: string = "piece";
const PIECE_COLOR_CLASS: string[] = [, "whitePiece", "blackPiece"];

const CHESS_PIECES_CHARS: string[] = [, "K", "Q", "R", "N", "B", "P"];

// Les fonctions qui seront appelées pour récupérer les cases à allumer
const LIGHT_PIECES_FC = [
  getBlackPawnMovementCells,
  getKingMovementCells,
  getQueenMovementCells,
  getRookMovementCells,
  getKnightMovementCells,
  getBishopMovementCells,
  getWhitePawnMovementCells
];

// Chaque pièce est un entier relatif
// Les pièces identiques noires et blanches ont la même valeur absolue
// NO_PIECE est 0, l'absence de pièce
// VOID est null, une case qui n'existe pas (OoB)
enum Piece {
  BLACK_KING_UNCHECKED = -7,
  BLACK_PAWN,
  BLACK_BISHOP,
  BLACK_KNIGHT,
  BLACK_ROOK,
  BLACK_QUEEN,
  BLACK_KING,
  NO_PIECE,
  WHITE_KING,
  WHITE_QUEEN,
  WHITE_ROOK,
  WHITE_KNIGHT,
  WHITE_BISHOP,
  WHITE_PAWN,
  WHITE_KING_UNCHECKED,
  VOID = null
}

let htmlGrid: HTMLDivElement = <HTMLDivElement>document.getElementById("grid");
let grid: number[][] = [];

let movingCell: number[] = [];
let currentPlayerTurn: number = WHITE_PLAYER;

// Génération de la grille de jeu logique
function generateGrid(grid: number[][]): void {
  for (let i: number = 0 ; i < GRID_SIDE ; i++) {
    grid.push([]);
    for (let j: number = 0 ; j < GRID_SIDE ; j++) {
      grid[i].push(0);
    }
  }
}

// Génération de la grille de jeu HTML
function generateHTMLGrid(htmlGrid:HTMLDivElement): void {
  for (let i: number = 0 ; i < GRID_SIDE ; i++) {
    let row: HTMLDivElement = document.createElement("div");
    row.classList.add(ROW_CLASS);
    for (let j: number = 0 ; j < GRID_SIDE ; j++) {
      let cell: HTMLDivElement = document.createElement("div");
      if ((i+j) % 2 == 0) {
        cell.classList.add(WHITE_CELL_CLASS);
      } else {
        cell.classList.add(BLACK_CELL_CLASS);
      }
      cell.classList.add(CELL_CLASS);
      cell.id = `${j},${i}`;
      cell.addEventListener("click", onCellClick);
      row.appendChild(cell);
    }
    htmlGrid.appendChild(row);
  }
}

// Reset du plateau de jeu logique et HTML à 0
function clearBoardState(grid: number[][]): void {
  for (let x: number = 0 ; x < GRID_SIDE ; x++) {
    for (let y: number = 0 ; y < GRID_SIDE ; y++) {
      grid[y][x] = 0;
      let cell = document.getElementById(convertCoordsToId([x, y]));
      cell.innerHTML = "";
    }
  }
}

// Placement des pièces pour un plateau de départ classique d'une partie d'échecs
function generateDefaultBoardState(grid: number[][]): void {
  clearBoardState(grid);

  initPieceTo(Piece.BLACK_ROOK, [0, 0]);
  initPieceTo(Piece.BLACK_ROOK, [7, 0]);

  initPieceTo(Piece.BLACK_KNIGHT, [1, 0]);
  initPieceTo(Piece.BLACK_KNIGHT, [6, 0]);

  initPieceTo(Piece.BLACK_BISHOP, [2, 0]);
  initPieceTo(Piece.BLACK_BISHOP, [5, 0]);

  initPieceTo(Piece.BLACK_QUEEN, [3, 0]);
  initPieceTo(Piece.BLACK_KING, [4, 0]);

  for (let i: number = 0 ; i < GRID_SIDE ; i++) {
    initPieceTo(Piece.BLACK_PAWN, [i, 1]);
  }

  initPieceTo(Piece.WHITE_ROOK, [0, 7]);
  initPieceTo(Piece.WHITE_ROOK, [7, 7]);

  initPieceTo(Piece.WHITE_KNIGHT, [1, 7]);
  initPieceTo(Piece.WHITE_KNIGHT, [6, 7]);

  initPieceTo(Piece.WHITE_BISHOP, [2, 7]);
  initPieceTo(Piece.WHITE_BISHOP, [5, 7]);

  initPieceTo(Piece.WHITE_QUEEN, [3, 7]);
  initPieceTo(Piece.WHITE_KING, [4, 7]);

  for (let i: number = 0 ; i < GRID_SIDE ; i++) {
    initPieceTo(Piece.WHITE_PAWN, [i, 6]);
  }

}

// Placement de pièces pour vérifier les mouvements du Roi
function generateKingTestBoardState(grid: number[][]): void {
  clearBoardState(grid);

  initPieceTo(Piece.WHITE_KING, [4, 4]);
  initPieceTo(Piece.WHITE_PAWN, [5, 4]);
  initPieceTo(Piece.BLACK_PAWN, [3, 3]);
}

// Placement de pièces pour vérifier les mouvements du Cavalier
function generateKnightTestBoardState(grid: number[][]): void {
  clearBoardState(grid);

  initPieceTo(Piece.WHITE_KNIGHT, [4, 4]);
  initPieceTo(Piece.WHITE_PAWN, [6, 3]);
  initPieceTo(Piece.BLACK_PAWN, [3, 6]);
  initPieceTo(Piece.BLACK_PAWN, [4, 5]);
  initPieceTo(Piece.BLACK_PAWN, [3, 5]);
}

// Placement de pièces pour vérifier les mouvements de la Tour
function generateRookTestBoardState(grid: number[][]): void {
  clearBoardState(grid);

  initPieceTo(Piece.WHITE_ROOK, [4, 4]);
  initPieceTo(Piece.WHITE_PAWN, [1, 4]);
  initPieceTo(Piece.BLACK_PAWN, [4, 2]);
}

// Placement de pièces pour vérifier les mouvements du Fou
function generateBishopTestBoardState(grid: number[][]): void {
  clearBoardState(grid);

  initPieceTo(Piece.WHITE_BISHOP, [4, 4]);
  initPieceTo(Piece.WHITE_PAWN, [2, 2]);
  initPieceTo(Piece.BLACK_PAWN, [5, 3]);
}

// Placement de pièces pour vérifier les mouvements de la Reine
function generateQueenTestBoardState(grid: number[][]): void {
  clearBoardState(grid);

  initPieceTo(Piece.WHITE_QUEEN, [4, 4]);
  initPieceTo(Piece.WHITE_PAWN, [2, 2]);
  initPieceTo(Piece.BLACK_PAWN, [5, 3]);
  initPieceTo(Piece.WHITE_PAWN, [1, 4]);
  initPieceTo(Piece.BLACK_PAWN, [4, 2]);
}

// Placement de pièces pour vérifier les mouvements du Roi avec prise en compte de l'échec
function generateUncheckedKingTestBoardState(grid: number[][]): void {
  clearBoardState(grid);

  initPieceTo(Piece.WHITE_KING, [4, 4]);
  initPieceTo(Piece.WHITE_PAWN, [5, 4]);
  initPieceTo(Piece.BLACK_ROOK, [3, 1]);
}
// Obtenir un id de case HTML à partir de coordonnées
function convertCoordsToId(coords: number[]): string {
  return `${coords[0]},${coords[1]}`;
}

// Obtenir des coordonnées à partir d'un id de case HTML
function convertIdToCoords(id: string) {
  return id.split(',').map(string => parseInt(string));
}

// Vérifier si les coordonnées correspondent bien à une case du plateau
function isInBounds(coords: number[]): boolean {
  return coords[0] >= 0 && coords[0] < GRID_SIDE && coords[1] >= 0 && coords[1] < GRID_SIDE;
}

// À partir d'une pièce logique, récupérer le joueur propriétaire de la pièce
function getPiecePlayer(pieceType: number): number {
  if (pieceType > 0) {
    return 1;
  } else if (pieceType < 0) {
    return 2;
  }
  return 0;
}

// À partir d'une pièce logique, récupérer la classe css de la couleur de la pièce
function getPieceColor(pieceType: number): string {
  return PIECE_COLOR_CLASS[getPiecePlayer(pieceType)];
}

// Récupérer la pièce logique aux coordonnées fournies en paramètre
// Si les coordonnées sont hors plateau, retourne VOID
function getPieceAt(coords: number[]): number {
  if (isInBounds(coords)) {
    return grid[coords[1]][coords[0]];
  } else {
    return Piece.VOID;
  }
}

// Récupère toutes les pièces logiques d'un joueur et leurs coordonnées
// Chaque entrée est sous la forme [x, y, pièce]
function getAllPlayerPiecesWithCoords(player: number): number[][] {
  let result: number[][] = [];

  for (let i: number = 0 ; i < GRID_SIDE ; i++) {
    for (let j: number = 0 ; j < GRID_SIDE ; j++) {
      let piece: number = getPieceAt([i, j]);
      if (getPiecePlayer(piece) == player) {
        result.push([i, j, piece]);
      }
    }
  }

  return result;
}

// Récupère toutes les cellules atteignables par un joueur
// Cela compte chaque cellule atteignable par chaque pièce du joueur
// Les doublons ne sont pas filtrés
function getAllPlayerReachableCellsCoords(player: number): number[][] {
  let result: number[][] = [];

  let allPlayerPiecesWithCoords: number[][] = getAllPlayerPiecesWithCoords(player);

  allPlayerPiecesWithCoords.forEach(pair => {
    result.push(...getCheckPieceMovementCells(pair[2], [pair[0], pair[1]]));
  });

  return result;
}

// Crée une pièce HTML à partir d'une pièce logique
function createHTMLPiece(pieceType: number): HTMLParagraphElement {
  let piece: HTMLParagraphElement = document.createElement("p");
  piece.classList.add(getPieceColor(pieceType));
  piece.classList.add(PIECE_CLASS);
  piece.innerHTML = CHESS_PIECES_CHARS[Math.abs(pieceType)];

  return piece;
}

// Place une pièce HTML aux coordonnées fournies
function setHTMLPieceTo(piece:HTMLParagraphElement, coords: number[]) {
  let cell: HTMLDivElement = <HTMLDivElement>document.getElementById(convertCoordsToId(coords));
  cell.appendChild(piece);
}

// Retire une pièce HTML (si elle existe) aux coordonnées fournies
function removeHTMLPieceFrom(piece:HTMLParagraphElement, coords: number[]): HTMLParagraphElement {
  if (!piece) {
    return;
  }

  let cell: HTMLDivElement = <HTMLDivElement>document.getElementById(convertCoordsToId(coords));
  return cell.removeChild(piece);
}

// Récupère la pièce HTML (si elle existe) aux coordonnées fournies
function getHTMLPieceAt(coords: number[]): HTMLParagraphElement {
  let cell: HTMLDivElement = <HTMLDivElement>document.getElementById(convertCoordsToId(coords));
  return <HTMLParagraphElement>cell.firstChild;
}

// Initialise une pièce logique et HTML aux coordonnées fournies
function initPieceTo(piece: number, coords: number[]): void {
  grid[coords[1]][coords[0]] = piece;
  let HTMLpiece: HTMLParagraphElement = createHTMLPiece(piece);
  setHTMLPieceTo(HTMLpiece, [coords[0], coords[1]]);
}

// Allume les cellules passées en paramètre
function lightCells(coords: number[][]): void {
  for (let i: number = 0 ; i < coords.length ; i++) {
    if (isInBounds(coords[i])) {
      lightCell(coords[i]);
    }
  }
}

// Allume une cellule passée en paramètre
function lightCell(coords: number[]): void {
  let cell: HTMLDivElement = <HTMLDivElement>document.getElementById(convertCoordsToId(coords));
  cell.classList.remove(BLACK_CELL_CLASS);
  cell.classList.remove(WHITE_CELL_CLASS);
  cell.classList.add(LIT_CELL_CLASS);
}

// Allume les cellules atteignables par la pièce logique passée en paramètre aux coordonnées fournies
function lightCellsPiece (piece: number, coords: number[]): void {
  lightCells(getPieceMovementCells(piece, coords));
}

// Récupère les cellules atteignables par la pièce logique passée en paramètre aux coordonnées fournies
function getPieceMovementCells(piece: number, coords: number[]): number[][] {
  let movementFcIndex: number = 0;
  let player: number = getPiecePlayer(piece);

  if (piece != Piece.BLACK_PAWN) {
    movementFcIndex = Math.abs(piece);
  }

  let result: number[][];

  // Cas particulier du déplacement du roi qui ne peut pas se déplacer sur une cellule checked
  if (movementFcIndex == Piece.WHITE_KING_UNCHECKED) {
    result = getUncheckedKingMovementCells(coords, getPiecePlayer(piece), getAllPlayerReachableCellsCoords(getOtherPlayer(player)));
  } else {
    result = LIGHT_PIECES_FC[movementFcIndex](coords, getPiecePlayer(piece));
  }

  return result;
}

// Récupère les cellules capturables par la pièce logique (ne sert que pour la simulation d'échec)
function getCheckPieceMovementCells(piece: number, coords: number[]): number[][] {
  let movementFcIndex: number = 0;
  let player: number = getPiecePlayer(piece);

  if (piece != Piece.BLACK_PAWN) {
    movementFcIndex = Math.abs(piece);
  }

  let result: number[][];

  if (Math.abs(piece) == Piece.WHITE_PAWN) {
    result = getCheckPawnMovementCells(coords, player);
  } else {
    result = getPieceMovementCells(piece, coords);
  }

  return result;
}

// Éteint toutes les cellules du plateau
function unlightAllCells(): void {
  for (let i: number = 0 ; i < GRID_SIDE ; i++) {
    for (let j: number = 0 ; j < GRID_SIDE ; j++) {
      let cellId: string = convertCoordsToId([i, j]);
      let cell: HTMLDivElement = <HTMLDivElement>document.getElementById(cellId);
      cell.classList.remove(LIT_CELL_CLASS);
      if ((i + j) % 2 == 0) {
        cell.classList.add(WHITE_CELL_CLASS);
      } else {
        cell.classList.add(BLACK_CELL_CLASS);
      }
    }
  }
}

// Change le tour de jeu
function changeTurn(): void {
  if (currentPlayerTurn == WHITE_PLAYER) {
    currentPlayerTurn = BLACK_PLAYER;
  } else {
    currentPlayerTurn = WHITE_PLAYER;
  }
}

// Récupère le numéro du joueur dont ce n'est pas le tour de jeu
function getOtherPlayer(player: number): number{
  if (player == WHITE_PLAYER) {
    return BLACK_PLAYER;
  } else {
    return WHITE_PLAYER;
  }
}

// Callback de l'événement click sur une cellule
function onCellClick(event) {
  // On clique sur une case vide, rien ne se passe
  if (!event.currentTarget.hasChildNodes() && !movingCell.length) {
    return
  }

  let coords: number[] = convertIdToCoords(event.currentTarget.id);
  let piece: number = grid[coords[1]][coords[0]];

  // Le joueur clique sur une de ses pièces
  // On éteint tout s'il avait déjà sélectionné une pièce
  // On met à jour la pièce sélectionnée, et on allume les cases potentielles de mouvement
  if (getPiecePlayer(piece) == currentPlayerTurn) {
    if (movingCell.length) {
      unlightAllCells();
    }
    movingCell = coords;
    // Convertit le roi en roi unchecked
    // Afin de n'afficher que les déplacements légaux du roi
    if (Math.abs(piece) == Piece.WHITE_KING) {
      piece *= Piece.WHITE_KING_UNCHECKED;
    }
    lightCellsPiece(piece, coords);
  } else {
    // Le joueur clique sur une case potentielle de mouvement
    // On déplace la pièce logique et HTML
    // On écrase ce qui se trouve à l'arrivée
    // On essaye de transformer un pion en reine si les conditions sont remplies
    // On change le tour de jeu

    if (event.currentTarget.classList.contains(LIT_CELL_CLASS)) {
      let movingPiece: number = grid[movingCell[1]][movingCell[0]];
      grid[coords[1]][coords[0]] = movingPiece;
      grid[movingCell[1]][movingCell[0]] = 0;
      removeHTMLPieceFrom(getHTMLPieceAt(coords), coords);
      let HTMLPiece: HTMLParagraphElement = removeHTMLPieceFrom(getHTMLPieceAt(movingCell), movingCell);
      setHTMLPieceTo(HTMLPiece, coords);

      tryPromotion(movingPiece, coords);

      changeTurn();
    }
    // Qu'il ait cliqué sur un mouvement ou dans le vide
    // On éteint tout et on retire la pièce sélectionnée

    unlightAllCells();
    movingCell = [];
  }
}

// Si un pion arrive au bout du chemin, il se transforme en reine
// On change la pièce logique et HTML
function tryPromotion(piece: number, coords: number[]): void{
  if (piece == Piece.WHITE_PAWN && coords[1] == WHITE_PROMOTION_ROW) {
    grid[coords[1]][coords[0]] = Piece.WHITE_QUEEN;
    let newQueen: HTMLParagraphElement = createHTMLPiece(Piece.WHITE_QUEEN);
    removeHTMLPieceFrom(getHTMLPieceAt(coords), coords);
    setHTMLPieceTo(newQueen, coords);

  } else if (piece == Piece.BLACK_PAWN && coords[1] == BLACK_PROMOTION_ROW) {
    grid[coords[1]][coords[0]] = Piece.BLACK_QUEEN;
    let newQueen: HTMLParagraphElement = createHTMLPiece(Piece.BLACK_QUEEN);
    removeHTMLPieceFrom(getHTMLPieceAt(coords), coords);
    setHTMLPieceTo(newQueen, coords);
  }
}

// On retourne uniquement les cases où le pion peut théoriquement prendre une pièce
// Uniquement utilisé dans la vérification d'échec
function getCheckPawnMovementCells(coords: number[], player: number): number[][] {
  let result: number[][] = [];

  let playerDirection = player - getOtherPlayer(player);
  for (let i: number = -1 ; i < 2 ; i+= 2) {
    if (getPieceAt([coords[0] + i, coords[1] + playerDirection]) != Piece.VOID) {
      result.push([coords[0] + i, coords[1] + playerDirection]);
    }
  }

  return result;
}

// On retourne toutes les cases accessibles à un pion blanc sur les coordonnées fournies
function getWhitePawnMovementCells(coords: number[]): number[][] {
  let result: number[][] = [];

  if (getPieceAt([coords[0], coords[1] - 1]) == Piece.NO_PIECE) {
    result.push([coords[0], coords[1] - 1]);
  }

  if (coords[1] == WHITE_PAWN_START_Y) {
    if (getPieceAt([coords[0], coords[1] - 2]) == Piece.NO_PIECE) {
      result.push([coords[0], coords[1] - 2]);
    }
  }

  for (let i: number = -1 ; i < 2 ; i += 2) {
    let diagonalCoords: number[] = [coords[0] + i, coords[1] - 1];
    let pieceAtDiagonalCoords: number = getPieceAt(diagonalCoords);

    if (getPiecePlayer(pieceAtDiagonalCoords) == BLACK_PLAYER) {
      result.push(diagonalCoords);
    }
  }

  return result;
}

// On retourne toutes les cases accessibles à un pion noir sur les coordonnées fournies
function getBlackPawnMovementCells(coords: number[]): number[][] {
  let result: number[][] = [];

  if (getPieceAt([coords[0], coords[1] + 1]) == Piece.NO_PIECE) {
    result.push([coords[0], coords[1] + 1]);
  }

  if (coords[1] == BLACK_PAWN_START_Y) {
    if (getPieceAt([coords[0], coords[1] + 2]) == Piece.NO_PIECE) {
      result.push([coords[0], coords[1] + 2]);
    }
  }

  for (let i: number = -1 ; i < 2 ; i += 2) {
    let diagonalCoords: number[] = [coords[0] + i, coords[1] + 1];
    let pieceAtDiagonalCoords: number = getPieceAt(diagonalCoords);

    if (getPiecePlayer(pieceAtDiagonalCoords) == WHITE_PLAYER) {
      result.push(diagonalCoords);
    }
  }

  return result;
}

// On retourne toutes les cases accessibles à un roi sur les coordonnées fournies
// Nous ne prenons pas en compte l'échec éventuel du roi dans nos déplacements
function getKingMovementCells(coords: number[], player: number): number[][] {
  let result: number[][] = [];
  for (let j = -1; j < 2; j++) {
    for (let i = -1; i < 2; i++) {
      let rangeKing: number[] = [coords[0] + j, coords[1] + i];
      let repasDuKing: number = getPieceAt(rangeKing);
      if (repasDuKing == Piece.NO_PIECE || getPiecePlayer(repasDuKing) == getOtherPlayer(player) ) {
          result.push([coords[0] + j, coords[1] + i]);
      }
    }

}

  return result;
}

// On retourne toutes les cases accessibles à un cavalier sur les coordonnées fournies
function getKnightMovementCells(coords: number[], player: number): number[][] {
  let result: number[][] = [];
  for (let j = -2; j < 3; j++) {
    for (let i = -2; i < 3; i++) {
      let somme :number = Math.pow(j,2) + Math.pow(i,2);
      if (somme == 5) {

        let rangeChevalier: number[] = [coords[0] + j, coords[1] + i];
        let repasDuChevalier: number = getPieceAt(rangeChevalier);
        if (repasDuChevalier == Piece.NO_PIECE || getPiecePlayer(repasDuChevalier) == getOtherPlayer(player)) {
              result.push(rangeChevalier);
          }
        }
    }
  }
  return result;
}

// On retourne toutes les cases accessibles à une tour sur les coordonnées fournies
function getRookMovementCells(coords: number[], player: number): number[][] {
  let result: number[][] = [];
  let obstacle:boolean = false
  let obstacle1:boolean = false;
  let i = 1;
  while (obstacle == false && obstacle1 == false ) {
    if (getPiecePlayer(getPieceAt([coords[0],coords[1]-i])) == player) {
        obstacle = true;
    }
    if  (getPiecePlayer(getPieceAt([coords[0]-i,coords[1]]) == player)) {
        obstacle1 = true;
    }
    if (getPiecePlayer(getPieceAt([coords[0],coords[1]-i]) == getOtherPlayer(player))) {
      result.push([coords[0],coords[1]-i])
      obstacle = true;
    }
    if (getPiecePlayer(getPieceAt([coords[0]-i,coords[1]]) == getOtherPlayer(player))) {
      result.push([coords[0]-i,coords[1]]);
      obstacle1 = true;
    }
    if(obstacle == false  ){
      let rangeTour:number[] = [coords[0],coords[1]-i];
      result.push(rangeTour);
    }
    if(obstacle1 == false){
      let rangeTourlateral: number[] = [coords[0]-i,coords[1]]
      result.push(rangeTourlateral);
    }
    i++;
  }
  return result;
}
// On retourne toutes les cases accessibles à un fou sur les coordonnées fournies
function getBishopMovementCells(coords: number[], player: number): number[][] {
  let result: number[][] = [];
  return result;
}

// On retourne toutes les cases accessibles à une reine sur les coordonnées fournies
function getQueenMovementCells(coords: number[], player: number): number[][] {
  let result: number[][] = [];

  return result;
}

// On retourne toutes les cases accessibles à un roi sur les coordonnées fournies
// Nous filtrons ici les cases où le roi serait en échec
function getUncheckedKingMovementCells(coords: number[], player: number, checkedCells: number[][]): number[][] {
  let result: number[][] = [];

  result = getKingMovementCells(coords, player);

  return result;
}

// Génération de grille et lancement d'une partie
generateGrid(grid);
generateHTMLGrid(htmlGrid);
generateDefaultBoardState(grid);
