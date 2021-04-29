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
var state_enemy = 0;
var kolvo_stars = 20;

class Object {
    id = 0;
    alive_id = -1;
    is_dead = false;
    spr;

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

    draw() {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
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
    speed_diag=0;
    health = 200;
    invincible = false;
    invincible_time = 500;
    x = canvas.width / 2;
    y = canvas.height / 2;
    width = 160;
    height = 50
    cooldown = 1000;
    is_cooldown = false;
    x1=0;
    y1=0;//для управления на мобилках
    x2=0;
    y2=0;
    path =0 ;

    constructor() {
        super(null);
        this.sprite = new Image();
        this.sprite.src = "player.png";
        this.y2=this.y;
        this.x2=this.x;
        alive_objects.set(this.id, this);
        if (keyboard_control) {
            document.addEventListener("keydown", (e)=>{if (e.key === "Down" || e.key === "ArrowDown") {
                downPressed = true;
            } else if (e.key === "Up" || e.key === "ArrowUp") {
                upPressed = true;
            }}, false);
            document.addEventListener("keyup", (e)=>{if (e.key === "Up" || e.key === "ArrowUp") {
                upPressed = false;
            } else if (e.key === "Down" || e.key === "ArrowDown") {
                downPressed = false;
            }}, false);
            document.addEventListener("keydown", (e)=>{if (e.key === "Left" || e.key === "ArrowLeft") {
                leftPressed = true;
            } else if (e.key === "Right" || e.key === "ArrowRight") {
                rightPressed = true;
            }}, false);
            document.addEventListener("keyup", (e)=>{if (e.key === "Right" || e.key === "ArrowRight") {
                rightPressed = false;
            } else if (e.key === "Left" || e.key === "ArrowLeft") {
                leftPressed = false;
            }}, false);
        }
        else{
            if(par_of_game===1){
                    document.addEventListener("click", (e) => {
                        this.x1=this.x;
                        this.y1=this.y;
                        this.x2 = e.offsetX - this.width / 2;
                        this.y2 = e.offsetY - this.height / 2;
                        var dist = Math.abs(Math.sqrt((this.x2 - this.x1) * (this.x2 - this.x1) + (this.y2 - this.y1) * (this.y2 - this.y1)));
                        this.speed_diag = this.speed / dist;
                        this.path = 0;
                    }, false);
        }}
    }

    move() {
        this.hp_Show();
        if (this.health <= 0) {
            this.destroy();
            par_of_game = 2;
            destroy_all();
        }
        this.shoot();
        if (keyboard_control) {
            if (rightPressed && this.x + this.width <= canvasW) {
                this.x += this.speed;
            }
            if (leftPressed && this.x > 0) {
                this.x -= this.speed;
            }
            if (upPressed && this.y >= 0) {
                this.y -= this.speed;
            }
            if (downPressed && (this.y + this.height <= canvasH)) {
                this.y += this.speed;
            }
        } else {
            if(Math.abs(this.x2 - this.x) > this.speed || Math.abs(this.y2 - this.y) > this.speed) {
                this.path += this.speed_diag;
                this.x = this.x1 + (this.x2 - this.x1) * this.path;
                this.y = this.y1 + (this.y2 - this.y1) * this.path;
            }
        }
    }


    shoot() {
        if (keyboard_control) {
            document.addEventListener("keydown", (e) => {
                if (e.key === " ") {
                    if (!this.is_cooldown) {
                        new Bullet(this.x + this.width +5 , this.y, 30, 5, this.speed+5);
                        this.is_cooldown = true;
                        setTimeout(() => {
                            this.is_cooldown = false;
                        }, this.cooldown)
                    }
                }
            }, false);
        } else {
            if (!this.is_cooldown) {
                new Bullet(this.x + this.width + 5, this.y, 30, 5, this.speed+5);
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
            this.sprite.src = "protected_player.png";
            setTimeout(() => {
                this.invincible = false;
                this.sprite.src = "player.png";
            }, this.invincible_time)
        }
    }
hp_Show() {
        ctx.beginPath();
         ctx.rect(10, 10, this.health, 20);
         ctx.fillStyle = "green";
         ctx.fill();
         ctx.closePath();
    }
}

class Space_Shark extends Object {
    width = 400;
    height = 200;
    speed = 0;
    helth = 2;
    x = canvasW + this.width;
    y = getRandomFloat(this.height, canvasH - this.height);
    direction = score % 2;
    speed = 12;
    damage = 20;
    reward = 1000;

    constructor(direction) {
        super(null);
        this.alive_id = ali_obj_id;
        ali_obj_id++;
        alive_objects.set(this.alive_id, this);
        this.direction = direction;
        this.sprite = new Image();
        this.sprite.src = "Shark_dir0.png";
    }

    move() {
        if (this.helth <= 0) {
            this.destroy();
            state_enemy = 0;
            score += this.reward;
        }
        this.check_collision();
        if (this.direction === 1) {
            if (this.x > -this.width * 2) {
                this.x -= this.speed;
            } else {
                this.direction = 0;
                this.y = objects.get(0).y;
                this.sprite.src = "Shark_dir1.png";
                if (this.y + this.height > canvasH) {
                    this.y = canvasH - this.height;
                }
            }
        } else {
            if (this.x < canvasW + this.width) {
                this.x += this.speed;
            } else {
                this.direction = 1;
                this.y = objects.get(0).y - 100;
                this.sprite.src = "Shark_dir0.png";
                if (this.y + this.height > canvasH) {
                    this.y = canvasH - this.height;
                }
            }

        }
    }

    check_collision() {
        var obj = alive_objects.get(0);
        if (this.on_collision(obj)) {
            obj.get_damage(this.damage);
        }
    }
}

class Obstacle extends Object {
    width = 20;
    height = 20;
    speed = 0;
    x = -this.width - 1;
    y = 0;
    damage = 2;

    constructor() {
        super(null);
        this.sprite = new Image();
        this.sprite.src = "астеройд.png";
    }

    move() {
        this.check_collision();
        if (this.x > -this.width) {
            this.x -= this.speed;
        } else {
            this.speed = getRandomFloat(3, 6);
            this.x = canvasW + this.width;
            this.y = getRandomFloat(this.height, canvasH - this.height);
        }
    }


    check_collision() {
        var obj = alive_objects.get(0);
        if (this.on_collision(obj)) {
            obj.get_damage(this.damage);
        }
    }


}

class Bullet extends Object {
    x = 0;
    y = 0;
    width = 25;
    height = 20;
    speed = 0;
    damage = 20;

    constructor(x, y, width, height, speed, damage) {
        super(null);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.sprite = new Image();
        this.sprite.src = "Blaster.png";
    }

    move() {
        this.check_collision();
        if (this.x > -this.width || this.x < canvasW + this.width) {
            this.x += this.speed;
        } else {
            this.destroy();
        }

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
    width = 500;
    max_h = 300;
    height = 300;
    x = canvas.width + this.width + 5;
    y = canvas.height / 2;
    cooldown = 100;
    is_cooldown = false;
    stable = 0;
    speed = 2;
    helth = 10000;
    reward = 100000;
    player =0;
    constructor() {
        super(null);
        this.alive_id = ali_obj_id;
        ali_obj_id++;
        alive_objects.set(this.alive_id, this);
        this.sprite = new Image();
        this.sprite.src = "enemy.png";
        this.player=objects.get(0);
    }

    move() {
        switch (this.stable) {
            case 0:
                if (this.x > canvas.width - this.width - 5) {
                    this.x -= 2;
                    this.helth = this.max_h;
                } else {
                    this.stable = 1;
                }
                break;
            case 1:
                if(!this.check_y()) {
                    if (this.player.y < this.y) {
                        this.y -= this.speed;
                    } else if (this.player.y > this.y) {
                        this.y += this.speed;
                    }
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
                    state_enemy = 0;
                    score += this.reward;
                }
        }

    }

    shoot() {
        if (!this.is_cooldown) {
            new Bullet(this.x - 80, this.y + this.height / 2, 30, 10, -5);
            this.is_cooldown = true;
            setTimeout(() => {
                this.is_cooldown = false;
            }, this.cooldown)
        }
    }
    check_y(){
        return ((this.player.y>=this.y)&&(this.player.y<=this.y+this.height))
            ||((this.player.y+this.player.height<=this.y)&&(this.player.y+this.player.height>=this.y+this.height))
    }
}

class Button extends Object {
    text = "";
    x = 0;
    y = 0;
    width = 0;
    height = 0;

    constructor(text, x, y, w, h, clicked) {
        super(null);
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.draw();
        canvas.addEventListener('click', (e) => {
            if(this.is_in(this.x,this.y,this.width,this.height,e.offsetX,e.offsetY)){
            clicked();}
        })
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px Arial";
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillText(this.text, this.x + ctx.measureText(this.text.length).width * 2, this.y + (this.height * (1.8 / 3)), this.width * (2 / 3))
        ctx.closePath();
    }

    is_in(x, y, width, height, x1, y1) {
        return x1 >= x && x1 <= x + width &&
            y1 >= y && y1 <= y + height;
    }


}

class Star extends Object {
    radius = 1;
    speed = 0;
    x = -this.radius - 1;
    y = 0;

    constructor() {
        super(null);
    }

    move() {
        if (this.x > -this.radius) {
            this.x -= this.speed;
        } else {
            this.speed = 30;
            this.x = canvasW + this.radius + getRandomFloat(20, 2000);
            this.y = getRandomFloat(this.radius, canvasH - this.radius);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.closePath();

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
    keyboard = new Button("Keyboard Control", canvasW * (1 / 4), canvasH * (1 / 5), 300, 50, function () {
        if (par_of_game === 0) {
            keyboard_control = 1;
            par_of_game = 1;
            create_startguys();
            return;
        }
    });
    mouse = new Button("Touch Control", canvasW * (1 / 4), canvasH * (3 / 5), 300, 50, function () {
        if (par_of_game === 0) {
            keyboard_control = 0;
            par_of_game = 1;
            create_startguys();
            return;
        }
    });
    destroy_all()
}

function game() {
    var scr_cooldown = 100000000;
    var scr_is_cooldown = false;
    drawScore();
    objects.forEach(d => {
        d.move();
        d.draw()
    });
    if (!scr_is_cooldown) {
        scr_is_cooldown = true;
        score += 10;
        setTimeout(() => {
            scr_is_cooldown = false;
        }, scr_cooldown)
    }

    if (state_enemy === 0 && score % 500 === 0) {
        new Space_Shark();
        state_enemy = 1;
    }
    if (state_enemy === 0 && score % 10 === 0) {
        new Boss();
        state_enemy = 2;
    }

}

function game_over() {
    new Button("Try again", canvasW * 0.5, canvasH * (2 / 3), 300, 50, function () {
        if (par_of_game === 2) {
            par_of_game = 0;
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
    el_id = 0;
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#ffffff";
    if (par_of_game === 1) {
        ctx.fillText("Score:" + score, canvasW * (1 / 2), 20, canvasW / 3);
    } else {
        ctx.fillText("Best score:" + best_score, canvasW * (2 / 3), canvasH / 2, canvasW / 3);
        ctx.fillText("Score:" + score, canvasW * (2 / 3), canvasH / 2 + 20, canvasW / 3);
    }
}

function create_startguys() {
    new Player();
    for (i = 0; i < kolvo_obstacles; i++) {
        new Obstacle();
    }
    for (i = 0; i < kolvo_stars; i++) {
        new Star();
    }
}


var interval = setInterval(Game_Process, 16);