function timer() {
    if (!gGame.isOn) {
        gGame.isOn = true;
        startTimer(Date.now());
    }
}


// הפונקציה מקבלת Date.now() 
function startTimer(rt) {
    if (!gGame.isOn) return;
    realTime = Date.now() - rt;
    document.querySelector('.timer').innerText = presentTime(realTime);
    setTimeout(function() {
        realTime = Date.now() - rt;
        document.querySelector('.timer').innerText = presentTime(realTime);
        gGame.timePassed++;
        startTimer(rt);
    }, 1000);
}

function presentTime(time) {
    var sec = parseInt(time / 1000);
    var min = parseInt(time / 60000);
    var hou = parseInt(time / 600000);
    if (sec < 10) sec = '0' + sec;
    if (min < 10) min = '0' + min;
    if (hou < 10) hou = '0' + hou;
    if (sec > 59) sec = sec % 60;
    if (min > 59) min = min % 60;
    if (hou > 12) hou = hou % 12;
    return hou + ':' + min + ':' + sec;
}