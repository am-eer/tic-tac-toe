const playGrid = document.getElementById("playGrid");

const grid = [
    [
        playGrid.querySelector('[data-row="0"][data-col="0"]'),
        playGrid.querySelector('[data-row="0"][data-col="1"]'),
        playGrid.querySelector('[data-row="0"][data-col="2"]')
    ],
    [
        playGrid.querySelector('[data-row="1"][data-col="0"]'),
        playGrid.querySelector('[data-row="1"][data-col="1"]'),
        playGrid.querySelector('[data-row="1"][data-col="2"]')
    ],
    [
        playGrid.querySelector('[data-row="2"][data-col="0"]'),
        playGrid.querySelector('[data-row="2"][data-col="1"]'),
        playGrid.querySelector('[data-row="2"][data-col="2"]')
    ]
];

const edges = [grid[0][1], grid[1][0], grid[1][2], grid[2][1]];
const corners = [grid[0][0], grid[0][2], grid[2][0], grid[2][2]];
const dialog = document.querySelector("dialog");
const p1Score = document.getElementById("p1Score");
const p2Score = document.getElementById("p2Score");

let lastMoveCol, lastMoveRow, secondLastMoveCol, secondLastMoveRow;
let filledCount = 0;
let isXturn = true;
let isXbot = false, isObot = true;
let botInterval, botTimeout;

const xSound = new Audio("./audio/cross.mp3");
const oSound = new Audio("./audio/circle.mp3");
const lineSound = new Audio("./audio/line.mp3");
const toggleSound = new Audio("./audio/toggle.mp3");

const main = () => {
    const slots = playGrid.querySelectorAll(".slot");
    slots.forEach((slot) => {
        slot.addEventListener("click", () => {
            playGrid.style.pointerEvents = "none";
            play(slot);
            if(isXbot && isObot)
                botInterval = setInterval(bot, 1000);
            else if((isXturn && isXbot) || (!isXturn && isObot))
                botTimeout = setTimeout(() => {
                    bot();
                    playGrid.style.pointerEvents = "auto";
                }, 1000);
            else
                playGrid.style.pointerEvents = "auto";
        });
    });

    const leftToggle = document.querySelector(".left > .toggle");
    leftToggle.addEventListener("click", (e) => toggleLeft(e));
    const rightToggle = document.querySelector(".right > .toggle");
    rightToggle.addEventListener("click", (e) => toggleRight(e));
}

const play = (slot) => {
    if(slot.textContent != '')
        return;
    secondLastMoveCol = lastMoveCol;
    secondLastMoveRow = lastMoveRow;
    lastMoveCol = Number(slot.getAttribute("data-col"));
    lastMoveRow = Number(slot.getAttribute("data-row"));
    if(isXturn) {
        xSound.play();
        slot.textContent = "X";
        filledCount ++;
    }
    else {
        oSound.play();
        slot.textContent = "O";
        filledCount ++;
    }
    if(checkWin()) {
        clearInterval(botInterval);
        clearTimeout(botTimeout);
        playGrid.style.pointerEvents = "auto";
        if(isXturn) {
            p1Score.textContent = parseInt(p1Score.textContent) + 1;
            dialog.textContent = "Player 1 scored!";
            dialog.show();
            dialog.blur();
        }
        else {
            p2Score.textContent = parseInt(p2Score.textContent) + 1;
            dialog.textContent = "Player 2 scored!";
            dialog.show();
            dialog.blur();
        }
        setTimeout(reset, 1500);
    }
    else if(filledCount == 9) {
        clearInterval(botInterval);
        clearTimeout(botTimeout);
        playGrid.style.pointerEvents = "auto";
        dialog.textContent = "It's a draw!";
        dialog.show();
        dialog.blur();
        setTimeout(reset, 1500);
    }
    else 
        isXturn = !isXturn;
}

