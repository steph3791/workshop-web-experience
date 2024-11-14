export class Particle {
    /**
     * Creates a new particle
     * @param svg : SVGElement
     */
    constructor(svg) {
        this.svgParent = svg;
        this.rangeWidth = svg.getBoundingClientRect().width;
        this.rangeHeight = svg.getBoundingClientRect().height;
        this.createNew(false);
    }

    createNew(isRespawn) {
        this.x = Math.random() * this.rangeWidth;
        this.y = Math.random() * this.rangeHeight;
        this.size = Math.random() * 10 + 1;
        this.speedX = this.initSpeed();
        this.speedY = this.initSpeed();
        this.pullForce = 1;
        this.lifetime = Math.max(100, Math.random() * 400);
        this.isSimulated = true;
        this.targetDefined = false;
        this.targetX = 0;
        this.targetY = 0;

        if (!isRespawn) {
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        }
        this.element.setAttribute("r", this.size / 2);
        this.element.setAttribute("fill", "white");
        if (!isRespawn) {
            this.svgParent.appendChild(this.element);
        }
        this.updatePosition();
    }

    /**
     * Creates random speed
     * @returns {number}
     */
    initSpeed() {
        return Math.random() * 3 - 1.5;
    }

    /**
     * Sets the SVG Element position to the internally calculated x and y coordinates
     */
    updatePosition() {
        this.element.setAttribute("cx", this.x);
        this.element.setAttribute("cy", this.y);
    }

    /**
     * Handles physics simulation updates such as velocity
     */
    update() {
        if (this.isSimulated) {
            if (this.lifetime > 0) {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.targetDefined) {
                    this.speedX *= 0.95;
                    this.speedY *= 0.95;

                    const dx = this.targetX - this.x;
                    const dy = this.targetY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 10) {
                        this.size = Math.min(15, this.size + 1);
                        this.element.setAttribute("r", this.size / 2);
                    }
                    if (dist < 5) {
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
                if (this.x > this.rangeWidth) this.x = 0;
                if (this.x < 0) this.x = this.rangeWidth;
                if (this.y > this.rangeHeight) this.y = 0;
                if (this.y < 0) this.y = this.rangeHeight;

                this.lifetime--;
                this.updatePosition();
            } else {
                this.createNew(true);
            }
        }
    }

    freeze() {
        this.setIsSimulated(false)
        placedParticles.push(this);
        let index = particles.indexOf(this);
        particles.splice(index, 1);
        this.svgParent.removeChild(this.element);
        particles.push(new Particle(this.svgParent))
    }

    /**
     * Returns the svg element belonging to this particle
     * @returns {SVGCircleElement | *}
     */
    getElement() {
        return this.element;
    }

    /**
     * Set whether this particle is animated or not
     * @param isSimulated : boolean
     */
    setIsSimulated(isSimulated) {
        this.isSimulated = isSimulated;
    }

    /**
     * Defines a target this particle should move towards
     * @param targetX :number x-coord of target position
     * @param targetY : number y-coord of target position
     */
    setTarget(targetX, targetY) {
        this.targetDefined = true;
        this.targetX = targetX;
        this.targetY = targetY;
    }
}

export class ParticleSystem {
    constructor(svg) {
        this.svgParent = svg;
        this.rangeWidth = svg.getBoundingClientRect().width;
        this.rangeHeight = svg.getBoundingClientRect().height;
        this.particles = [];
        this.placedParticles = [];
        this.particleCount = 500;

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.svgParent));
        }
    }

    animate() {
        this.particles.forEach(particle => {
            particle.update();
            particle.setIsSimulated(true)
        });

        this.placedParticles.forEach(p => {
            if (this.svgParent.contains(p.getElement())) this.svgParent.removeChild(p.getElement());
        })
        this.placedParticles.splice(0, this.placedParticles.length - 1);
        console.log("PlacedParticles: " + this.placedParticles.length + " Particles: " + this.particles.length + " Children: " + this.svgParent.children.length)
    }
}

