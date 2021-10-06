function CheckManually(elCell) {
    if (!gManually) {
        initGame()
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