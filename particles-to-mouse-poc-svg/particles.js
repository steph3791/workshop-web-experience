const svg = document.getElementById("particleSVG");

svg.setAttribute("width", window.innerWidth);
svg.setAttribute("height", window.innerHeight);

const particles = [];
const particleCount = 200;
let mouse = { x: 0, y: 0, isDown: false };

class Particle {
    constructor() {
        this.createNew(false);
    }

    createNew(isRespawn) {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 10 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.pullForce = 1;
        this.lifetime = Math.max(100, Math.random() * 400);
        this.isSimulated = true;

        // Create SVG circle element for each particle
        if (!isRespawn) {
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        }
        this.element.setAttribute("r", this.size / 2);
        this.element.setAttribute("fill", "white");
        if (!isRespawn) {
            svg.appendChild(this.element);
        }

        this.updatePosition();
    }

    updatePosition() {
        this.element.setAttribute("cx", this.x);
        this.element.setAttribute("cy", this.y);
    }

    update() {
        if (this.isSimulated) {
            if (this.lifetime > 0) {
                this.x += this.speedX;
                this.y += this.speedY;

                if (mouse.isDown) {
                    this.speedX *= 0.95;
                    this.speedY *= 0.95;

                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 5) {
                        console.log("Freeze")
                        this.freeze()
                    }

                    const directionX = dx / dist;
                    const directionY = dy / dist;

                    const maxDistance = 150; // Radius around cursor
                    const force = Math.min(dist / maxDistance, 1);
                    this.speedX += directionX * force * this.pullForce;
                    this.speedY += directionY * force * this.pullForce;
                }

                // Screen wrapping for particles
                if (this.x > window.innerWidth) this.x = 0;
                if (this.x < 0) this.x = window.innerWidth;
                if (this.y > window.innerHeight) this.y = 0;
                if (this.y < 0) this.y = window.innerHeight;

                this.lifetime--;
                this.updatePosition();
            } else {
                this.createNew(true);
            }
        }

    }

    freeze() {
        this.isSimulated = false;
        this.createNew(false)
    }
}

function initParticles() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    particles.forEach(particle => {
        particle.update();
    });

    requestAnimationFrame(animateParticles);
}

// Event listeners for mouse interaction
svg.addEventListener("mousedown", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.isDown = true;
});

svg.addEventListener("mouseup", () => {
    mouse.isDown = false;
});

svg.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

window.addEventListener("resize", () => {
    svg.setAttribute("width", window.innerWidth);
    svg.setAttribute("height", window.innerHeight);
});

// Initialize and start the animation
initParticles();
animateParticles();
