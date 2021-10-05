function getHint() {
    gLights--
    renderLight(gLights)
    gHaveHint = true
    document.querySelector('body').style.cursor = 'help'
    document.querySelector('table').style.borderColor = 'yellow'
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
    document.querySelector('table').style.borderColor = ''

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