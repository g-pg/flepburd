const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

//check for mobile
function isMobile() {
	const userAgent = navigator.userAgent.toLowerCase();
	const keywords = ["mobile", "android", "iphone", "ipod", "windows phone"];
	return keywords.some((keyword) => userAgent.includes(keyword));
}

//Canvas size
canvas.width = windowWidth < 400 ? windowWidth : 400;
canvas.height = 600;

//Global variables
let gameStart = false;
let gameOver = false;
let score = 0;

//Bird
const bird = {
	size: canvas.width * 0.09,
	xPos: canvas.width / 2 - 80,
	yPos: canvas.height / 2 - 30,
	yVel: 0,
	gravity: 0.6,
	color: "yellow",
	draw() {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.xPos, this.yPos, this.size, this.size);
	},
	reset() {
		this.xPos = canvas.width / 2 - 80;
		this.yPos = canvas.height / 2 - 30;
		this.color = "yellow";
		this.yVel = 0;
	},
};

//Pipes logic
class Pipe {
	constructor(aboveHeight, belowY) {
		this.aboveHeight = aboveHeight;
		this.belowY = belowY;
		this.xPos = canvas.width;
		this.vel = 2.5;
		this.width = bird.size * 2.2;
		this.passed = false;
	}
}

let pipes = [];

function generatePipe() {
	const gap = getRandomNum(150, 160);
	const abovePipeHeight = getRandomNum(30, canvas.height - 200);
	const belowPipePos = abovePipeHeight + gap;
	pipes.push(new Pipe(abovePipeHeight, belowPipePos));
}
setInterval(generatePipe, 1700);
function drawPipe() {
	for (const pipe of pipes) {
		ctx.fillStyle = "green";
		ctx.fillRect(pipe.xPos, 0, pipe.width, pipe.aboveHeight);
		ctx.fillRect(pipe.xPos, pipe.belowY, pipe.width, canvas.height - pipe.belowY);
		pipe.xPos -= pipe.vel;
		if (pipe.xPos < 0 && pipes.length > 5) pipes.shift();
	}
}

//Screens
function drawMenu() {
	const msg = isMobile() ? "tap" : "press spece";
	drawBoard();
	bird.draw();
	ctx.fillStyle = "white";
	ctx.font = "25px Comic Sans MS";
	ctx.fillText(msg + " to flep", 30, canvas.height / 4);
}

function drawGameOver() {
	const msg = isMobile() ? "tap" : "press enter";
	drawBoard();
	ctx.fillStyle = "white";
	ctx.font = "20px Comic Sans MS";
	ctx.fillText("u flepd " + score + " times", 30, canvas.height / 4);
	ctx.fillText(msg + " to flep again", 30, canvas.height / 4 + 50);
	//bird.reset();
	bird.draw();
}

function drawGame() {
	drawBoard();
	drawPipe();
	bird.draw();
	imposeGravity();
	checkLimit();
	checkCollision();
	drawScore();
}

//Game state control
let gameState = "menu";

function resetGame() {
	pipes = [];
	score = 0;
	bird.reset();
}
document.addEventListener("keydown", controlState);
document.addEventListener("touchstart", controlState);
function controlState(e) {
	const target = e.target.id === "canvas";
	if ((e.key === "Enter" || target) && gameState === "gameOver") {
		resetGame();
		bird.yVel = -10;
		return (gameState = "game");
	}

	if ((e.key === " " || target) && gameState === "game") {
		return;
	}

	if ((e.key === " " || target) && gameState === "menu") {
		resetGame();
		return (gameState = "game");
	}
}

function checkGameState() {
	if (gameState === "menu") {
		drawMenu();
	}

	if (gameState === "gameOver") {
		drawGameOver();
	}

	if (gameState === "game") {
		drawGame();
	}

	requestAnimationFrame(checkGameState);
}

function drawBoard() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener("keydown", moveBird);
document.addEventListener("touchstart", moveBird);

function moveBird(e) {
	const target = e.target.id === "canvas";
	if (e.key === " " || target) {
		bird.yVel = -10;
	}
}

function imposeGravity() {
	bird.yVel += bird.gravity;
	bird.yPos += bird.yVel;
}

function checkLimit() {
	if (bird.yPos < 0) {
		bird.yPos = 0;
	}

	if (bird.yPos > canvas.height) {
		bird.yPos = canvas.height;
	}
}

function checkCollision() {
	for (const pipe of pipes) {
		const birdTop = bird.yPos;
		const birdLeft = bird.xPos;
		const birdRight = bird.xPos + bird.size;
		const birdBottom = bird.yPos + bird.size;

		if (
			(birdLeft >= pipe.xPos &&
				birdLeft <= pipe.xPos + pipe.width &&
				birdTop <= pipe.aboveHeight) ||
			(birdRight >= pipe.xPos &&
				birdRight <= pipe.xPos + pipe.width &&
				birdTop <= pipe.aboveHeight) ||
			(birdLeft >= pipe.xPos &&
				birdLeft <= pipe.xPos + pipe.width &&
				birdBottom >= pipe.belowY) ||
			(birdRight >= pipe.xPos &&
				birdRight <= pipe.xPos + pipe.width &&
				birdBottom >= pipe.belowY)
		) {
			bird.color = "red";
			setTimeout(() => (gameState = "gameOver"), 300);
			break;
		}
		if (bird.xPos > pipe.xPos + pipe.width && !pipe.passed) {
			score++;
			pipe.passed = true;
			break;
		}
	}

	if (bird.yPos >= canvas.height) {
		gameState = "gameOver";
	}
}

function drawScore() {
	ctx.fillStyle = "red";
	ctx.font = "20px Comic Sans MS";
	ctx.fillText(score, canvas.width / 2, 100);
}

//loop
checkGameState();

//utils
function getRandomNum(min, max) {
	return Math.floor(Math.random() * (max - min) + 1 + min);
}
