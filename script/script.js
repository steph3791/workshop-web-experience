const canvasElements = [
    document.getElementById("hh1"),
    document.getElementById("h1"),
    document.getElementById("mm1"),
    document.getElementById("m1"),
    document.getElementById("hh2"),
    document.getElementById("h2"),
    document.getElementById("mm2"),
    document.getElementById("m2"),
];
const width = Math.floor(window / innerWidth / canvasElements.length)
const height = 200;

function initializeDefaults() {
    console.log("Initialize Defaults")
    canvasElements.forEach(c => {
        c.width = width
        c.height = height
    })
}

initializeDefaults();

let particles = [];
const numberOfParticles = 5000;
const letterData = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
};

// Create a hidden off-screen canvas
const offCanvas = document.createElement('canvas');
const offCtx = offCanvas.getContext('2d');

offCanvas.width = width;  // Size for rendering each letter
offCanvas.height = height;

offCtx.fillStyle = 'white';
offCtx.textAlign = "center";
offCtx.textBaseline = "middle";
offCtx.font = "80px Arial"; // Font size to fit in the canvas

// Function to extract letter shape data
function extractLetterShape(letter) {
    console.log("ExtractLetterShape: " + letter)
    offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);

    // Draw the number (0-9) in the center of the offCanvas
    offCtx.fillText(letter, offCanvas.width / 2, offCanvas.height / 2);

    // Extract the image data (pixel data) from the canvas
    const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const data = imageData.data;
    const shape = [];

    // Loop through the pixels and find non-transparent (white) pixels
    for (let y = 0; y < offCanvas.height; y++) {
        for (let x = 0; x < offCanvas.width; x++) {
            const alphaIndex = (y * offCanvas.width + x) * 4 + 3; // 4th index (Alpha channel)
            if (data[alphaIndex] > 128) { // Check if alpha is greater than 128 (non-transparent)
                shape.push({x, y});
            }
        }
    }

    return shape; // Return the list of pixel coordinates that make up the letter
}

// Loop through each key in letterData (0-9) and fill it with the corresponding shape data
for (let num = 0; num <= 9; num++) {
    console.log("Processing letter shape: " + num)
    letterData[num] = extractLetterShape(num);
}

// Now, letterData[0], letterData[1], ..., letterData[9] will contain the respective number shape data
console.log(letterData);

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 2.5;
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

        if (this.size > 2) this.size -= 0.01; // Gradually shrink particles
    }

    draw() {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    finished() {
        return Math.abs(this.targetX - this.x) < 0.2 || Math.abs(this.targetY - this.y) < 0.2
    }
}

// Initialize particles and assign them random target positions from the letter "O"
function init() {
    const particlesPerCanvas = Math.floor(10000 / canvasElements.length);
    for (let i = 0; i < canvasElements.length-1; i++) {
        for (let j = 0; j < particlesPerCanvas; j++) {
            const particle = new Particle();
            const target = letterData[i][Math.floor(Math.random() * letterData[0].length)];
            particle.targetX = target.x * 3 + (canvas.width / 2 - offCanvas.width * 1.5 / 2); // Scale and center the shape
            particle.targetY = target.y * 3 + (canvas.height / 2 - offCanvas.height * 1.5 / 2);

            particles.push(particle);
        }
    }
    // for (let i = 0; i < numberOfParticles; i++) {
    //     const particle = new Particle();
    //
    //     // Randomly assign a target position from the "O" shape
    //     const target = letterData[9][Math.floor(Math.random() * letterData[9].length)];
    //     particle.targetX = target.x * 3 + (canvas.width / 2 - offCanvas.width * 1.5 / 2); // Scale and center the shape
    //     particle.targetY = target.y * 3 + (canvas.height / 2 - offCanvas.height * 1.5 / 2);
    //
    //     particles.push(particle);
    // }
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
