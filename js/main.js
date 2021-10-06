//Modle
var gBoard;
var gLifes;
var gLights;
var gSafe;
var gHaveHint = false;
var firstClick = true
var gManually = false
var gMinesSum;
var gMinesForManually = [];
var gSteps = [];
var gStepsCount;
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
    timePassed: 0
}

var gScore = {
    easy: 0,
    hard: 0,
    pro: 0
}

var currentSituation = {

}
if (localStorage.getItem('easyScore') === null) {
    createScore()
}
if (!localStorage) createScore()

function initGame() {
    gMinesForManually = [];
    gMinesSum = gLevel.MINES
    gGame.isOn = false
    gManually = false
    gSafe = 3;
    stste.innerText = '😊';
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.timePassed = 0;
    gLifes = 3;
    gLights = 3;
    firstClick = true
    gBoard = buildBoard();
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    renderLights(gLights)
    renderLifes(gLifes)
    updateScore()
    gStepsCount = 0;
    gSteps[gStepsCount] = copyMat(gBoard);
    // updateSituation()
    document.querySelector('.timer').innerText = '00:00:00'
    document.querySelector('.safe-btn').style.cursor = 'pointer';
    document.querySelector('.safe-btn').innerText = 'Safe click 📌📌📌'
    document.querySelector('.manuall-btn').innerText = 'Manually Create';
    document.querySelector('.manuall-btn').disabled = false


}



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
    //insertion mines manually/random
    if (gManually) {
        for (var i = 0; i < gMinesForManually.length; i++) {
            board[gMinesForManually[i].i][gMinesForManually[i].j].isMine = true
        }
    } else {
        for (var i = 0; i < gLevel.MINES; i++) {
            board[getRandomInt(0, board.length)][getRandomInt(0, board.length)].isMine = true;
        }
    }
    return board
}



