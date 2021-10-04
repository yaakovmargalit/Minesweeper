//Modle
var gBoard;
const EMPTY = ' ';
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
    gBoard = buildBoard();
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    console.log(gBoard)

};

function buildBoard() {
    var board = createMat(4, 4);
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
    board[getRandomInt(0, board.length)][getRandomInt(0, board.length)].isMine = true;
    board[getRandomInt(0, board.length)][getRandomInt(0, board.length)].isMine = true;
    return board
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

            var cellId = getClassName({ i: i, j: j })

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
    tiner()
    var currCell = gBoard[i][j]
    console.log(elCell.dataset.negsCount)
    console.log(elCell)
        // elCell.innerText = elCell.dataset.negsCount
    if (currCell.isMine) elCell.innerText = MINE
}

function cellMarked(elCell) {
    tiner()
    elCell.innerText = FLAG
}

function checkGameOver() {

}

function expandShown(board, elCell, i, j) {

}

function GameOver() {
    gGame.isOn = false;
}

function tiner() {
    if (!gGame.isOn) {
        gGame.isOn = true;
        startTimer(Date.now());
    }
}

window.addEventListener("contextmenu", e => e.preventDefault());