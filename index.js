var GRID_SIDE = 8;
var WHITE_PAWN_START_Y = 6;
var BLACK_PAWN_START_Y = 1;
var WHITE_PROMOTION_ROW = 0;
var BLACK_PROMOTION_ROW = 7;
var WHITE_PLAYER = 1;
var BLACK_PLAYER = 2;
var BLACK_CELL_CLASS = "blackCell";
var WHITE_CELL_CLASS = "whiteCell";
var LIT_CELL_CLASS = "litCell";
var CELL_CLASS = "cell";
var ROW_CLASS = "row";
var PIECE_CLASS = "piece";
var PIECE_COLOR_CLASS = [, "whitePiece", "blackPiece"];
var CHESS_PIECES_CHARS = [, "K", "Q", "R", "N", "B", "P"];
// Les fonctions qui seront appelées pour récupérer les cases à allumer
var LIGHT_PIECES_FC = [
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
var Piece;
(function (Piece) {
    Piece[Piece["BLACK_KING_UNCHECKED"] = -7] = "BLACK_KING_UNCHECKED";
    Piece[Piece["BLACK_PAWN"] = -6] = "BLACK_PAWN";
    Piece[Piece["BLACK_BISHOP"] = -5] = "BLACK_BISHOP";
    Piece[Piece["BLACK_KNIGHT"] = -4] = "BLACK_KNIGHT";
    Piece[Piece["BLACK_ROOK"] = -3] = "BLACK_ROOK";
    Piece[Piece["BLACK_QUEEN"] = -2] = "BLACK_QUEEN";
    Piece[Piece["BLACK_KING"] = -1] = "BLACK_KING";
    Piece[Piece["NO_PIECE"] = 0] = "NO_PIECE";
    Piece[Piece["WHITE_KING"] = 1] = "WHITE_KING";
    Piece[Piece["WHITE_QUEEN"] = 2] = "WHITE_QUEEN";
    Piece[Piece["WHITE_ROOK"] = 3] = "WHITE_ROOK";
    Piece[Piece["WHITE_KNIGHT"] = 4] = "WHITE_KNIGHT";
    Piece[Piece["WHITE_BISHOP"] = 5] = "WHITE_BISHOP";
    Piece[Piece["WHITE_PAWN"] = 6] = "WHITE_PAWN";
    Piece[Piece["WHITE_KING_UNCHECKED"] = 7] = "WHITE_KING_UNCHECKED";
    Piece[Piece["VOID"] = null] = "VOID";
})(Piece || (Piece = {}));
var htmlGrid = document.getElementById("grid");
var grid = [];
var movingCell = [];
var currentPlayerTurn = WHITE_PLAYER;
// Génération de la grille de jeu logique
function generateGrid(grid) {
    for (var i = 0; i < GRID_SIDE; i++) {
        grid.push([]);
        for (var j = 0; j < GRID_SIDE; j++) {
            grid[i].push(0);
        }
    }
}
// Génération de la grille de jeu HTML
function generateHTMLGrid(htmlGrid) {
    for (var i = 0; i < GRID_SIDE; i++) {
        var row = document.createElement("div");
        row.classList.add(ROW_CLASS);
        for (var j = 0; j < GRID_SIDE; j++) {
            var cell = document.createElement("div");
            if ((i + j) % 2 == 0) {
                cell.classList.add(WHITE_CELL_CLASS);
            }
            else {
                cell.classList.add(BLACK_CELL_CLASS);
            }
            cell.classList.add(CELL_CLASS);
            cell.id = j + "," + i;
            cell.addEventListener("click", onCellClick);
            row.appendChild(cell);
        }
        htmlGrid.appendChild(row);
    }
}
// Reset du plateau de jeu logique et HTML à 0
function clearBoardState(grid) {
    for (var x = 0; x < GRID_SIDE; x++) {
        for (var y = 0; y < GRID_SIDE; y++) {
            grid[y][x] = 0;
            var cell = document.getElementById(convertCoordsToId([x, y]));
            cell.innerHTML = "";
        }
    }
}
// Placement des pièces pour un plateau de départ classique d'une partie d'échecs
function generateDefaultBoardState(grid) {
    clearBoardState(grid);
    initPieceTo(Piece.BLACK_ROOK, [0, 0]);
    initPieceTo(Piece.BLACK_ROOK, [7, 0]);
    initPieceTo(Piece.BLACK_KNIGHT, [1, 0]);
    initPieceTo(Piece.BLACK_KNIGHT, [6, 0]);
    initPieceTo(Piece.BLACK_BISHOP, [2, 0]);
    initPieceTo(Piece.BLACK_BISHOP, [5, 0]);
    initPieceTo(Piece.BLACK_QUEEN, [3, 0]);
    initPieceTo(Piece.BLACK_KING, [4, 0]);
    for (var i = 0; i < GRID_SIDE; i++) {
        initPieceTo(Piece.BLACK_PAWN, [i, 1]);
    }
    initPieceTo(Piece.WHITE_ROOK, [3, 3]);
    initPieceTo(Piece.WHITE_ROOK, [7, 7]);
    initPieceTo(Piece.WHITE_KNIGHT, [1, 7]);
    initPieceTo(Piece.WHITE_KNIGHT, [6, 7]);
    initPieceTo(Piece.WHITE_BISHOP, [2, 7]);
    initPieceTo(Piece.WHITE_BISHOP, [5, 7]);
    initPieceTo(Piece.WHITE_QUEEN, [3, 7]);
    initPieceTo(Piece.WHITE_KING, [4, 7]);
    for (var i = 0; i < GRID_SIDE; i++) {
        initPieceTo(Piece.WHITE_PAWN, [i, 6]);
    }
}
// Placement de pièces pour vérifier les mouvements du Roi
function generateKingTestBoardState(grid) {
    clearBoardState(grid);
    initPieceTo(Piece.WHITE_KING, [4, 4]);
    initPieceTo(Piece.WHITE_PAWN, [5, 4]);
    initPieceTo(Piece.BLACK_PAWN, [3, 3]);
}
// Placement de pièces pour vérifier les mouvements du Cavalier
function generateKnightTestBoardState(grid) {
    clearBoardState(grid);
    initPieceTo(Piece.WHITE_KNIGHT, [4, 4]);
    initPieceTo(Piece.WHITE_PAWN, [6, 3]);
    initPieceTo(Piece.BLACK_PAWN, [3, 6]);
    initPieceTo(Piece.BLACK_PAWN, [4, 5]);
    initPieceTo(Piece.BLACK_PAWN, [3, 5]);
}
// Placement de pièces pour vérifier les mouvements de la Tour
function generateRookTestBoardState(grid) {
    clearBoardState(grid);
    initPieceTo(Piece.WHITE_ROOK, [4, 4]);
    initPieceTo(Piece.WHITE_PAWN, [1, 4]);
    initPieceTo(Piece.BLACK_PAWN, [4, 2]);
}
// Placement de pièces pour vérifier les mouvements du Fou
function generateBishopTestBoardState(grid) {
    clearBoardState(grid);
    initPieceTo(Piece.WHITE_BISHOP, [4, 4]);
    initPieceTo(Piece.WHITE_PAWN, [2, 2]);
    initPieceTo(Piece.BLACK_PAWN, [5, 3]);
}
// Placement de pièces pour vérifier les mouvements de la Reine
function generateQueenTestBoardState(grid) {
    clearBoardState(grid);
    initPieceTo(Piece.WHITE_QUEEN, [4, 4]);
    initPieceTo(Piece.WHITE_PAWN, [2, 2]);
    initPieceTo(Piece.BLACK_PAWN, [5, 3]);
    initPieceTo(Piece.WHITE_PAWN, [1, 4]);
    initPieceTo(Piece.BLACK_PAWN, [4, 2]);
}
// Placement de pièces pour vérifier les mouvements du Roi avec prise en compte de l'échec
function generateUncheckedKingTestBoardState(grid) {
    clearBoardState(grid);
    initPieceTo(Piece.WHITE_KING, [4, 4]);
    initPieceTo(Piece.WHITE_PAWN, [5, 4]);
    initPieceTo(Piece.BLACK_ROOK, [3, 1]);
}
// Obtenir un id de case HTML à partir de coordonnées
function convertCoordsToId(coords) {
    return coords[0] + "," + coords[1];
}
// Obtenir des coordonnées à partir d'un id de case HTML
function convertIdToCoords(id) {
    return id.split(',').map(function (string) { return parseInt(string); });
}
// Vérifier si les coordonnées correspondent bien à une case du plateau
function isInBounds(coords) {
    return coords[0] >= 0 && coords[0] < GRID_SIDE && coords[1] >= 0 && coords[1] < GRID_SIDE;
}
// À partir d'une pièce logique, récupérer le joueur propriétaire de la pièce
function getPiecePlayer(pieceType) {
    if (pieceType > 0) {
        return 1;
    }
    else if (pieceType < 0) {
        return 2;
    }
    return 0;
}
// À partir d'une pièce logique, récupérer la classe css de la couleur de la pièce
function getPieceColor(pieceType) {
    return PIECE_COLOR_CLASS[getPiecePlayer(pieceType)];
}
// Récupérer la pièce logique aux coordonnées fournies en paramètre
// Si les coordonnées sont hors plateau, retourne VOID
function getPieceAt(coords) {
    if (isInBounds(coords)) {
        return grid[coords[1]][coords[0]];
    }
    else {
        return Piece.VOID;
    }
}
// Récupère toutes les pièces logiques d'un joueur et leurs coordonnées
// Chaque entrée est sous la forme [x, y, pièce]
function getAllPlayerPiecesWithCoords(player) {
    var result = [];
    for (var i = 0; i < GRID_SIDE; i++) {
        for (var j = 0; j < GRID_SIDE; j++) {
            var piece = getPieceAt([i, j]);
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
function getAllPlayerReachableCellsCoords(player) {
    var result = [];
    var allPlayerPiecesWithCoords = getAllPlayerPiecesWithCoords(player);
    allPlayerPiecesWithCoords.forEach(function (pair) {
        result.push.apply(result, getCheckPieceMovementCells(pair[2], [pair[0], pair[1]]));
    });
    return result;
}
// Crée une pièce HTML à partir d'une pièce logique
function createHTMLPiece(pieceType) {
    var piece = document.createElement("p");
    piece.classList.add(getPieceColor(pieceType));
    piece.classList.add(PIECE_CLASS);
    piece.innerHTML = CHESS_PIECES_CHARS[Math.abs(pieceType)];
    return piece;
}
// Place une pièce HTML aux coordonnées fournies
function setHTMLPieceTo(piece, coords) {
    var cell = document.getElementById(convertCoordsToId(coords));
    cell.appendChild(piece);
}
// Retire une pièce HTML (si elle existe) aux coordonnées fournies
function removeHTMLPieceFrom(piece, coords) {
    if (!piece) {
        return;
    }
    var cell = document.getElementById(convertCoordsToId(coords));
    return cell.removeChild(piece);
}
// Récupère la pièce HTML (si elle existe) aux coordonnées fournies
function getHTMLPieceAt(coords) {
    var cell = document.getElementById(convertCoordsToId(coords));
    return cell.firstChild;
}
// Initialise une pièce logique et HTML aux coordonnées fournies
function initPieceTo(piece, coords) {
    grid[coords[1]][coords[0]] = piece;
    var HTMLpiece = createHTMLPiece(piece);
    setHTMLPieceTo(HTMLpiece, [coords[0], coords[1]]);
}
// Allume les cellules passées en paramètre
function lightCells(coords) {
    for (var i = 0; i < coords.length; i++) {
        if (isInBounds(coords[i])) {
            lightCell(coords[i]);
        }
    }
}
// Allume une cellule passée en paramètre
function lightCell(coords) {
    var cell = document.getElementById(convertCoordsToId(coords));
    cell.classList.remove(BLACK_CELL_CLASS);
    cell.classList.remove(WHITE_CELL_CLASS);
    cell.classList.add(LIT_CELL_CLASS);
}
// Allume les cellules atteignables par la pièce logique passée en paramètre aux coordonnées fournies
function lightCellsPiece(piece, coords) {
    lightCells(getPieceMovementCells(piece, coords));
}
// Récupère les cellules atteignables par la pièce logique passée en paramètre aux coordonnées fournies
function getPieceMovementCells(piece, coords) {
    var movementFcIndex = 0;
    var player = getPiecePlayer(piece);
    if (piece != Piece.BLACK_PAWN) {
        movementFcIndex = Math.abs(piece);
    }
    var result;
    // Cas particulier du déplacement du roi qui ne peut pas se déplacer sur une cellule checked
    if (movementFcIndex == Piece.WHITE_KING_UNCHECKED) {
        result = getUncheckedKingMovementCells(coords, getPiecePlayer(piece), getAllPlayerReachableCellsCoords(getOtherPlayer(player)));
    }
    else {
        result = LIGHT_PIECES_FC[movementFcIndex](coords, getPiecePlayer(piece));
    }
    return result;
}
// Récupère les cellules capturables par la pièce logique (ne sert que pour la simulation d'échec)
function getCheckPieceMovementCells(piece, coords) {
    var movementFcIndex = 0;
    var player = getPiecePlayer(piece);
    if (piece != Piece.BLACK_PAWN) {
        movementFcIndex = Math.abs(piece);
    }
    var result;
    if (Math.abs(piece) == Piece.WHITE_PAWN) {
        result = getCheckPawnMovementCells(coords, player);
    }
    else {
        result = getPieceMovementCells(piece, coords);
    }
    return result;
}
// Éteint toutes les cellules du plateau
function unlightAllCells() {
    for (var i = 0; i < GRID_SIDE; i++) {
        for (var j = 0; j < GRID_SIDE; j++) {
            var cellId = convertCoordsToId([i, j]);
            var cell = document.getElementById(cellId);
            cell.classList.remove(LIT_CELL_CLASS);
            if ((i + j) % 2 == 0) {
                cell.classList.add(WHITE_CELL_CLASS);
            }
            else {
                cell.classList.add(BLACK_CELL_CLASS);
            }
        }
    }
}
// Change le tour de jeu
function changeTurn() {
    if (currentPlayerTurn == WHITE_PLAYER) {
        currentPlayerTurn = BLACK_PLAYER;
    }
    else {
        currentPlayerTurn = WHITE_PLAYER;
    }
}
// Récupère le numéro du joueur dont ce n'est pas le tour de jeu
function getOtherPlayer(player) {
    if (player == WHITE_PLAYER) {
        return BLACK_PLAYER;
    }
    else {
        return WHITE_PLAYER;
    }
}
// Callback de l'événement click sur une cellule
function onCellClick(event) {
    // On clique sur une case vide, rien ne se passe
    if (!event.currentTarget.hasChildNodes() && !movingCell.length) {
        return;
    }
    var coords = convertIdToCoords(event.currentTarget.id);
    var piece = grid[coords[1]][coords[0]];
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
    }
    else {
        // Le joueur clique sur une case potentielle de mouvement
        // On déplace la pièce logique et HTML
        // On écrase ce qui se trouve à l'arrivée
        // On essaye de transformer un pion en reine si les conditions sont remplies
        // On change le tour de jeu
        if (event.currentTarget.classList.contains(LIT_CELL_CLASS)) {
            var movingPiece = grid[movingCell[1]][movingCell[0]];
            grid[coords[1]][coords[0]] = movingPiece;
            grid[movingCell[1]][movingCell[0]] = 0;
            removeHTMLPieceFrom(getHTMLPieceAt(coords), coords);
            var HTMLPiece = removeHTMLPieceFrom(getHTMLPieceAt(movingCell), movingCell);
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
function tryPromotion(piece, coords) {
    if (piece == Piece.WHITE_PAWN && coords[1] == WHITE_PROMOTION_ROW) {
        grid[coords[1]][coords[0]] = Piece.WHITE_QUEEN;
        var newQueen = createHTMLPiece(Piece.WHITE_QUEEN);
        removeHTMLPieceFrom(getHTMLPieceAt(coords), coords);
        setHTMLPieceTo(newQueen, coords);
    }
    else if (piece == Piece.BLACK_PAWN && coords[1] == BLACK_PROMOTION_ROW) {
        grid[coords[1]][coords[0]] = Piece.BLACK_QUEEN;
        var newQueen = createHTMLPiece(Piece.BLACK_QUEEN);
        removeHTMLPieceFrom(getHTMLPieceAt(coords), coords);
        setHTMLPieceTo(newQueen, coords);
    }
}
// On retourne uniquement les cases où le pion peut théoriquement prendre une pièce
// Uniquement utilisé dans la vérification d'échec
function getCheckPawnMovementCells(coords, player) {
    var result = [];
    var playerDirection = player - getOtherPlayer(player);
    for (var i = -1; i < 2; i += 2) {
        if (getPieceAt([coords[0] + i, coords[1] + playerDirection]) != Piece.VOID) {
            result.push([coords[0] + i, coords[1] + playerDirection]);
        }
    }
    return result;
}
// On retourne toutes les cases accessibles à un pion blanc sur les coordonnées fournies
function getWhitePawnMovementCells(coords) {
    var result = [];
    if (getPieceAt([coords[0], coords[1] - 1]) == Piece.NO_PIECE) {
        result.push([coords[0], coords[1] - 1]);
    }
    if (coords[1] == WHITE_PAWN_START_Y) {
        if (getPieceAt([coords[0], coords[1] - 2]) == Piece.NO_PIECE) {
            result.push([coords[0], coords[1] - 2]);
        }
    }
    for (var i = -1; i < 2; i += 2) {
        var diagonalCoords = [coords[0] + i, coords[1] - 1];
        var pieceAtDiagonalCoords = getPieceAt(diagonalCoords);
        if (getPiecePlayer(pieceAtDiagonalCoords) == BLACK_PLAYER) {
            result.push(diagonalCoords);
        }
    }
    return result;
}
// On retourne toutes les cases accessibles à un pion noir sur les coordonnées fournies
function getBlackPawnMovementCells(coords) {
    var result = [];
    if (getPieceAt([coords[0], coords[1] + 1]) == Piece.NO_PIECE) {
        result.push([coords[0], coords[1] + 1]);
    }
    if (coords[1] == BLACK_PAWN_START_Y) {
        if (getPieceAt([coords[0], coords[1] + 2]) == Piece.NO_PIECE) {
            result.push([coords[0], coords[1] + 2]);
        }
    }
    for (var i = -1; i < 2; i += 2) {
        var diagonalCoords = [coords[0] + i, coords[1] + 1];
        var pieceAtDiagonalCoords = getPieceAt(diagonalCoords);
        if (getPiecePlayer(pieceAtDiagonalCoords) == WHITE_PLAYER) {
            result.push(diagonalCoords);
        }
    }
    return result;
}
// On retourne toutes les cases accessibles à un roi sur les coordonnées fournies
// Nous ne prenons pas en compte l'échec éventuel du roi dans nos déplacements
function getKingMovementCells(coords, player) {
    var result = [];
    for (var j = -1; j < 2; j++) {
        for (var i = -1; i < 2; i++) {
            var rangeKing = [coords[0] + j, coords[1] + i];
            var repasDuKing = getPieceAt(rangeKing);
            if (repasDuKing == Piece.NO_PIECE || getPiecePlayer(repasDuKing) == getOtherPlayer(player)) {
                result.push([coords[0] + j, coords[1] + i]);
            }
        }
    }
    return result;
}
// On retourne toutes les cases accessibles à un cavalier sur les coordonnées fournies
function getKnightMovementCells(coords, player) {
    var result = [];
    for (var j = -2; j < 3; j++) {
        for (var i = -2; i < 3; i++) {
            var somme = Math.pow(j, 2) + Math.pow(i, 2);
            if (somme == 5) {
                var rangeChevalier = [coords[0] + j, coords[1] + i];
                var repasDuChevalier = getPieceAt(rangeChevalier);
                if (repasDuChevalier == Piece.NO_PIECE || getPiecePlayer(repasDuChevalier) == getOtherPlayer(player)) {
                    result.push(rangeChevalier);
                }
            }
        }
    }
    return result;
}
// On retourne toutes les cases accessibles à une tour sur les coordonnées fournies
function getRookMovementCells(coords, player) {
    var result = [];
    var obstacle = false;
    var obstacle1 = false;
    var obstacle2 = false;
    var obstacle3 = false;
    var i = 1;

    while ( obstacle1 == false || obstacle3 == false || obstacle2 == false || obstacle == false ) {

        if (getPiecePlayer(getPieceAt([coords[0] - i, coords[1]])) == player) {
            obstacle = true;
        }
        if (getPiecePlayer(getPieceAt([coords[0] + i, coords[1]])) == player) {
            obstacle2 = true;
        }
        if (getPiecePlayer(getPieceAt([coords[0] , coords[1] - i])) == player ) {
            obstacle1 = true;
        }
        if (getPiecePlayer(getPieceAt([coords[0] , coords[1] + i])) == player) {
            obstacle3 = true;
        }

        if (getPiecePlayer(getPieceAt([coords[0] - i, coords[1]])) == getOtherPlayer(player) && obstacle == false) {
            result.push([coords[0] - i, coords[1]]);
            obstacle = true;
        }
        if (getPiecePlayer(getPieceAt([coords[0] + i, coords[1]])) == getOtherPlayer(player) && obstacle2 == false) {
            result.push([coords[0] + i, coords[1] ]);
            obstacle2 = true;
        }
        if (getPiecePlayer(getPieceAt([coords[0], coords[1]  - i])) == getOtherPlayer(player) && obstacle1 == false) {
            result.push([coords[0], coords[1]  - i]);
            obstacle1 = true;
        }
        if (getPiecePlayer(getPieceAt([coords[0], coords[1] + i])) == getOtherPlayer(player) && obstacle3 == false) {
            result.push([coords[0] , coords[1] + i]);
            obstacle3 = true;
        }


        if (obstacle == false) {
            var rangeTourlateral = [coords[0] - i, coords[1]];
            result.push(rangeTourlateral);
        }
        if (obstacle2 == false) {
            var rangeTourlateral = [coords[0] + i, coords[1]];
            result.push(rangeTourlateral);
        }
        if (obstacle1 == false) {
            var rangeTourlateral = [coords[0] , coords[1]- i];
            result.push(rangeTourlateral);
        }
        if (obstacle3 == false) {
            var rangeTourlateral = [coords[0] , coords[1] + i];
            result.push(rangeTourlateral);
        }

        i++;
        if (i == 8) {
            obstacle = true;
            obstacle1 = true;
            obstacle2 = true;
            obstacle3 = true;
        }
    }
    return result;
}
// On retourne toutes les cases accessibles à un fou sur les coordonnées fournies
function getBishopMovementCells(coords, player) {
    var result = [];
    var obstacle = false;
    var obstacle1 = false;
    var obstacle2 = false;
    var obstacle3 = false;
    var i = 1;

    while ( obstacle1 == false || obstacle3 == false || obstacle2 == false || obstacle == false ) {

        if (getPiecePlayer(getPieceAt([coords[0] - i, coords[1] -i])) == player) {
            obstacle = true;
        }
        if (getPiecePlayer(getPieceAt([coords[0] + i, coords[1] + i])) == player) {
            obstacle2 = true;
        }
        if (getPiecePlayer(getPieceAt([coords[0] - i , coords[1] + i])) == player ) {
            obstacle1 = true;
        }
        if (getPiecePlayer(getPieceAt([coords[0] +i, coords[1] - i])) == player) {
            obstacle3 = true;
        }

        if (getPiecePlayer(getPieceAt([coords[0] - i, coords[1] -i])) == getOtherPlayer(player)  && obstacle == false) {
            result.push([coords[0] - i, coords[1] - i]);
            obstacle = true;
        }
        if (getPiecePlayer(getPieceAt([coords[0] + i, coords[1] + i])) == getOtherPlayer(player) && obstacle2 == false) {
            result.push([coords[0] + i, coords[1] + i ]);
            obstacle2 = true;
        }
        if (getPiecePlayer(getPieceAt([coords[0] - i, coords[1]  + i])) == getOtherPlayer(player) && obstacle1 == false) {
            result.push([coords[0] - i, coords[1] + i]);
            obstacle1 = true;
        }
        if (getPiecePlayer(getPieceAt([coords[0] + i, coords[1] - i])) == getOtherPlayer(player) && obstacle3 == false) {
            result.push([coords[0] + i , coords[1] - i]);
            obstacle3 = true;
        }


        if (obstacle == false) {
            var rangeTourlateral = [coords[0] - i, coords[1]-i];
            result.push(rangeTourlateral);
        }
        if (obstacle2 == false) {
            var rangeTourlateral = [coords[0] + i, coords[1]+i];
            result.push(rangeTourlateral);
        }
        if (obstacle1 == false) {
            var rangeTourlateral = [coords[0]- i , coords[1]+ i];
            result.push(rangeTourlateral);
        }
        if (obstacle3 == false) {
            var rangeTourlateral = [coords[0]+ i , coords[1] -i ];
            result.push(rangeTourlateral);
        }

        i++;
        if (i == 8) {
            obstacle = true;
            obstacle1 = true;
            obstacle2 = true;
            obstacle3 = true;
        }
    }

    return result;
}
// On retourne toutes les cases accessibles à une reine sur les coordonnées fournies
function getQueenMovementCells(coords, player) {
    var result = [];
    return result;
}
// On retourne toutes les cases accessibles à un roi sur les coordonnées fournies
// Nous filtrons ici les cases où le roi serait en échec
function getUncheckedKingMovementCells(coords, player, checkedCells) {
    var result = [];
    result = getKingMovementCells(coords, player);
    return result;
}
// Génération de grille et lancement d'une partie
generateGrid(grid);
generateHTMLGrid(htmlGrid);
generateDefaultBoardState(grid);
