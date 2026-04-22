const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

ctx.fillStyle = 'yellow';
ctx.beginPath();
ctx.arc(100,100,20,0,Math.PI*2);
ctx.fill();

let pacX = 280;
let pacY = 310;
const speed = 4;

let dirX = 0;
let dirY = 0;

document.addEventListener('keydown',function(event){
    if(event.key === 'ArrowUp'){
        dirX = 0;
        dirY = speed;
    }
});