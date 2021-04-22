var canvas = document.getElementById("my_canvas");
var ctx = canvas.getContext("2d");
var keyboard_control = true;
var kolvo_obstacles = 10;
var el_id = 0;
const canvasW = canvas.getBoundingClientRect().width
const canvasH = canvas.getBoundingClientRect().height
var objects = new Map();
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

class Object {
    id = 0;

    constructor() {
        this.id = el_id;
        el_id++
        objects.set(this.id, this)
    }

    is_dead = false;

    destroy() {
        this.is_dead = true;
        objects.delete(this.id);
    }
}

class Player extends Object {
    speed = 5;
    invincible = false;
    x = canvas.width / 2;
    y = canvas.height - 30;
    width = 5;
    height = 5
    cooldown = 1000;
    is_cooldown = false;

    constructor() {
        super(null);
        /*this.sprite = new Image();
        this.sprite.src = "game_img/spaceship.png";*/
    }

    move() {
        if (keyboard_control) {
            document.addEventListener("keydown", keyDownHandler, false);
            document.addEventListener("keyup", keyUpHandler, false);
            document.addEventListener("keydown", keyRightHandler, false);
            document.addEventListener("keyup", keyLeftHandler, false);

            function keyDownHandler(e) {
                if (e.key === "Down" || e.key === "ArrowDown") {
                    downPressed = true;
                } else if (e.key === "Up" || e.key === "ArrowUp") {
                    upPressed = true;
                }
            }

            function keyUpHandler(e) {
                if (e.key === "Up" || e.key === "ArrowUp") {
                    upPressed = false;
                } else if (e.key === "Down" || e.key === "ArrowDown") {
                    downPressed = false;
                }
            }

            function keyRightHandler(e) {
                if (e.key === "Left" || e.key === "ArrowLeft") {
                    leftPressed = true;
                } else if (e.key === "Right" || e.key === "ArrowRight") {
                    rightPressed = true;
                }
            }

            function keyLeftHandler(e) {
                if (e.key === "Right" || e.key === "ArrowRight") {
                    rightPressed = false;
                } else if (e.key === "Left" || e.key === "ArrowLeft") {
                    leftPressed = false;
                }
            }

            if (rightPressed && this.x + this.width < canvasW) {
                this.x += this.speed;
            }
            if (leftPressed && this.x - this.width > 0) {
                this.x -= this.speed;
            }
            if (upPressed && this.y - this.height > 0) {
                this.y -= this.speed;
            }
            if (downPressed && this.y + this.height < canvasH) {
                this.y += this.speed;
            }
        } else {
            document.addEventListener("mousemove", (e) => {
                var relativeX = e.clientX - canvas.offsetLeft;
                var relativeY = e.clientY - canvas.offsetTop;
                if (relativeX > 0 && relativeX < canvas.width) {
                    this.x = relativeX - this.speed;
                }
                if (relativeY > 0 && relativeX < canvasH) {
                    this.y = relativeY - this.speed;
                }
            }, false);

        }
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    }

    shoot() {
        if (keyboard_control) {
            document.addEventListener("keydown", (e) => {
                if (e.key === " ") {
                    if (!this.is_cooldown) {
                        new Bullet(this.x, this.y, 1, 1, 5);
                        this.is_cooldown = true;
                        setTimeout(() => {
                            this.is_cooldown = false;
                        }, this.cooldown)
                    }
                }
            }, false);
        } else {
            if (!this.is_cooldown) {
                new Bullet(pl_x, pl_y, 1, 1, 5);
                this.is_cooldown = true;
                setTimeout(() => {
                    this.is_cooldown = false;
                }, this.cooldown)
            }
        }
    }
}

class Obstacle extends Object {
    width = 3;
    height = 3;
    speed = 0;
    x = -this.width - 1;
    y = 0;

    constructor() {
        super(null);
    }

    move() {
        if (this.x > -this.width) {
            this.x -= this.speed;
        } else {
            this.speed = getRandomFloat(1, 4);
            this.x = canvasW + this.width;
            this.y = getRandomFloat(this.height, canvasH - this.height);
        }
    }

    draw() {

        ctx.beginPath();
        ctx.rect(this.x, this.y, 3, 3);
        ctx.fillStyle = "#2090Df";
        ctx.fill();
        ctx.closePath();
    }

}

class Bullet extends Object {
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    speed = 0;

    constructor(x, y, width, height, speed) {
        super(null);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    move() {

        if (this.x > -this.width || this.x < canvasW + this.width) {
            this.x += this.speed;
        } else {
            this.destroy();
        }

    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, 3, 3);
        ctx.fillStyle = "#red";
        ctx.fill();
        ctx.closePath();
    }

}

player = new Player();
for (i = 0; i < kolvo_obstacles; i++) {
    obst = new Obstacle();
}

function Game_Process() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(d => {
        d.move();
        d.draw()
    });
    player.shoot();

}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

Game_Process();
var interval = setInterval(Game_Process, 16);