//The amount of mines around each cell
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            currCell.minesAroundCount = countNeighbors(i, j, board)
        }
    }
}
//Writing the game for the page
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellId = getIdName({ i: i, j: j })
            var cla = 'cell';
            var negs = '';
            if (currCell.isShown) {
                cla = "cell open"
                negs = currCell.minesAroundCount
            }
            strHTML += `\t<td class="${cla}" id="${cellId}" oncontextmenu="cellMarked(this)" onclick="cellClicked(this,${i},${j})" data-negs-count=${currCell.minesAroundCount}>\n`;
            strHTML += negs;
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}
//Clicking a cell in the game
function cellClicked(elCell, i, j) {
    if (gManually) {
        if (!addMineManually(i, j, elCell)) return;
        gMinesSum--;
        CheckManually(elCell);
        return
    }
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
    gStepsCount++;
    gSteps[gStepsCount] = copyMat(gBoard)
    if (currCell.isMine) {
        if (gLifes) {
            exposeTheMine(i, j)
            gLifes--;
            gGame.markedCount++
                renderLife(gLifes);
            checkGameOver()
            return
        }
        revealAllMine(gBoard)
        GameOver('😭');
    } else {
        if (currCell.minesAroundCount) {
            gStepsCount++;
            gSteps[gStepsCount] = copyMat(gBoard)
            openCell(elCell)
        } else {
            openCell(elCell);
            expandShown(gBoard, i, j)
            gStepsCount++;
            gSteps[gStepsCount] = copyMat(gBoard)
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
    if (cellModle.isMarked) gGame.markedCount++
        else gGame.markedCount--
            checkGameOver()

    gStepsCount++;
    gSteps[gStepsCount] = copyMat(gBoard)
}

function checkGameOver() {
    if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES && gGame.markedCount === gLevel.MINES) {
        GameOver('😍');
        updateScore()
    }
}
//Exposing the neighbors in a rocrosy as long as there is a cell without neighbors
function expandShown(board, cellI, cellJ) {
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
//Exposure of all mines in case of loss
function revealAllMine(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                renderCell({ i: i, j: j }, MINE)
            }
        }
    }
}
//Mark cell as open
function openCell(currCell) {
    currCell.classList.add('open')
    if (currCell.dataset.negsCount !== '0') currCell.innerText = currCell.dataset.negsCount
    gGame.shownCount++;
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
//The case of first pressing this mine moves it to another empty cell and updates the board
function MoveToEmptyCell(currCell, elCell) {
    firstClick = false;
    var emptyCell = getEmptyCell(gBoard);
    currCell.isMine = false
    gBoard[emptyCell.i][emptyCell.j].isMine = true
    setMinesNegsCount(gBoard)
    gStepsCount++;
    gSteps[gStepsCount] = copyMat(gBoard)
    renderBoard(gBoard)
    return document.querySelector('#' + elCell.id)
}
//Pressing a mine kills one life
function renderLife(gLives) {
    var selector = gLives + 1;
    document.querySelector('.l' + selector).innerHTML = '🖤';
}

function renderLifes(gLives) {
    var strHards = '';
    for (var i = 1; i <= gLives; i++) {
        strHards += `<span class="lives l${i}">💖</span>`;
    }
    document.querySelector('.hards').innerHTML = strHards;

}
//In case of pressing a mine but there is still life. It will show a different character
function exposeTheMine(i, j) {
    gBoard[i][j].isShown = true
    gStepsCount++
    gSteps[gStepsCount] = copyMat(gBoard)
    renderCell({ i: i, j: j }, '🤦‍♂️')
}
//Displays for a second a single cell that is safe to step on
function safeClick() {
    if (!gSafe) {
        document.querySelector('.safe-btn').style.cursor = 'not-allowed';
        return
    }
    var isRun = true
    var safe;
    while (isRun) {
        var i = getRandomInt(0, gBoard.length)
        var j = getRandomInt(0, gBoard.length)
        safe = gBoard[i][j];
        if (!safe.isMine && !safe.isShown) isRun = false
    }
    document.querySelector('#' + getIdName({ i: i, j: j })).classList.add('safe');
    gSafe--
    var btnText = 'Safe click'
    for (var k = 1; k <= gSafe; k++) {
        if (gSafe) btnText += '📌'
    }
    document.querySelector('.safe-btn').innerText = btnText
    setTimeout(() => {
        document.querySelector('#' + getIdName({ i: i, j: j })).classList.remove('safe');
    }, 3 * 1000)
}
//Returns a step back. Still not working well !!!!!!!
function undo() {
    gSteps.pop();
    gStepsCount--;
    renderBoard(gSteps[gStepsCount]);
}
//Shows the mines that go out in a place that is divided by 7
function boom() {
    initGame();
    var count = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (count % 7 === 0) {
                if (gBoard[i][j].isMine && count) {
                    renderCell({ i: i, j: j }, MINE)
                }
            }
            count++;

        }

    }
}

function createScore() {
    localStorage.setItem("easyScore", '➖');
    localStorage.setItem("hardScore", '➖');
    localStorage.setItem("proScore", '➖');
}
//Updates the low number of seconds of each level
function updateScore() {
    console.log(gGame.timePassed)
    switch (gLevel.SIZE) {
        case 4:
            if (localStorage.easyScore === '➖' && gGame.timePassed || (gGame.timePassed && gGame.timePassed < localStorage.easyScore)) {
                localStorage.easyScore = +gGame.timePassed
            }
            document.querySelector('#set-score').innerText = 'Best score: ' + localStorage.getItem("easyScore");
            break;
        case 8:
            if (localStorage.hardScore === '➖' && gGame.timePassed || (gGame.timePassed && gGame.timePassed < localStorage.hardScore)) {
                localStorage.hardScore = +gGame.timePassed
            }
            document.querySelector('#set-score').innerText = 'Best score: ' + localStorage.getItem("hardScore");
            break;
        case 12:
            if (localStorage.proScore === '➖' && gGame.timePassed || (gGame.timePassed && gGame.timePassed < localStorage.proScore)) {
                localStorage.proScore = +gGame.timePassed
            }
            document.querySelector('#set-score').innerHTML = 'Best score: ' + localStorage.getItem("proScore");
            break;
        default:
            localStorage.setItem("score", gGame.timePassed);
            break;
    }
}
//Resize the board
function switchLevel(size, mines) {
    gLevel.SIZE = size;
    gLevel.MINES = mines;
    gGame.isOn = false
    initGame()
}
window.addEventListener("contextmenu", e => e.preventDefault());