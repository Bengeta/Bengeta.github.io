var canvas = document.getElementById("my_canvas");
var ctx = canvas.getContext("2d");
var keyboard_control = 0;
var kolvo_obstacles = 10;
var el_id = 0;
var par_of_game = 0;
const canvasW = canvas.getBoundingClientRect().width
const canvasH = canvas.getBoundingClientRect().height
var objects = new Map();
var alive_objects = new Map();
var ali_obj_id = 1;//потому что там уже есть игрок он нулевой
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var score = 0;
var best_score = 0;
var state_enemy =0;

class Object {
    id = 0;
    alive_id = -1;
    is_dead = false;

    constructor() {
        this.id = el_id;
        el_id++
        objects.set(this.id, this)
    }

    on_collision(smt) {
        return (this.x < smt.x + smt.width &&
            this.x + this.width > smt.x &&
            this.y < smt.y + smt.height &&
            this.y + this.height > smt.y)
    }

    get_damage(damage) {
        this.helth -= damage;
    }

    destroy() {
        this.is_dead = true;
        objects.delete(this.id);
        if (this.alive_id !== -1) {
            alive_objects.delete(this.alive_id);
            ali_obj_id--;
        }
    }
}

class Player extends Object {
    speed = 5;
    health = 200;
    invincible = false;
    invincible_time = 500;
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
        alive_objects.set(this.id, this);
    }

    move() {
        if (this.health <= 0) {
            this.destroy();
            par_of_game=2;
            destroy_all();
        }
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
                if (relativeY > 0 && relativeY < canvasH) {
                    this.y = relativeY - this.speed;
                }
            }, false);

        }
    }

    draw() {
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
                new Bullet(this.x, this.y, 1, 1, 5);
                this.is_cooldown = true;
                setTimeout(() => {
                    this.is_cooldown = false;
                }, this.cooldown)
            }
        }
    }

    get_damage(damage) {
        if (!this.invincible) {
            this.invincible = true;
            this.health -= damage;
            setTimeout(() => {
                this.invincible = false;
            }, this.invincible_time)
        }
    }
}

class Space_Shark extends Object {
    width = 200;
    height = 200;
    speed = 0;
    helth = 2;
    x = canvasW + this.width;
    y = getRandomFloat(this.height, canvasH - this.height);
    direction = 1;
    speed = 12;
    damage = 20;
    reward=1000;

    constructor(direction) {
        super(null);
        this.alive_id = ali_obj_id;
        ali_obj_id++;
        alive_objects.set(this.alive_id, this);
        this.direction = direction;
        if (direction === 1) {

        } else {

        }
    }

    move() {
        if (this.helth <= 0) {
            this.destroy();
            state_enemy=0;
            score+=this.reward;
        }
        this.check_collision();
        if (this.direction === 1) {
            if (this.x > -this.width * 2) {
                this.x -= this.speed;
            } else {
                this.direction = 0;
                this.y = objects.get(0).y;
                if (this.y + this.height > canvasH) {
                    this.y = canvasH - this.height;
                }
            }
        } else {
            if (this.x < canvasW + this.width) {
                this.x += this.speed;
            } else {
                this.direction = 1;
                this.y = objects.get(0).y;
                if (this.y + this.height > canvasH) {
                    this.y = canvasH - this.height;
                }
            }

        }
    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.width);
        ctx.fillStyle = "#ff0000";
        ctx.fill();
        ctx.closePath();
    }

    check_collision() {
        var obj = alive_objects.get(0);
        if (this.on_collision(obj)) {
            obj.get_damage(this.damage);
        }
    }
}

class Obstacle extends Object {
    width = 3;
    height = 3;
    speed = 0;
    x = -this.width - 1;
    y = 0;
    damage = 2;

    constructor() {
        super(null);
    }

    move() {
        this.check_collision();
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

    check_collision() {
        var obj = alive_objects.get(0);
        if (this.on_collision(obj)) {
            obj.get_damage(this.damage);
            this.destroy();
        }
    }


}

class Bullet extends Object {
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    speed = 0;
    damage = 20;