const toggleLeft = (event) => {
    toggleSound.play();
    isXbot = !isXbot;
    if(isXbot) {
        event.target.closest(".toggle").firstElementChild.style.backgroundColor = "darkgrey";
        event.target.closest(".toggle").lastElementChild.style.backgroundColor = "white";
        if(isXturn) {
            playGrid.style.pointerEvents = "none";
            bot();
            playGrid.style.pointerEvents = "auto";
            if(isObot) {
                playGrid.style.pointerEvents = "none";
                botInterval = setInterval(bot, 1000);
            }
        }
    }

    else {
        playGrid.style.pointerEvents = "auto";
        event.target.closest(".toggle").firstElementChild.style.backgroundColor = "white";
        event.target.closest(".toggle").lastElementChild.style.backgroundColor = "darkgrey";
    }
}

const toggleRight = (event) => {
    toggleSound.play();
    isObot = !isObot;
    if(isObot) {
        event.target.closest(".toggle").firstElementChild.style.backgroundColor = "darkgrey";
        event.target.closest(".toggle").lastElementChild.style.backgroundColor = "white";
        if(!isXturn) {
            playGrid.style.pointerEvents = "none";
            bot();
            playGrid.style.pointerEvents = "auto";
            if(isXbot) {
                playGrid.style.pointerEvents = "none";
                botInterval = setInterval(bot, 1000);
            }
        }
    }

    else {
        playGrid.style.pointerEvents = "auto";
        event.target.closest(".toggle").firstElementChild.style.backgroundColor = "white";
        event.target.closest(".toggle").lastElementChild.style.backgroundColor = "darkgrey";
    }
}

const difficulty = (percent, difference) => {
    if(difference >= 0)
        return (percent + (difference * (100 - percent) / 4));
    else
        return (percent + (difference * percent / 4));
}

const bot = () => {
    if((isXturn && !isXbot) || (!isXturn && !isObot)) {
        playGrid.style.pointerEvents = "auto";
        clearInterval(botInterval);
        return;
    }
    else if(filledCount == 8) {
        botRandom();
        return;
    }

    let differ = isXturn?(parseInt(p2Score.textContent) - parseInt(p1Score.textContent)):(parseInt(p1Score.textContent) - parseInt(p2Score.textContent));
    if(filledCount < 2) {
        const emptyEdges = [...edges];
        const emptyCorners = [...corners];

        if(!isXturn && emptyEdges.indexOf(grid[lastMoveRow][lastMoveCol]) != -1)
            emptyEdges.splice(emptyEdges.indexOf(grid[lastMoveRow][lastMoveCol]), 1);
        else if(!isXturn && emptyCorners.indexOf(grid[lastMoveRow][lastMoveCol]) != -1)
            emptyCorners.splice(emptyCorners.indexOf(grid[lastMoveRow][lastMoveCol]), 1);
        
        let dice = Math.floor(Math.random() * 100);
        if(dice < difficulty(20, differ)) {
            if(grid[1][1].textContent == '') 
                play(grid[1][1]);
            else
                play(emptyCorners[Math.floor(Math.random() * emptyCorners.length)]);
            console.log("center start attempt");
        }
        else if(dice < difficulty(60, differ)) {
            play(emptyCorners[Math.floor(Math.random() * emptyCorners.length)]);
            console.log("corner start");
        }
        else if(dice < difficulty(90, differ)) {
            play(emptyEdges[Math.floor(Math.random() * emptyEdges.length)]);
            console.log("edge start");
        }
        else
            botRandom();
    }

    else if(botBasic(secondLastMoveRow, secondLastMoveCol))
        console.log("basic");
    else if(botBasic(lastMoveRow, lastMoveCol))
        console.log("basic");
    
    else if(filledCount == 7)
        botRandom();

    else {
        const intermediateSlots = [], advancedSlots = [];
        selector(intermediateSlots, advancedSlots);
        
        let dice = Math.floor(Math.random() * 100);
        if(dice < difficulty(20, differ)) {
            if(advancedSlots.length > 0) {
                play(advancedSlots[Math.floor(Math.random() * advancedSlots.length)]);
                console.log("advanced");
            }
            else if(intermediateSlots.length > 0) {
                play(intermediateSlots[Math.floor(Math.random() * intermediateSlots.length)]);
                console.log("intermediate");
            }
        }
        else if(intermediateSlots.length > 0 && (dice < difficulty(60, differ))) {
            play(intermediateSlots[Math.floor(Math.random() * intermediateSlots.length)]);
            console.log("intermediate");
        }
        else
            botRandom();
    }
}

