function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}


function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = {
                minesAroundCount: mat[i][j].minesAroundCount,
                isShown: mat[i][j].isShown,
                isMine: mat[i][j].isMine,
                isMarked: mat[i][j].isMarked
            }
        }
    }
    return newMat;
}

function getIdName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function renderCell(location, value) {
    var cellSelector = '#' + getIdName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerText = value;
}

function getCellCoord(strCellId) {
    var coord = {};
    var parts = strCellId.split('-'); // [cell,'2','7']
    coord.i = +parts[1] // 2
    coord.j = +parts[2]; // 7
    return coord; // {i:2 , j:7}
}