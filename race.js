CANVAS_WIDTH = 1000;
CANVAS_HEIGHT = 600;

imagesNumber = 6;
laps = 9;

var startTime = null;
var userDriverSet = [];
bang = [];
leftPanel = null;

pause = false;
inGame = false;
hollywood = true;
readingTimer = "";
dead=false;
mort=true;

carImg = [];

var explosionFrame = 0;
window.onload = function() {
    var i = 0;
    carImg[0] = new Image;
    carImg[0].src = 'imgs/ferrari.gif';
    carImg[0].onload = function () {
        i++;
        downloadCheck(i);
    }
    carImg[1] = new Image;
    carImg[1].src = 'imgs/red_bull.gif';
    carImg[1].onload = function () {
        i++;
        downloadCheck(i);
    }
    carImgDemage = new Image;
    carImgDemage.src = 'imgs/blue_car1_demage.gif';
    carImgDemage.onload = function () {
        i++;
        downloadCheck(i);
    }
    traceMap = new Image;
    traceMap.src = 'imgs/Vroom_SS.jpg';
    traceMap.onload = function () {
        i++
        downloadCheck(i);
    }

    explosion = new Image;
    explosion.src = 'imgs/EXPLOSION.bmp';
    explosion.onload = function () {
        i++
        downloadCheck(i);
    }

    treeImg = new Image;
    treeImg.src = 'imgs/tree.gif';
    treeImg.onload = function () {
        i++
        downloadCheck(i);
    }
}

function downloadCheck(i) {
    if (i == imagesNumber) {
        init();
    }
}

function init() {
    context = document.getElementById('canvas').getContext("2d");
    window.setInterval(refresh, 1000/25);
    startRace();
}

function startRace () {
    inGame = false;
    track = new map(Level1);
    gameOverScreen = new resultScreen (context);
    cars = track.cars();
    userDriverSet = [
            new carDrive (cars[0], controlKeys.Arrows),
            new carDrive (cars[1], controlKeys.AWDS)
        ];
    statisticSet = new raceStatistic (cars.length, track.lines, laps, gameOver);
    statisticSet.startRace();
    leftPanel = new panel(statisticSet, context);
    startTime = new Date();
    pause = false;
}

function refresh () {
    reading ();
    if (!pause && inGame) {
        update ();
    }
    draw();
}

function reading () {
    var time = new Date() - startTime;
    if (time < 3000) {
        readingTimer = 3 - ~~(time / 1000);
    } else if (readingTimer == "1") {
        readingTimer = "";
        inGame = true;
    }
}

function update () {
    for (var i in userDriverSet) {
        userDriverSet[i].action();
        var line = track.checkBorder(userDriverSet[i].car);
        statisticSet.carInLine(i, line);
    }
    for (var i in bang) {
        bang[i].update();
    }
}

function gameChangePause () {
    pause = !pause;
}

function gameOver(carId) {
    gameOverScreen.gameOver(carId);
    inGame = false;
    gameChangePause();
}

function beginExplosion(car) {
    if (!car.demage) {
        var explotion = new bigBang(context, explosion, 108, 149, 12);
        explotion.startBang(car);
        bang.push(explotion);
    }
}

function checkPlayersAlive() {
    if( hollywood && cars[0].demage && cars[1].demage && mort ) {
        alert("Tout le monde est mort...");
        mort=false;
        document.location.href="http://www.securite-routiere.gouv.fr/";
    }
}

//--------------------------------------------
//Draw methods
//--------------------------------------------

function draw() {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBackground();
    drawBorder();
    drawCars();
    leftPanel.draw();
    drawExplosions();
    drawReadingTimer();
    gameOverScreen.drow();
    drawFps();
    checkPlayersAlive();
}

function drawBackground () {
    track.draw(context);
}

function drawBorder() {
    context.beginPath();
    context.lineWidth = 1;
    context.moveTo(1, 1);
    context.lineTo(CANVAS_WIDTH - 2, 1);
    context.lineTo(CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2);
    context.lineTo(1, CANVAS_HEIGHT - 2);
    context.lineTo(1, 1);
    context.stroke();
}

function drawCars() {
    for (var i in userDriverSet) {
        drawCar(i);
    }
}

function drawCar (carNumber) {
    context.save();
    var car = userDriverSet[carNumber].car
    context.translate(car.position[0], car.position[1]);
    context.rotate(car.carDirection);
    if (car.demage) {
        context.drawImage(carImgDemage, -10, -10);
    } else {
        context.drawImage(carImg[carNumber], -10, -10);
    }
    context.restore();
}

function drawExplosions() {
    for (var i in bang){
        bang[i].drow();
    }
}

function drawReadingTimer() {
    context.font = "120pt Arial";
    context.fillStyle ="#222";
    context.fillText(readingTimer, 404, 304);
    context.fillStyle ="#ccc";
    context.fillText(readingTimer, 400, 300);
}

this.frameLog = [];
function drawFps() {
    var fps = 0;
    context.font = "10pt Arial";
    context.fillStyle = '#000';
    context.fillText(count() + 'fps', 10, 15);
    frameLog.push(new Date().getTime());
}

function count(){
    var naw = new Date().getTime()
    for (var i = frameLog.length - 1; i >= 0; i--) {
        if (naw - frameLog[i] > 1000) {
            return frameLog.length + 1 - i;
        }
    }
}

/*
Odd classes
*/

function bigBang(context, image, frameHeight, frameWidth, frameCount) {

    this.image = image;
    this.frameHeight = frameHeight;
    this.frameWidth = frameWidth;
    this.frameCount = frameCount;

    this.begin = false;
    this.counter = 0;
    this.divisor = 1;
    this.frameId = 0;
    this.x = null;
    this.y = null;

    this.startBang = function (car) {
        this.begin = true;
        this.x = car.position[0] - this.frameWidth / 2;
        this.y = car.position[1] - this.frameHeight / 2;
        car.demage = true;
    }

    this.update = function () {
        if (this.begin && this.frameId < this.frameCount) {
            if (this.counter++ == this.divisor) {
                this.counter = 0;
                this.frameId++;
            };
        }
    }

    this.drow = function () {
        if (this.begin) {
            context.drawImage(
                this.image,
                this.frameId * this.frameWidth,
                0,
                this.frameWidth,
                this.frameHeight,
                this.x,
                this.y,
                this.frameWidth,
                this.frameHeight
            );
        }
    }
}