    constructor(x, y, width, height, speed, damage) {
        super(null);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    move() {
        this.check_collision();
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

    check_collision() {
        var obj;
        for (let i = 0; i < alive_objects.size; i++) {
            obj = alive_objects.get(i);
            if (this.on_collision(obj)) {
                obj.get_damage(this.damage);
                this.destroy();
            }

        }
    }

}

class Boss extends Object {
    speed = 5;
    invincible = 0;
    width = 100;
    height = 80;
    x = canvas.width + this.width + 5;
    y = canvas.height / 2;
    cooldown = 100;
    is_cooldown = false;
    stable = 0;
    speed = 2;
    helth = 0;
    reward=100000;
    constructor() {
        super(null);
        this.alive_id = ali_obj_id;
        ali_obj_id++;
        alive_objects.set(this.alive_id, this);
        /*this.sprite = new Image();
        this.sprite.src = "game_img/spaceship.png";*/
    }

    move() {
        switch (this.stable) {
            case 0:
                if (this.x > canvas.width - this.width - 5) {
                    this.x -= 2;
                } else {
                    this.stable = 1;
                }
                break;
            case 1:
                if (objects.get(0).y < this.y) {
                    this.y -= this.speed;
                } else if (objects.get(0).y > this.y) {
                    this.y += this.speed;
                }
                this.shoot();
                if (this.helth <= 0) {
                    this.stable = 2;
                }
                break;
            case 2:
                if (this.x < canvas.width + this.width + 5) {
                    this.x += 2;
                } else {
                    this.destroy();
                    state_enemy=0;
                    score+=this.reward;
                }
        }

    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.width);
        ctx.fillStyle = "#8b00ff";
        ctx.fill();
        ctx.closePath();
    }

    shoot() {
        if (!this.is_cooldown) {
            new Bullet(this.x - this.width - 1, this.y, 1, 1, -5);
            this.is_cooldown = true;
            setTimeout(() => {
                this.is_cooldown = false;
            }, this.cooldown)
        }
    }
}

class Button extends Object{
    text = "";
    x = 0;
    y = 0;
    width = 0;
    height = 0;

    constructor(text, x, y, w, h,clicked) {
        super(null);
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.draw();
        canvas.addEventListener('click', (e) => {
            clicked();
        })
    }

    draw() {
        ctx.beginPath();
        ctx.font = "16px Arial";
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillText(this.text, this.x + ctx.measureText(this.text.length).width * 2, this.y + (this.height * (1.8 / 3)), this.width * (2 / 3))
        ctx.closePath();
    }

    is_in(x, y, width, height, x1, y1) {
        return x1 >= x && x1 <= x + width &&
            y1 >= y && y1 <= y + height;
    }


}



function Game_Process() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    switch (par_of_game) {
        case 0:
            game_menu();
            break;
        case 1:
            game();
            break;
        case 2:
            game_over();
            break;
    }


}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function game_menu() {
    keyboard = new Button("Keyboard Control", canvasW * (1 / 4), canvasH * (1 / 5), 300, 50,function (){
        if(par_of_game===0) {
            keyboard_control = 1;
            par_of_game = 1;
            create_startguys();
            return;
        }
    });
    mouse = new Button("Touch Control", canvasW * (1 / 4), canvasH * (3 / 5), 300, 50,function (){
        if(par_of_game===0) {
            keyboard_control = 0;
            par_of_game = 1;
            create_startguys();
            return;
        }
    });
    destroy_all()
}

function game(){
    var scr_cooldown=100000000;
    var scr_is_cooldown=false;
    drawScore();
    objects.forEach(d => {
        d.move();
        d.draw()
    });
    //objects.get(0).shoot();
    if (!scr_is_cooldown) {
        scr_is_cooldown = true;
        score += 10;
        setTimeout(() => {
            scr_is_cooldown = false;
        }, scr_cooldown)
    }

    if(state_enemy===0&&score%500===0){
        new Space_Shark();
        state_enemy=1;
    }
    if(state_enemy===0&&score%10000===0){
        new Boss();
        state_enemy=2;
    }

}

function game_over(){
    new Button("Try again", canvasW * 0.5, canvasH * (2 / 3), 300, 50, function () {
        if (par_of_game === 2) {
            par_of_game=0;
            destroy_all();
            return;
        }
    });
    drawScore();
    if (score > best_score) {
        best_score = score;
    }
}

function destroy_all() {
    objects.forEach(d => {
        d.destroy();
    });
    el_id=0;
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#000000";
    if (par_of_game === 1) {
        ctx.fillText("Score:" + score, canvasW * (1 / 2), 20, canvasW / 3);
    } else {
        ctx.fillText("Best score:" + best_score, canvasW * (2 / 3), canvasH/2, canvasW / 3);
        ctx.fillText("Score:" + score, canvasW * (2 / 3), canvasH/2+20, canvasW / 3);
    }
}

function create_startguys(){
    new Player();
    for (i = 0; i < kolvo_obstacles; i++) {
        new Obstacle();
    }
}

Game_Process();

var interval = setInterval(Game_Process, 16);