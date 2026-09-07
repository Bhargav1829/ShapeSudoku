let currentSize = 3;

let currentLevel = 1;

let selectedCell = null;

let timerSeconds = 0;

let timerInterval;

let solution = [];

let mistakes = 0;

let lives = 3;

let hints = 2;

let gameStarted = false;


/* =========================================================
   SHAPE NAMES
========================================================= */

const shapeNames = [
    "circle",
    "triangle",
    "square",
    "diamond",
    "star",
    "hexagon",
    "octagon",
    "plus"
];


/* =========================================================
   DIFFICULTY
========================================================= */

const difficulty = {

    1: 0.35,
    2: 0.42,
    3: 0.48,
    4: 0.53,
    5: 0.58,
    6: 0.62,
    7: 0.70
};


/* =========================================================
   START GAME
========================================================= */

function startGame(size, level) {

    currentSize = size;

    currentLevel = level;

    selectedCell = null;

    mistakes = 0;

    lives = 3;

    hints = 2;

    gameStarted = true;


    document.getElementById("homeScreen")
        .classList.add("hidden");

    document.getElementById("resultScreen")
        .classList.add("hidden");

    document.getElementById("gameArea")
        .classList.remove("hidden");


    document.getElementById("levelText")
        .textContent =
        level === 7
            ? "🏆 Challenge"
            : "Level " + level;


    document.getElementById("gridText")
        .textContent =
        size + " × " + size;


    document.getElementById("lives")
        .textContent = lives;


    document.getElementById("hintCount")
        .textContent = hints;


    document.getElementById("score")
        .textContent = "0";


    generatePuzzle(size);

    createShapeButtons(size);

    startTimer();
}


/* =========================================================
   CREATE SHAPE ELEMENT
========================================================= */

function createShapeElement(shapeIndex) {

    const shape = document.createElement("div");

    shape.classList.add(
        "game-shape",
        shapeNames[shapeIndex]
    );

    return shape;
}


/* =========================================================
   PUT SHAPE INSIDE CELL
========================================================= */

function showShapeInCell(cell, shapeIndex) {

    cell.innerHTML = "";

    const shape =
        createShapeElement(shapeIndex);

    cell.appendChild(shape);
}


/* =========================================================
   GET SHAPE INDEX
========================================================= */

function getShapeIndexFromCell(cell) {

    const shape =
        cell.querySelector(".game-shape");

    if (!shape) {
        return -1;
    }

    return shapeNames.indexOf(
        shape.classList[1]
    );
}


/* =========================================================
   GENERATE PUZZLE
========================================================= */

function generatePuzzle(size) {

    const board =
        document.getElementById("board");

    board.innerHTML = "";

    board.style.gridTemplateColumns =
        `repeat(${size}, 1fr)`;

    board.style.gridTemplateRows =
        `repeat(${size}, 1fr)`;


    /* Base Latin square */

    let baseBoard = [];

    for (let row = 0; row < size; row++) {

        baseBoard[row] = [];

        for (let col = 0; col < size; col++) {

            baseBoard[row][col] =
                (row + col) % size;
        }
    }


    /* Shuffle symbols */

    let shuffledShapes =
        [...Array(size).keys()];

    shuffleArray(shuffledShapes);


    /* Shuffle rows */

    let rowOrder =
        [...Array(size).keys()];

    shuffleArray(rowOrder);


    /* Shuffle columns */

    let colOrder =
        [...Array(size).keys()];

    shuffleArray(colOrder);


    /* Create solution */

    solution = [];

    for (let row = 0; row < size; row++) {

        solution[row] = [];

        for (let col = 0; col < size; col++) {

            const value =
                baseBoard[
                    rowOrder[row]
                ][
                    colOrder[col]
                ];

            solution[row][col] =
                shuffledShapes[value];
        }
    }


    /* Create puzzle */

    for (let row = 0; row < size; row++) {

        for (let col = 0; col < size; col++) {

            const cell =
                document.createElement("div");

            cell.classList.add("cell");

            cell.dataset.row = row;

            cell.dataset.col = col;


            if (
                Math.random() >
                difficulty[currentLevel]
            ) {

                showShapeInCell(
                    cell,
                    solution[row][col]
                );

                cell.dataset.fixed =
                    "true";

            } else {

                cell.innerHTML = "";

                cell.dataset.fixed =
                    "false";


                cell.addEventListener(
                    "click",
                    function () {

                        selectCell(cell);

                    }
                );
            }


            board.appendChild(cell);
        }
    }
}


/* =========================================================
   SELECT CELL
========================================================= */

function selectCell(cell) {

    if (
        cell.dataset.fixed === "true"
    ) {

        return;
    }


    document.querySelectorAll(".cell")
        .forEach(c => {

            c.classList.remove(
                "selected"
            );

        });


    cell.classList.add("selected");

    selectedCell = cell;
}


/* =========================================================
   CREATE SHAPE BUTTONS
========================================================= */

function createShapeButtons(size) {

    const shapeArea =
        document.getElementById("shapes");

    shapeArea.innerHTML = "";


    for (
        let i = 0;
        i < size;
        i++
    ) {

        const button =
            document.createElement("button");

        button.classList.add(
            "shape-button"
        );


        const shape =
            createShapeElement(i);

        button.appendChild(shape);


        button.addEventListener(
            "click",
            function () {

                if (
                    selectedCell === null
                ) {

                    alert(
                        "Please select an empty cell first."
                    );

                    return;
                }


                showShapeInCell(
                    selectedCell,
                    i
                );


                selectedCell.classList
                    .remove("wrong");

            }
        );


        shapeArea.appendChild(button);
    }
}


