//Modle
var gBoard;
var gEmptyCellsOpen;
var gFlagCount;
var gLives;
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
    secsPassed: 0
}


function initGame() {
    gMinesForManually = [];
    gMinesSum = gLevel.MINES
    gGame.isOn = false
    gManually = false
    gSafe = 3;
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
    gStepsCount = 0;
    gSteps[gStepsCount] = copyMat(gBoard);
    document.querySelector('.timer').innerText = '00:00:00'
    document.querySelector('.safe-btn').style.cursor = 'pointer';
    document.querySelector('.safe-btn').innerText = 'Safe click 📌📌📌'
    document.querySelector('.manuall-btn').innerText = 'Manually Create';
    document.querySelector('.manuall-btn').disabled = false


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

    if (gManually) {
        for (var i = 0; i < gMinesForManually.length; i++) {
            board[gMinesForManually[i].i][gMinesForManually[i].j].isMine = true
        }
    } else {
        for (let i = 0; i < gLevel.MINES; i++) {
            board[getRandomInt(0, board.length)][getRandomInt(0, board.length)].isMine = true;
        }
        // board[0][0].isMine = true;
        // board[0][3].isMine = true;
    }


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
            var cla = 'cell';
            var nags = '';
            if (currCell.isShown) {
                cla = "cell open"
                nags = currCell.minesAroundCount
            }
            strHTML += `\t<td class="${cla}" id="${cellId}" oncontextmenu="cellMarked(this)" onclick="cellClicked(this,${i},${j})" data-negs-count=${currCell.minesAroundCount}>\n`;
            strHTML += nags;
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

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
    if (cellModle.isMarked) gFlagCount++
        else gFlagCount--
            checkGameOver()

    gStepsCount++;
    gSteps[gStepsCount] = copyMat(gBoard)
}

function checkGameOver() {
    if (gEmptyCellsOpen === gLevel.SIZE ** 2 - gLevel.MINES && gFlagCount === gLevel.MINES) GameOver('😍');
}

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
    firstClick = false;
    var emptyCell = getEmptyCell(gBoard);
    currCell.isMine = false
    gBoard[emptyCell.i][emptyCell.j].isMine = true
    setMinesNegsCount(gBoard)
    gStepsCount++;
    gSteps[gStepsCount] = copyMat(gBoard)
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

function exposeTheMine(i, j) {
    gBoard[i][j].isShown = true
    gStepsCount++
    gSteps[gStepsCount] = copyMat(gBoard)
    renderCell({ i: i, j: j }, '🤦‍♂️')
}

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

function CheckManually(elCell) {
    if (!gManually) {
        document.querySelector('.manuall-btn').innerText = 'Select Cells';
        gManually = true;
        return
    }

    if (!gMinesSum) {
        gBoard = buildBoard()
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
        document.querySelector('.manuall-btn').innerText = 'Game On...';
        document.querySelector('.manuall-btn').disabled = true
        gManually = false;
    } else {
        document.querySelector('.manuall-btn').innerText = 'Select another ' + gMinesSum;
        elCell.innerText = '✨'
    }

}

function addMineManually(i, j, elCell) {
    if (gMinesForManually.length) {
        for (var index = 0; index < gMinesForManually.length; index++) {
            if (gMinesForManually[index].i === i && gMinesForManually[index].j === j) {
                alert('Already selected')
                return false
            }
        }
    }
    gMinesForManually.push({ i: i, j: j });
    return true
}

function undo() {
    gSteps.pop();
    gStepsCount--;
    renderBoard(gSteps[gStepsCount]);
}

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
window.addEventListener("contextmenu", e => e.preventDefault());