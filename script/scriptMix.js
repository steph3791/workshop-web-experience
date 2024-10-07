const canvas = document.getElementById('particleCanvasMix');
const ctx = canvas.getContext('2d');

let mouse = {x:0, y:0};
let radius = 1;
let copy = document.querySelector("#copy");

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let numberOfParticles = 5000;
let letterOData = []; // To store the pixel positions of the letter "O"

// Create an off-screen canvas to draw the letter "O"
const offCanvas = document.createElement('canvas');
const offCtx = offCanvas.getContext('2d');

offCanvas.width = 200;  // Resolution of the letter "O"
offCanvas.height = 200;

offCtx.fillStyle = 'white';
offCtx.font = "150px Arial";
offCtx.textAlign = "center";
offCtx.textBaseline = "middle";
offCtx.fillText(copy.value, offCanvas.width / 2, offCanvas.height / 2);


// Extract image data to find white pixels
const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
const data = imageData.data;

// // Store the positions of the pixels that form the letter "O"
// for (let y = 0; y < offCanvas.height; y++) {
//     for (let x = 0; x < offCanvas.width; x++) {
//         const alphaIndex = (y * offCanvas.width + x) * 4 + 3; // 4th index (Alpha channel)
//         if (data[alphaIndex] > 128) { // If alpha > 128, it's part of the "O"
//             letterOData.push({ x, y });
//         }
//     }
// }

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.dest = {
            x : x,
            y: y
        };
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 5 - 2.5; // Random speed in X
        this.speedY = Math.random() * 5 - 2.5; // Random speed in Y
        this.targetX = null;
        this.targetY = null;
        this.accX = 0;
        this.accY = 0;
        this.friction = Math.random()*0.05 + 0.94;
    }

    // Move particle towards target
    update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.x += dx * 0.05; // Move a small percentage towards the target
        this.y += dy * 0.05;

        this.accX = (this.dest.x - this.x)/1000;
        this.accY = (this.dest.y - this.y)/1000;
        this.speedX += this.accX;
        this.speedY += this.accY;
        this.vx *= this.friction;
        this.vy *= this.friction;

        if (this.size > 0.2) this.size -= 0.01; // Gradually shrink particles

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

    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, Math.PI * 2, false);
        ctx.fill();
    }
}

// Initialize particles and assign them random target positions from the letter "O"
function init() {
    ctx.font = "bold "+(offCanvas.width/10)+"px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(copy.value, offCanvas.width/2, offCanvas.height/2);

    ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);

    // for (let i = 0; i < numberOfParticles; i++) {
    //     const particle = new Particle();
    //
    //     // Randomly assign a target position from the "O" shape
    //     const target = letterOData[Math.floor(Math.random() * letterOData.length)];
    //     particle.targetX = target.x * 3 + (offCanvas.width / 2 - offCanvas.width * 1.5 / 2); // Scale and center the shape
    //     particle.targetY = target.y * 3 + (offCanvas.height / 2 - offCanvas.height * 1.5 / 2);
    //
    //     particles.push(particle);
    // }

    ctx.globalCompositeOperation = "screen";

    particles = [];
    for(var i=0;i<offCanvas.width;i+=Math.round(offCanvas.width/150)){
        for(var j=0;j<offCanvas.height;j+=Math.round(offCanvas.width/150)){
            if(data[ ((i + j*offCanvas.width)*4) + 3] > 150){
                particles.push(new Particle(i,j));
            }
        }
    }
    numberOfParticles = particles.length;


}

// Animate the particles
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
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

function onTouchEnd(e){
    mouse.x = -9999;
    mouse.y = -9999;
}

function onMouseClick(){
    radius++;
    if(radius ===5){
        radius = 0;
    }
}


copy.addEventListener("keyup", initScene);
window.addEventListener("resize", initScene);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("touchmove", onTouchMove);
window.addEventListener("click", onMouseClick);
window.addEventListener("touchend", onTouchEnd);

init();
animate();
