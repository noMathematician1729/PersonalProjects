let board;
const rowCount = 21;
const colCount = 19;

const tileSize = 32;
const boardWidth = tileSize*colCount;
const boardHeight = tileSize*rowCount;

let blueGhostImage;
let pinkGhostImage;
let redGhostImage;
let orangeGhostImage;
let pacmanUpImage;
let pacmanLeftImage;
let pacmanRightImage;
let pacmanDownImage;
let wallImage;

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;
let score = 0;
let lives = 3;
let gameOver = false;

const directions = ['U', 'L', 'R', 'D'];
const ghostTurnChance = 0.08;
const turnTolerance = 12;

const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "X    X       X    X",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX" 
];

window.onload = function(){
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    loadImages();
    loadMap();
    for(let i of ghosts.values()){
        const newDirection = directions[Math.floor(Math.random()*4)];
        i.updateDirection(newDirection);
    }
    update();

    document.addEventListener("keyup",movePacman);
}


function loadImages(){
    wallImage = new Image();
    wallImage.src = "./Assets/wall.png";

    blueGhostImage = new Image();
    blueGhostImage.src = "./Assets/blueGhost.png";
    orangeGhostImage = new Image();
    orangeGhostImage.src = "./Assets/orangeGhost.png";
    pinkGhostImage = new Image();
    pinkGhostImage.src = "./Assets/pinkGhost.png";
    redGhostImage = new Image();
    redGhostImage.src = "./Assets/redGhost.png";

    pacmanUpImage = new Image();
    pacmanUpImage.src = "./Assets/pacmanUp.png";
    pacmanDownImage = new Image();
    pacmanDownImage.src = "./Assets/pacmanDown.png";
    pacmanLeftImage = new Image();
    pacmanLeftImage.src = "./Assets/pacmanLeft.png";
    pacmanRightImage = new Image();
    pacmanRightImage.src = "./Assets/pacmanRight.png";

}

function loadMap(){
    walls.clear()
    foods.clear()
    ghosts.clear()

    for(let r=0;r<rowCount;r++){
        for(let c=0;c<colCount;c++){
            const row = tileMap[r];
            const tileMapChar = row[c];

            const x =c*tileSize;
            const y =r*tileSize;

            if(tileMapChar == 'X'){
                const wall = new Block(wallImage, tileSize, tileSize, x, y);
                walls.add(wall);
            }else if(tileMapChar == 'b'){
                const ghost = new Block(blueGhostImage, tileSize, tileSize, x, y);
                ghosts.add(ghost);
            }else if(tileMapChar == 'p'){
                const ghost = new Block(pinkGhostImage, tileSize, tileSize, x, y);
                ghosts.add(ghost);
            }else if(tileMapChar == 'o'){
                const ghost = new Block(orangeGhostImage, tileSize, tileSize, x, y);
                ghosts.add(ghost);
            }else if(tileMapChar == 'r'){
                const ghost = new Block(redGhostImage, tileSize, tileSize, x, y);
                ghosts.add(ghost);
            }else if(tileMapChar == 'P'){
                pacman = new Block(pacmanRightImage, tileSize, tileSize, x, y);
            }else if(tileMapChar == ' '){
                const food = new Block(null, 4, 4, x + 14, y + 14);
                foods.add(food);
            }
        }
    }
}

function update(){
    if(gameOver){
        draw();
        return;
    }
    move();
    draw();
    setTimeout(update, 50);
}

function draw(){
    context.clearRect(0,0,board.width,board.height);
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
    for(let i of ghosts.values()){
        context.drawImage(i.image, i.x,i.y,i.width,i.height);
    }
    for(let i of walls.values()){
        context.drawImage(i.image,i.x,i.y,i.width, i.height);
    }
    context.fillStyle = "white";
    for(let i of foods.values()){
        context.fillRect(i.x,i.y,i.width,i.height);
    }
    context.fillStyle = "white";
    if(gameOver){
        context.fillStyle = "yellow";
        context.font = "48px sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("Game Over: "+String(score), board.width/2, board.height/2);
        context.textAlign = "start";
    }else{
        context.font = "14px sans-serif";
        context.fillText("Lives: "+String(lives)+ " "+score,tileSize/2,tileSize/2);
    }

}

