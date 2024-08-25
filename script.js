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

const difficulty = (percent) => {
    let difference = isXturn?(parseInt(p2Score.textContent) - parseInt(p1Score.textContent)):(parseInt(p1Score.textContent) - parseInt(p2Score.textContent));
    const grudge = 3;
    if(difference >= 0)
        return (percent + ((100 - percent) * difference / grudge));
    else
        return (percent + (percent * difference / grudge));
}

const bot = () => {
    if((isXturn && !isXbot) || (!isXturn && !isObot)) {
        playGrid.style.pointerEvents = "auto";
        clearInterval(botInterval);
        return;
    }
    
    let dice = Math.floor(Math.random() * 100);
    if(dice < difficulty(50)) {
        if(filledCount == 8) {
            botRandom();
            console.log("last move");
            return;
        }

        if(filledCount == 0) {
            botRandom();
            console.log("first move");
            return;
        }

        if(botBasic(secondLastMoveRow, secondLastMoveCol)) {
            console.log("basic win");
            return;
        }
        if(botBasic(lastMoveRow, lastMoveCol)) {
            console.log("basic block");
            return;
        }
        
        if(filledCount == 7) {
            botRandom();
            console.log("2nd last move");
            return;
        }

        const currentState = [[], [], []];
        for(let i = 0; i < 3; i++)
            for(let j = 0; j < 3; j++)
                currentState[i].push(grid[i][j].textContent);
        
        let optimalRow, optimalCol, score, maxScore = -Infinity;
        for(let i = 0; i < 3; i++)
            for(let j = 0; j < 3; j++)
                if(currentState[i][j] == '') {
                    currentState[i][j] = isXturn?'X':'O';
                    score = minimax(currentState, !isXturn, filledCount + 1, i, j);
                    currentState[i][j] = '';
                    if(score > maxScore) {
                        maxScore = score;
                        optimalRow = i;
                        optimalCol = j;
                    }
                }
        play(grid[optimalRow][optimalCol]);
        console.log("minimax");
        return;
    }

    botRandom();
}

const minimax = (previousState, tempIsXturn, tempFilledCount, row, col) => {
    if(minimaxWin(previousState, row, col))
        return tempIsXturn == isXturn?tempFilledCount-10:10-tempFilledCount;
    if(tempFilledCount == 9)
        return 0;
    let score, extremeScore = tempIsXturn == isXturn?-Infinity:Infinity;
    for(let i = 0; i < 3; i++)
        for(let j = 0; j < 3; j++)
            if(previousState[i][j] == '') {
                previousState[i][j] = tempIsXturn?'X':'O';
                score = minimax(previousState, !tempIsXturn, tempFilledCount + 1, i, j);
                previousState[i][j] = '';
                extremeScore = tempIsXturn == isXturn?Math.max(score, extremeScore):Math.min(score, extremeScore);
            }

    return extremeScore;
}

const minimaxWin = (state, row, col) => {
    if(state[row][0] == state[row][1] && state[row][1] == state[row][2])
        {
            return true;
        }
    if(state[0][col] == state[1][col] && state[1][col] == state[2][col])
        {
            return true;
        }
    if(col == row && state[0][0] == state[1][1] && state[1][1] == state[2][2])
        {
            return true;
        }
    if(col + row == 2 && state[0][2] == state[1][1] && state[1][1] == state[2][0])
        {
            return true;
        }
    return false;
}

const botRandom = () => {
    const randomEmpty = [];
    for(let i = 0; i < 3; i++)
        for(let j = 0; j < 3; j++)
            if(grid[i][j].textContent == '')
                randomEmpty.push(grid[i][j]);
    play(randomEmpty[Math.floor(Math.random() * randomEmpty.length)]);
    console.log("random");
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
