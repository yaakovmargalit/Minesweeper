//Modle
var gBoard;

var gEmptyCellsOpen;
var gFlagCount;
var gLives;
var gLights;
var gHaveHint = false;
var firstClick = true
var stste = document.querySelector('.state')
var elLives = document.querySelector('.lives');
var elLights = document.querySelector('.hints');
const EMPTY = '';
const FLAG = '🚩';
const MINE = '💥';
const LIVE = '💖';


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
    gGame.isOn = false
    stste.innerText = '😊';
    gEmptyCellsOpen = 0;
    gFlagCount = 0;
    gLives = 3;
    gLights = 3;
    firstClick = true
    gBoard = buildBoard();
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    renderLights(gLights)
    renderLives(gLives)
    document.querySelector('.timer').innerText = '00:00:00'

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
    gGame.isOn = false
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
    if (gHaveHint) {
        showHint(i, j)
        gHaveHint = false;
        setTimeout(() => {
            caverHint(i, j)
        }, 1000)
        return
    }
    if (firstClick && currCell.isMine) elCell = MoveToEmptyCell(currCell, elCell);
    firstClick = false
    currCell.isShown = true
    if (currCell.isMine) {
        if (gLives) {
            exposeTheMine(i, j)
            gLives--;
            gFlagCount++
            renderLive(gLives);
            checkGameOver()
            return
        }
        revealAllMine(gBoard)
        GameOver('😢');
    } else {
        if (currCell.minesAroundCount) openCell(elCell);
        else {
            openCell(elCell);
            expandShown(gBoard, i, j)
        }
        checkGameOver()
            //console.log(gEmptyCellsOpen, gFlagCount)
    }
}

function cellMarked(elCell) {
    timer()
    var cellLoction = getCellCoord(elCell.id)
    var cellModle = gBoard[cellLoction.i][cellLoction.j]
    cellModle.isMarked = !cellModle.isMarked;
    elCell.innerText = cellModle.isMarked ? FLAG : ' ';
    if (cellModle.isMarked) gFlagCount++
        else gFlagCount--
            checkGameOver()
}

function checkGameOver() {
    if (gEmptyCellsOpen === gLevel.SIZE ** 2 - gLevel.MINES && gFlagCount === gLevel.MINES) GameOver('😍');
}

function expandShown(board, cellI, cellJ) {
    var a, b;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            var el = document.querySelector('#' + getIdName({ i: i, j: j }));
            if (!board[i][j].isShown) {
                if (!board[i][j].minesAroundCount) {
                    board[i][j].isShown = true
                    expandShown(gBoard, i, j)
                }
                openCell(el);
            }
            board[i][j].isShown = true
        }
    }

}

function GameOver(state) {
    gGame.isOn = false;
    stste.innerText = state;
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

function getEmptyCell(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                return { i: i, j: j }
            }
        }
    }
}

function MoveToEmptyCell(currCell, elCell) {
    console.log(elCell)
    firstClick = false;
    var emptyCell = getEmptyCell(gBoard);
    currCell.isMine = false
    gBoard[emptyCell.i][emptyCell.j].isMine = true
    setMinesNegsCount(gBoard)
    elCell.dataset.negsCount = currCell.minesAroundCount;
    elCell.classList.add('open')
    renderBoard(gBoard)
    return document.querySelector('#' + elCell.id)
}

function renderLive(gLives) {
    var selector = gLives + 1;
    document.querySelector('.l' + selector).innerHTML = '🖤';
}

function renderLives(gLives) {
    var strHards = '';
    for (var i = 1; i <= gLives; i++) {
        strHards += `<span class="lives l${i}">💖</span>`;
    }
    document.querySelector('.hards').innerHTML = strHards;

}

function renderLight(gLights) {
    var selector = gLights + 1;
    document.querySelector('.h' + selector).src = 'img/off.png';
}

function renderLights(gLights) {
    var strLights = '';
    for (var i = 1; i <= gLights; i++) {
        strLights += `<img class="lights h${i}" onclick="getHint()" src="img/LightBulb.png" />`;
    }
    elLights.innerHTML = strLights;
}

function exposeTheMine(i, j) {
    gBoard[i][j].isShown = true
    renderCell({ i: i, j: j }, '🤦‍♂️')
}

function getHint() {
    gLights--
    renderLight(gLights)
    gHaveHint = true
    document.querySelector('body').style.cursor = 'help'
}

function showHint(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            //  if (i === cellI && j === cellJ) continue;
            if (!gBoard[i][j].isShown)
                if (gBoard[i][j].isMine) renderCell({ i: i, j: j }, MINE)
                else renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount)
        }
    }
}

function caverHint(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (!gBoard[i][j].isShown)
                renderCell({ i: i, j: j }, '')
        }
    }
    document.querySelector('body').style.cursor = ''

}
window.addEventListener("contextmenu", e => e.preventDefault());