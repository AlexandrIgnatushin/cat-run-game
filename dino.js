window.addEventListener('keydown', (e) => {
    if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
    }
});
//board
let title = document.querySelector(".game-title");
let fieldRecord = document.querySelector(".record");
let playBtn = document.querySelector(".play");
let hintControl = document.querySelector(".press-enter");
let board;
let boardWidth = 750;
let boardHeight = 398;
let context;

//dino
let dinoWidth = 88;
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;
// let dinoImg;
let dinoImg;
let background;

let dino = {
    x : dinoX,
    y : dinoY,
    width : dinoWidth,
    height : dinoHeight
}

//cactus
let cactusArray = [];

let cactus1Width = 63;
let cactus2Width = 70;
let cactus3Width = 102;

let cactusHeight = 70;
let cactusX = 700;
let cactusY = boardHeight - cactusHeight;

let cactus1Img;
let cactus2Img;
let cactus3Img;

//physics
let velocityX = -8; //cactus moving left speed
let velocityY = 0;
let gravity = .4;

let gameOver = false;
let score = 0;
let imgs = ['./img/cat_run1.png', './img/cat_run2.png'];
let indexImgsItem = 0;
let intervalRun;

function playGame() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board
    fieldRecord.textContent = localStorage.getItem('record');
    background = new Image();
    background.src = "./img/bg.png";
    background.onload = function(){
        context.drawImage(background, 0, 0);
    }


    run();
    dinoImg = new Image();
    // dinoImg.src = "./img/dino.png";
    cactus1Img = new Image();
    cactus1Img.src = "./img/petuh.png";

    cactus2Img = new Image();
    cactus2Img.src = "./img/pumpkin.png";

    cactus3Img = new Image();
    cactus3Img.src = "./img/bush.png";

    requestAnimationFrame(update);
    setInterval(placeCactus, 1000); //1000 milliseconds = 1 second

    document.addEventListener("keydown", moveDino);
}

function run() {
    if (gameOver) {
        return;
    }
    intervalRun = setInterval(() => {

        dinoImg.src = imgs[indexImgsItem];

        dinoImg.onload = function () {
            context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
        }

        indexImgsItem++;
        if (indexImgsItem >= imgs.length) {
            indexImgsItem = 0;
        }
    }, 300);
}

window.onload = playGame;

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //dino
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY);
    context.drawImage(background,0, 0);
    //apply gravity to current dino.y, making sure it doesn't exceed the ground
    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);


    //cactus
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += velocityX;
        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

        if (detectCollision(dino, cactus)) {
            gameOver = true;
            clearInterval(intervalRun);

            title.textContent = 'Game over';
            // dinoImg = new Image();
            //
            // dinoImg.src = "./img/sad_cat.png";
            // dinoImg.onload = function() {
            //     context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
            // }
        }
    }

    //score
    context.fillStyle="black";
    context.font="20px courier";
    score++;

    if (gameOver) {
        let record = localStorage.getItem('record');

        if (!record) {
            localStorage.setItem('record', score);
        }

        if (record && score > record) {
            localStorage.setItem('record', score);
            fieldRecord.textContent = score;
            fieldRecord.classList.add('blink');
            hintControl.classList.add('blink');
            setTimeout(() => {
                fieldRecord.classList.remove('blink')
                hintControl.classList.remove('blink')
            }, 3000);
        }

        hintControl.classList.add('blink');
        setTimeout(() => {
            hintControl.classList.remove('blink')
        }, 1000);

        playBtn.style.display = 'block';
        hintControl.style.display = 'block';
    }

    context.fillText(score, 5, 20);
}

function moveDino(e) {
    if (gameOver) {
        return;
    }

    if ((e.code === "Space" || e.code === "ArrowUp") && dino.y === dinoY) {
        //jump
        clearInterval(intervalRun);

        velocityY = -10;

        dinoImg = new Image();
        dinoImg.src = "./img/cat_jump.png";
        dinoImg.onload = function() {
            context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
        }
    }

    setTimeout(() => {
        run();
    }, 450);
}

function placeCactus() {
    if (gameOver) {
        return;
    }

    //place cactus
    let cactus = {
        img : null,
        x : cactusX,
        y : cactusY,
        width : null,
        height: cactusHeight
    }

    let placeCactusChance = Math.random(); //0 - 0.9999...

    if (placeCactusChance > .90) { //10% you get cactus3
        cactus.img = cactus3Img;
        cactus.width = cactus3Width;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .70) { //30% you get cactus2
        cactus.img = cactus2Img;
        cactus.width = cactus2Width;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .50) { //50% you get cactus1
        cactus.img = cactus1Img;
        cactus.width = cactus1Width;
        cactusArray.push(cactus);
    }

    if (cactusArray.length > 5) {
        cactusArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

playBtn.addEventListener('click', function () {
    location.reload();
});

document.addEventListener('keydown', function (e) {
    if(e.code === "Enter" && gameOver) {
        location.reload();
    }
});