const botRandom = () => {
    const randomEmpty = [];
    for(i = 0; i < 3; i++)
        for(j = 0; j < 3; j++)
            if(grid[i][j].textContent == '')
                randomEmpty.push(grid[i][j]);
    play(randomEmpty[Math.floor(Math.random() * randomEmpty.length)]);
    console.log("random");
}

const selector = (intermediateSlots, advancedSlots) => {
    if(filledCount < 2)
        return;
    
    let i, j, botMarkCount = 0;
    const emptySlots = [], combinedSlots = [];
    
    for(i = 0; i < 3; i++) {
        for(j = 0; j < 3; j++) {
            if(grid[i][j].textContent == (isXturn?'O':'X'))
                break;
            else if(grid[i][j].textContent == '')
                emptySlots.push(grid[i][j]);
            else if(grid[i][j].textContent == (isXturn?'X':'O'))
                botMarkCount++;
        }
        if(botMarkCount == 1 && emptySlots.length == 2)
            combinedSlots.push(...emptySlots);
        botMarkCount = 0;
        emptySlots.length = 0;
    }
    
    for(i = 0; i < 3; i++) {
        for(j = 0; j < 3; j++) {
            if(grid[j][i].textContent == (isXturn?'O':'X'))
                break;
            else if(grid[j][i].textContent == '')
                emptySlots.push(grid[j][i]);
            else if(grid[j][i].textContent == (isXturn?'X':'O'))
                botMarkCount++;
        }
        if(botMarkCount == 1 && emptySlots.length == 2)
            combinedSlots.push(...emptySlots);
        botMarkCount = 0;
        emptySlots.length = 0;
    }
    
    for(i = 0; i < 3; i++) {
        if(grid[i][i].textContent == (isXturn?'O':'X'))
            break;
        else if(grid[i][i].textContent == '')
            emptySlots.push(grid[i][i]);
        else if(grid[i][i].textContent == (isXturn?'X':'O'))
            botMarkCount++;
    }
    if(botMarkCount == 1 && emptySlots.length == 2)
        combinedSlots.push(...emptySlots);
    botMarkCount = 0;
    emptySlots.length = 0;

    for(i = 0; i < 3; i++) {
        if(grid[i][2 - i].textContent == (isXturn?'O':'X'))
            break;
        else if(grid[i][2 - i].textContent == '')
            emptySlots.push(grid[i][2 - i]);
        else if(grid[i][2 - i].textContent == (isXturn?'X':'O'))
            botMarkCount++;
    }
    if(botMarkCount == 1 && emptySlots.length == 2)
        combinedSlots.push(...emptySlots);
    botMarkCount = 0;
    emptySlots.length = 0;

    for(i = 0; i < combinedSlots.length; i++) {
        if(combinedSlots.indexOf(combinedSlots[i]) == i)
            intermediateSlots.push(combinedSlots[i])
        else
            advancedSlots.push(combinedSlots[i]);
    }

    if(advancedSlots.length > 0 && intermediateSlots.length > 0)    
        for(i = 0; i < intermediateSlots.length; i++)
            if(advancedSlots.indexOf(intermediateSlots[i]) != -1)
                intermediateSlots.splice(i, 1);
}