function move(){
    if(gameOver){
        return;
    }
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;
    for(let i of walls.values()){
        if(collision(pacman,i)){
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break; 
        }
    }
    if(pacman.x<0){
        pacman.x = boardWidth;
    }else if(pacman.x>boardWidth){
        pacman.x = 0;
    }
    for(let i of ghosts.values()){
        if(collision(i,pacman)){
            lives -= 1;
            if(lives == 0){
                gameOver =true;
                kill();
                return;
            }
        }
        i.x += i.velocityX;
        i.y += i.velocityY;
        for(let j of walls.values()){
            if(collision(i,j)){
                i.x -= i.velocityX;
                i.y -= i.velocityY;
                const newDirection = directions[Math.floor(Math.random()*4)];
                i.updateDirection(newDirection, false);
            }
        }

        if(i.x % tileSize === 0 && i.y % tileSize === 0 && Math.random() < ghostTurnChance){
            const validDirections = directions.filter(direction => canMove(i, direction));
            if(validDirections.length > 0){
                const newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
                i.updateDirection(newDirection, false);
            }
        }

        if(i.x <0){
            i.x = board.width;
        }else if(i.x>board.width){
            i.x =0;
        }
    }
    let foodEaten = null;
    for(let i of foods.values()){
        if(collision(pacman,i)){
            foodEaten = i;
            score += 5;
            break;
        }
    }
    foods.delete(foodEaten)
}

function movePacman(e){
    if(gameOver){
        return;
    }
    if(e.code == "ArrowUp"){
        pacman.updateDirection('U');
    }else if(e.code == "ArrowDown"){
        pacman.updateDirection('D');
    }else if(e.code == "ArrowRight"){
        pacman.updateDirection('R');
    }else if(e.code == "ArrowLeft"){
        pacman.updateDirection('L');
    }
    if(pacman.direction=='U'){
        pacman.image = pacmanUpImage;
    }else if(pacman.direction == 'R'){
        pacman.image = pacmanRightImage;
    }else if(pacman.direction == 'L'){
        pacman.image = pacmanLeftImage;
    }else if(pacman.direction == 'D'){
        pacman.image = pacmanDownImage;
    }
}

function collision(a,b){
    return a.x < b.x +b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function canMove(block, direction){
    const nextBlock = new Block(null, block.width, block.height, block.x, block.y);

    if(direction == 'U'){
        nextBlock.y -= tileSize/4;
    }else if(direction == 'D'){
        nextBlock.y += tileSize/4;
    }else if(direction == 'R'){
        nextBlock.x += tileSize/4;
    }else if(direction == 'L'){
        nextBlock.x -= tileSize/4;
    }

    for(let wall of walls.values()){
        if(collision(nextBlock, wall)){
            return false;
        }
    }

    return true;
}
function kill(){
    if (gameOver){
        for(let i of ghosts.values()){
            i.velocityX = 0;
            i.velocityY = 0;
            pacman.velocityX = 0;
            pacman.velocityY = 0;
        }
    }
}
class Block{
    constructor(image, width, height, x, y){
        this.image = image;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        this.startX = x;
        this.startY = y;

        this.direction = 'R';
        this.velocityX = 0;
        this.velocityY = 0;
    }
    updateDirection(direction, moveNow = true){
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();

        const wasHorizontal = prevDirection == 'L' || prevDirection == 'R';
        const wasVertical = prevDirection == 'U' || prevDirection == 'D';
        const isHorizontal = direction == 'L' || direction == 'R';
        const isVertical = direction == 'U' || direction == 'D';

        if((wasVertical && isHorizontal) || (wasHorizontal && isVertical)){
            if(isHorizontal){
                const snappedY = Math.round(this.y / tileSize) * tileSize;
                if(Math.abs(snappedY - this.y) <= turnTolerance){
                    this.y = snappedY;
                }
            }else if(isVertical){
                const snappedX = Math.round(this.x / tileSize) * tileSize;
                if(Math.abs(snappedX - this.x) <= turnTolerance){
                    this.x = snappedX;
                }
            }
        }

        if(!moveNow){
            return;
        }

        this.x += this.velocityX;
        this.y += this.velocityY;

        for(let i of walls.values()){
            if(collision(this, i)){
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDirection;
                this.updateVelocity();
                return;
            }
        }

    }
    updateVelocity(){
        if(this.direction=='U'){
            this.velocityX=0;
            this.velocityY=-tileSize/4;
        }else if(this.direction=='D'){
            this.velocityX=0;
            this.velocityY=tileSize/4;
        }else if(this.direction=='R'){
            this.velocityX=tileSize/4;
            this.velocityY=0;
        }else if(this.direction=='L'){
            this.velocityX=-tileSize/4;
            this.velocityY=0;
        }
    }
}