const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 200;
let mouse = { x: 0, y: 0, isDown: false };

class Particle {
    constructor(x, y) {
        this.createNew(x,y)
    }

    createNew(x,y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.size = Math.random() * 10 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.pullForce = 1;
        this.lifetime = Math.max(100, Math.random() * 400);
    }

    update() {
        if (this.lifetime > 0) {
            this.x += this.speedX;
            this.y += this.speedY;

            if (mouse.isDown) {
                this.speedX *= 0.95;
                this.speedY *= 0.95;

                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const directionX = dx / dist;
                const directionY = dy / dist;

                const maxDistance = 150; //Radius around cursor
                const force = Math.min(dist / maxDistance, 1);
                this.speedX += directionX * force * this.pullForce;
                this.speedY += directionY * force * this.pullForce;
            }

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
            this.lifetime--;
        } else {
            this.createNew()
        }

    }

    // Draw particle
    draw() {
        ctx.fillStyle = "rgba(255,0,0,1)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

function initParticles() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animateParticles);
}

canvas.addEventListener("mousedown", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.isDown = true;
});

canvas.addEventListener("mouseup", () => {
    mouse.isDown = false;
});

canvas.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Initialize and start the animation
initParticles();
animateParticles();
