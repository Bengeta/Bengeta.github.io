var canvas = document.getElementById("my_canvas");
var ctx = canvas.getContext("2d");
var keyboard_control = 0;
var kolvo_obstacles = 10;
var el_id = 0;
var par_of_game=0;
const canvasW = canvas.getBoundingClientRect().width
const canvasH = canvas.getBoundingClientRect().height
var objects = new Map();
var alive_objects = new Map();
var ali_obj_id=1;//потому что там уже есть игрок он нулевой
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

class Object {
    id = 0;
    alive_id=-1;
    is_dead = false;
    constructor() {
        this.id = el_id;
        el_id++
        objects.set(this.id, this)
    }
    on_collision(smt){
        if(this.x < smt.x + smt.width &&
            this.x + this.width > smt.x &&
            this.y < smt.y + smt.height &&
            this.y + this.height > smt.y){
            return 1;
        }
        return 0;
    }
    get_damage(damage){
        this.helth-=damage;
    }

    destroy() {
        this.is_dead = true;
        objects.delete(this.id);
        if(this.alive_id!==-1){
            alive_objects.delete(this.alive_id);
            ali_obj_id--;
        }
    }
}

class Player extends Object {
    speed = 5;
    helth = 200;
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
        alive_objects.set(this.id,this);
    }

    move() {
        if(this.helth<=0){
            this.destroy();
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
                new Bullet(this.x, this.y, 1, 1, 5);
                this.is_cooldown = true;
                setTimeout(() => {
                    this.is_cooldown = false;
                }, this.cooldown)
            }
        }
    }
    get_damage(damage){
        if(!this.invincible){
            this.invincible=true;
            this.helth-=damage;
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

    constructor(direction) {
        super(null);
        this.alive_id=ali_obj_id;
        ali_obj_id++;
        alive_objects.set(this.alive_id,this);
        this.direction=direction;
        if(direction===1){

        }
        else{

        }
    }

    move() {
        if(this.helth<=0){
            this.destroy();
        }
        this.check_collision();
        if (this.direction === 1) {
            if (this.x > -this.width*2) {
                this.x -= this.speed;
            }
            else{
                this.direction=0;
                this.y = objects.get(0).y;
                if(this.y+this.height>canvasH){
                    this.y=canvasH-this.height;
                }
            }
        }
        else {
            if(this.x < canvasW+this.width){
                this.x+=this.speed;
            }
            else{
                this.direction=1;
                this.y = objects.get(0).y;
                if(this.y+this.height>canvasH){
                    this.y=canvasH-this.height;
                }
            }

}
}
    draw(){
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.width);
        ctx.fillStyle = "#ff0000";
        ctx.fill();
        ctx.closePath();
    }
    check_collision(){
        var obj = alive_objects.get(0);
        if(this.on_collision(obj)){
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

    check_collision(){
        var obj = alive_objects.get(0);
        if(this.on_collision(obj)){
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
    damage =20;

    constructor(x, y, width, height, speed,damage) {
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
    check_collision(){
        var obj;
        for (let i = 0; i < alive_objects.size ; i++) {
            obj = alive_objects.get(i);
            if(this.on_collision(obj)){
                obj.get_damage(this.damage);
                this.destroy();
            }

        }
    }

}

class Boss extends Object{
    speed = 5;
    invincible = 0;
    width = 100;
    height = 80;
    x = canvas.width +this.width+5;
    y = canvas.height /2;
    cooldown = 100;
    is_cooldown = false;
    stable = 0;
    speed = 2;
    helth =0;

    constructor() {
        super(null);
        this.alive_id=ali_obj_id;
        ali_obj_id++;
        alive_objects.set(this.alive_id,this);
        /*this.sprite = new Image();
        this.sprite.src = "game_img/spaceship.png";*/
    }

    move(){
        switch (this.stable) {
            case 0:
                if(this.x > canvas.width -this.width-5){
                    this.x -=2;
                }
                else{
                    this.stable=1;
                }
                break;
            case 1:
                if(objects.get(0).y<this.y){
                    this.y -= this.speed;
                }
                else if(objects.get(0).y>this.y){
                    this.y += this.speed;
                }
                this.shoot();
                if(this.helth<=0){
                    this.stable=2;
                }
                break;
            case 2:
                if(this.x < canvas.width + this.width + 5){
                    this.x +=2;
                }
                else{
                    this.destroy();
                }
        }

    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.width);
        ctx.fillStyle = "#8b00ff";
        ctx.fill();
        ctx.closePath();
    }

    shoot(){
        if (!this.is_cooldown) {
            new Bullet(this.x-this.width-1, this.y, 1, 1, -5);
            this.is_cooldown = true;
            setTimeout(() => {
                this.is_cooldown = false;
            }, this.cooldown)
        }
    }
}
player = new Player();
new Space_Shark();
new Boss();
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