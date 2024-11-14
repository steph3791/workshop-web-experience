const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const numberOfParticles = 5000;
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
offCtx.fillText("07", offCanvas.width / 2, offCanvas.height / 2);

// Extract image data to find white pixels
const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
const data = imageData.data;

// Store the positions of the pixels that form the letter "O"
for (let y = 0; y < offCanvas.height; y++) {
    for (let x = 0; x < offCanvas.width; x++) {
        const alphaIndex = (y * offCanvas.width + x) * 4 + 3; // 4th index (Alpha channel)
        if (data[alphaIndex] > 128) { // If alpha > 128, it's part of the "O"
            letterOData.push({ x, y });
        }
    }
}

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 5 - 2.5; // Random speed in X
        this.speedY = Math.random() * 5 - 2.5; // Random speed in Y
        this.targetX = null;
        this.targetY = null;
    }

    // Move particle towards target
    update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.x += dx * 0.05; // Move a small percentage towards the target
        this.y += dy * 0.05;

        if (this.size > 0.2) this.size -= 0.01; // Gradually shrink particles
    }

    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize particles and assign them random target positions from the letter "O"
function init() {
    for (let i = 0; i < numberOfParticles; i++) {
        const particle = new Particle();

        // Randomly assign a target position from the "O" shape
        const target = letterOData[Math.floor(Math.random() * letterOData.length)];
        particle.targetX = target.x * 3 + (canvas.width / 2 - offCanvas.width * 1.5 / 2); // Scale and center the shape
        particle.targetY = target.y * 3 + (canvas.height / 2 - offCanvas.height * 1.5 / 2);

        particles.push(particle);
    }
}

// Animate the particles
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animate);
}

init();
animate();