const botBasic = (row, col) => {
    if(filledCount < 3)
        return false;
    
    else if(row == col && grid[0][0].textContent == grid[1][1].textContent && grid[2][2].textContent == '')
        play(grid[2][2]);
    else if(row == col && grid[1][1].textContent == grid[2][2].textContent && grid[0][0].textContent == '')
        play(grid[0][0]);
    else if(row == col && grid[0][0].textContent == grid[2][2].textContent && grid[1][1].textContent == '')
        play(grid[1][1]);

    else if(row + col == 2 && grid[0][2].textContent == grid[1][1].textContent && grid[2][0].textContent == '')
        play(grid[2][0]);
    else if(row + col == 2 && grid[1][1].textContent == grid[2][0].textContent && grid[0][2].textContent == '')
        play(grid[0][2]);
    else if(row + col == 2 && grid[0][2].textContent == grid[2][0].textContent && grid[1][1].textContent == '')
        play(grid[1][1]);
    
    else if(grid[row][0].textContent == grid[row][1].textContent && grid[row][2].textContent == '')
        play(grid[row][2]);
    else if(grid[row][1].textContent == grid[row][2].textContent && grid[row][0].textContent == '')
        play(grid[row][0]);
    else if(grid[row][0].textContent == grid[row][2].textContent && grid[row][1].textContent == '')
        play(grid[row][1]);

    else if(grid[0][col].textContent == grid[1][col].textContent && grid[2][col].textContent == '')
        play(grid[2][col]);
    else if(grid[1][col].textContent == grid[2][col].textContent && grid[0][col].textContent == '')
        play(grid[0][col]);
    else if(grid[0][col].textContent == grid[2][col].textContent && grid[1][col].textContent == '')
        play(grid[1][col]);

    else
        return false;
    return true;
}

const checkWin = () => {
    if(grid[lastMoveRow][0].textContent == grid[lastMoveRow][1].textContent && grid[lastMoveRow][1].textContent == grid[lastMoveRow][2].textContent)
        {
            drawLine(lastMoveRow, 0);
            return true;
        }
    else if(grid[0][lastMoveCol].textContent == grid[1][lastMoveCol].textContent && grid[1][lastMoveCol].textContent == grid[2][lastMoveCol].textContent)
        {
            drawLine(lastMoveCol, 1);
            return true;
        }
    else if(lastMoveCol == lastMoveRow && grid[0][0].textContent == grid[1][1].textContent && grid[1][1].textContent == grid[2][2].textContent)
        {
            drawLine(0, 2);
            return true;
        }
    else if(lastMoveCol + lastMoveRow == 2 && grid[0][2].textContent == grid[1][1].textContent && grid[1][1].textContent == grid[2][0].textContent)
        {
            drawLine(1, 2);
            return true;
        }
    else
        return false;
}

const reset = () => {
    filledCount = 0;
    dialog.close();
    const slots = playGrid.querySelectorAll(".slot");
    slots.forEach((slot) => {
        slot.textContent = '';
    }); 
    const overlay = document.querySelector("#overlay");
    overlay.style.display = "none";
    isXturn = true;
    if(isXbot) {
        playGrid.style.pointerEvents = "none";
        if(isObot)
            botInterval = setInterval(bot, 1000);
        else {
            botTimeout = setTimeout(() => {
                bot();
                playGrid.style.pointerEvents = "auto";
            }, 1000);
        }
    }
}

const drawLine = (position, axis) => {
    lineSound.play();
    const line = document.querySelector("#overlay img");
    const overlay = document.querySelector("#overlay");
    switch (axis) {
        case 0:
            switch (position) {
                case 0:
                    overlay.style.display = "block";
                    line.style.transform = "translateY(-33.33%)";
                    break;

                case 1:
                    overlay.style.display = "block";
                    line.style.transform = "none";
                    break;
                
                case 2:
                    overlay.style.display = "block";
                    line.style.transform = "translateY(33.33%)";
                    break;
                
                default:
                    break;
            }
            break;
            
        case 1:
            switch (position) {
                case 0:
                    overlay.style.display = "block";
                    line.style.transform = "translateX(-33.33%) rotate(90deg)";
                    break;

                case 1:
                    overlay.style.display = "block";
                    line.style.transform = "rotate(90deg)";
                    break;
                
                case 2:
                    overlay.style.display = "block";
                    line.style.transform = "translateX(33.33%) rotate(90deg)";
                    break;
                
                default:
                    break;
            }
            break;
            
        case 2:
        switch (position) {
            case 0:
                overlay.style.display = "block";
                line.style.transform = "rotate(45deg) scaleX(1.3)";
                break;

            case 1:
                overlay.style.display = "block";
                line.style.transform = "rotate(-45deg) scaleX(1.3)";
                break;
            
            default:
                break;
        }
        break;

        default:
            break;
    }
}

main();
