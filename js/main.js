//Modle
var gBoard;

var gEmptyCellsOpen;
var gFlagCount;
const EMPTY = '';
const FLAG = '🚩';
const MINE = '💥';

var cell = {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false
}

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function initGame() {
    gEmptyCellsOpen = 0;
    gFlagCount = 0;
    gBoard = buildBoard();
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    document.querySelector('.mes').innerText = '';
};

function buildBoard() {
    var board = createMat(gLevel.SIZE, gLevel.SIZE);
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    for (let i = 0; i < gLevel.MINES; i++) {
        board[getRandomInt(0, board.length)][getRandomInt(0, board.length)].isMine = true;
    }
    // board[0][0].isMine = true;
    // board[0][3].isMine = true;

    return board
}

function switchLevel(size, mines) {
    gLevel.SIZE = size;
    gLevel.MINES = mines;
    initGame()
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            currCell.minesAroundCount = countNeighbors(i, j, board)
        }
    }
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellId = getIdName({ i: i, j: j })

            strHTML += `\t<td class="cell" id="${cellId}" oncontextmenu="cellMarked(this)" onclick="cellClicked(this,${i},${j})" data-negs-count=${currCell.minesAroundCount}>\n`;
            strHTML += EMPTY;
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function cellClicked(elCell, i, j) {
    timer()
    var currCell = gBoard[i][j]
    if (currCell.isMarked) return
    if (currCell.isShown) return
    currCell.isShown = true
    if (currCell.isMine) {
        revealAllMine(gBoard)
        GameOver('Loser');
    } else {
        if (currCell.minesAroundCount) openCell(elCell);
        else {
            openCell(elCell);
            expandShown(gBoard, elCell, i, j)
        }
        checkGameOver()
    }
}

function cellMarked(elCell) {
    timer()
    var cellLoction = getCellCoord(elCell.id)
    var cellModle = gBoard[cellLoction.i][cellLoction.j]
    cellModle.isMarked = !cellModle.isMarked;
    elCell.innerText = cellModle.isMarked ? FLAG : ' ';
    gFlagCount++
    checkGameOver()
}

function checkGameOver() {
    if (gEmptyCellsOpen === gLevel.SIZE ** 2 - gLevel.MINES && gFlagCount === gLevel.MINES) GameOver('Winer');
}

function expandShown(board, elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            var el = document.querySelector('#' + getIdName({ i: i, j: j }));
            if (!board[i][j].isShown) openCell(el);
            board[i][j].isShown = true
        }
    }
}

function GameOver(mes) {
    gGame.isOn = false;
    document.querySelector('.mes').innerText = mes;
}

function timer() {
    if (!gGame.isOn) {
        gGame.isOn = true;
        startTimer(Date.now());
    }
}

function getCellCoord(strCellId) {
    var coord = {};
    var parts = strCellId.split('-'); // [cell,'2','7']
    coord.i = +parts[1] // 2
    coord.j = +parts[2]; // 7
    return coord; // {i:2 , j:7}
}

function revealAllMine(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                renderCell({ i: i, j: j }, MINE)
            }
        }
    }
}

function openCell(currCell) {
    currCell.classList.add('open')
    if (currCell.dataset.negsCount !== '0') currCell.innerText = currCell.dataset.negsCount
    gEmptyCellsOpen++;
}
window.addEventListener("contextmenu", e => e.preventDefault());