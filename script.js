const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById("collisionCanvas");
const ctx2 = collisionCanvas.getContext("2d");

collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let ravens = [];
let timeToNextRaven = 0;
let ravenInterval = 400;
let lastTime = 0;
let score = 0;
let gameOver = 3;
ctx.font = "50px Impact";

class Raven {
  constructor() {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 2;
    this.directionY = Math.random() * 5 - 2.5;
    this.image = new Image();
    this.image.src = "raven.png";
    this.makedForDeletion = false;
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColor = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color =
      "rgb(" +
      this.randomColor[0] +
      "," +
      this.randomColor[1] +
      "," +
      this.randomColor[2] +
      ")";
  }
  update(deltatime) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) this.makedForDeletion = true;

    this.timeSinceFlap += deltatime;

    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;
    }
    if (this.x < 0 - this.width) {
      gameOver--;
    }
  }
  draw() {
    ctx2.fillStyle = this.color;
    ctx2.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

let explosion = [];

class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = "boom.mp3";
    this.timeSinceLastFrame = 0;
    this.frameInterval = 100;
    this.makedForDeletion = false;
  }
  update(deltatime) {
    if (this.frame === 0) this.sound.play();
    this.timeSinceLastFrame += deltatime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 5) {
        this.makedForDeletion = true;
      }
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y - this.size * 0.25,
      this.size,
      this.size
    );
  }
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.fillText("score: " + score, 30, 80);

  ctx.fillStyle = "white";
  ctx.fillText("Lives: " + gameOver, 30, 145);
}

function drawGameOver() {
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillText(
    "GAME OVER!! your score is: " + score,
    canvas.width * 0.5 ,
    canvas.height * 0.5 
  );
}

window.addEventListener("click", function (e) {
  const detectPixel = ctx2.getImageData(e.x, e.y, 1, 1);
  //   console.log(detectPixel);
  const pc = detectPixel.data;
  ravens.forEach((obj) => {
    if (
      obj.randomColor[0] === pc[0] &&
      obj.randomColor[1] === pc[1] &&
      obj.randomColor[2] === pc[2]
    ) {
      obj.makedForDeletion = true;
      score++;
      explosion.push(new Explosion(obj.x, obj.y, obj.width));
    }
  });
});

const raven = new Raven();
function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx2.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);
  //   raven.update();
  //   raven.draw();
  let deltatime = timestamp - lastTime;
  lastTime = timestamp;
  //   console.log(lastTime);
  timeToNextRaven += deltatime;
  //   console.log(deltatime)
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    ravens.sort((a, b) => {
      return a.width - b.width;
    });
  }
  drawScore();
  [...ravens, ...explosion].forEach((obj) => {
    obj.update(deltatime);
  });
  [...ravens, ...explosion].forEach((obj) => {
    obj.draw();
  });
  ravens = ravens.filter((obj) => !obj.makedForDeletion);
  explosion = explosion.filter((obj) => !obj.makedForDeletion);
  if (gameOver >= 0) requestAnimationFrame(animate);
  else drawGameOver();
}

animate(0);