/* =========================================================
   CHECK PUZZLE
========================================================= */

function checkPuzzle() {

    const cells =
        document.querySelectorAll(".cell");

    let emptyCells = 0;

    let wrongCells = 0;


    cells.forEach(cell => {

        const row =
            Number(
                cell.dataset.row
            );

        const col =
            Number(
                cell.dataset.col
            );


        if (
            cell.dataset.fixed === "true"
        ) {

            return;
        }


        const answer =
            getShapeIndexFromCell(cell);


        if (answer === -1) {

            emptyCells++;

            return;
        }


        if (
            answer !== solution[row][col]
        ) {

            wrongCells++;

            cell.classList.add(
                "wrong"
            );

        } else {

            cell.classList.remove(
                "wrong"
            );
        }

    });


    /* Empty cells */

    if (emptyCells > 0) {

        alert(
            "⚠️ " +
            emptyCells +
            " cell(s) are still empty."
        );

        return;
    }


    /* Wrong answers */

    if (wrongCells > 0) {

        lives -= 1;

        mistakes += wrongCells;


        document.getElementById("lives")
            .textContent =
            lives;


        alert(
            "❌ Some answers are incorrect.\n\n" +
            "❤️ Lives remaining: " +
            lives
        );


        if (lives <= 0) {

            gameOver();

        }

        return;
    }


    /* Complete */

    finishGame();
}


/* =========================================================
   HINT
========================================================= */

function useHint() {

    if (hints <= 0) {

        alert(
            "No hints remaining!"
        );

        return;
    }


    const emptyCells =
        [
            ...document.querySelectorAll(".cell")
        ]
        .filter(cell =>
            cell.dataset.fixed === "false" &&
            getShapeIndexFromCell(cell) === -1
        );


    if (emptyCells.length === 0) {

        alert(
            "There are no empty cells!"
        );

        return;
    }


    const randomCell =
        emptyCells[
            Math.floor(
                Math.random() *
                emptyCells.length
            )
        ];


    const row =
        Number(
            randomCell.dataset.row
        );

    const col =
        Number(
            randomCell.dataset.col
        );


    showShapeInCell(
        randomCell,
        solution[row][col]
    );


    randomCell.classList.add(
        "hint"
    );


    randomCell.dataset.fixed =
        "true";


    hints--;


    document.getElementById("hintCount")
        .textContent =
        hints;
}


/* =========================================================
   TIMER
========================================================= */

function startTimer() {

    clearInterval(timerInterval);

    timerSeconds = 0;


    document.getElementById("timer")
        .textContent =
        "00:00";


    timerInterval =
        setInterval(
            function () {

                timerSeconds++;


                const minutes =
                    Math.floor(
                        timerSeconds / 60
                    );


                const seconds =
                    timerSeconds % 60;


                document.getElementById(
                    "timer"
                ).textContent =
                    String(minutes)
                        .padStart(2, "0") +
                    ":" +
                    String(seconds)
                        .padStart(2, "0");

            },
            1000
        );
}


/* =========================================================
   SCORE
========================================================= */

function calculateScore() {

    const baseScore =
        currentSize *
        currentSize *
        25;


    const timeBonus =
        Math.max(
            0,
            600 -
            (timerSeconds * 2)
        );


    const lifeBonus =
        lives * 50;


    const mistakePenalty =
        mistakes * 30;


    const hintPenalty =
        (2 - hints) * 40;


    return Math.max(
        0,
        baseScore +
        timeBonus +
        lifeBonus -
        mistakePenalty -
        hintPenalty
    );
}


/* =========================================================
   FINISH GAME
========================================================= */

function finishGame() {

    clearInterval(timerInterval);

    const finalScore =
        calculateScore();


    document.getElementById(
        "resultLevel"
    ).textContent =
        currentLevel === 7
            ? "🏆 Challenge"
            : "Level " +
              currentLevel;


    document.getElementById(
        "resultScore"
    ).textContent =
        finalScore;


    document.getElementById(
        "resultTime"
    ).textContent =
        document.getElementById(
            "timer"
        ).textContent;


    document.getElementById(
        "resultLives"
    ).textContent =
        lives;


    document.getElementById(
        "resultMistakes"
    ).textContent =
        mistakes;


    document.getElementById(
        "gameArea"
    ).classList.add("hidden");


    document.getElementById(
        "resultScreen"
    ).classList.remove("hidden");
}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    clearInterval(timerInterval);

    alert(
        "💔 Game Over!\n\n" +
        "You used all 3 lives."
    );

    goBack();
}


/* =========================================================
   PLAY AGAIN
========================================================= */

function playAgain() {

    startGame(
        currentSize,
        currentLevel
    );
}


/* =========================================================
   SHUFFLE
========================================================= */

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }


    return array;
}


/* =========================================================
   BACK
========================================================= */

function goBack() {

    clearInterval(timerInterval);

    selectedCell = null;

    document.getElementById(
        "gameArea"
    ).classList.add("hidden");


    document.getElementById(
        "resultScreen"
    ).classList.add("hidden");


    document.getElementById(
        "homeScreen"
    ).classList.remove("hidden");
}