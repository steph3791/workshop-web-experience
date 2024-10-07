let canvas = document.querySelector("#scene"),
    ctx = canvas.getContext("2d"),
    particles = [],
    amount = 200,
    mouse = {x:0,y:0},
    radius = 1;

let copy = document.querySelector("#copy");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function Particle(x,y){
    this.x =  Math.random()*canvas.width;
    this.y =  Math.random()*canvas.height;
    this.dest = {
        x : x,
        y: y
    };
    this.r =  Math.random()*5 + 2;
    this.vx = (Math.random()-0.5)*20;
    this.vy = (Math.random()-0.5)*20;
    this.accX = 0;
    this.accY = 0;
    this.friction = Math.random()*0.05 + 0.94;
}

Particle.prototype.render = function() {

    this.accX = (this.dest.x - this.x)/1000;
    this.accY = (this.dest.y - this.y)/1000;
    this.vx += this.accX;
    this.vy += this.accY;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y +=  this.vy;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0,Math.PI * 2);
    ctx.fill();

    let a = this.x - mouse.x;
    let b = this.y - mouse.y;

    let distance = Math.sqrt( a*a + b*b );
    if(distance<(radius*10)){
        this.accX = (this.x - mouse.x)/100;
        this.accY = (this.y - mouse.y)/100;
        this.vx += this.accX;
        this.vy += this.accY;
    }

}

function onMouseMove(e){
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function onTouchMove(e){
    if(e.touches.length > 0 ){
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
}

function onTouchEnd(){
    mouse.x = -9999;
    mouse.y = -9999;
}

function initScene(){
    offCanvas.width = 200;  // Resolution of the letter "O"
    offCanvas.height = 200;

     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);

    ctx.font = "bold "+(offCanvas.width/10)+"px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(copy.value, offCanvas.width/2, offCanvas.height/2);

    ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
    ctx.globalCompositeOperation = "screen";

    particles = [];
    for(let i=0;i<offCanvas.width;i+=Math.round(offCanvas.width/150)){
        for(let j=0;j<offCanvas.height;j+=Math.round(offCanvas.width/150)){
            if(data[ ((i + j*offCanvas.width)*4) + 3] > 150){
                particles.push(new Particle(i,j));
            }
        }
    }
    amount = particles.length;

}

function onMouseClick(){
    radius++;
    if(radius ===5){
        radius = 0;
    }
}

function render() {
    requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < amount; i++) {
        particles[i].render();
    }
}

copy.addEventListener("keyup", initScene);
window.addEventListener("resize", initScene);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("touchmove", onTouchMove);
window.addEventListener("click", onMouseClick);
window.addEventListener("touchend", onTouchEnd);

initScene();
requestAnimationFrame(render);