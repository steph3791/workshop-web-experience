export class Particle {
    /**
     * Creates a new particle
     * @param svg : SVGElement
     */
    constructor(svg, areaRadius, clickPosX, clickPosY) {
        this.svgParent = svg;
        const [minX, minY, width, height] = svg.getAttribute('viewBox').split(' ').map(Number);
        this.rangeWidth = width;
        this.rangeHeight = height;
        console.log("RangeWidth: " + this.rangeWidth);
        this.createNew(false, areaRadius, clickPosX, clickPosY);
    }

    createNew(isRespawn, areaRadius, clickPosX, clickPosY, size = 10) {
        const [minX, minY, width, height] = this.svgParent.getAttribute('viewBox').split(' ').map(Number);
        this.x = clickPosX || Math.random() * this.rangeWidth;
        this.y = clickPosY || Math.random() * this.rangeHeight;
        this.size = Math.max(1, Math.random() * width / 150 + 1);
        this.speedX = this.initSpeed();
        this.speedY = this.initSpeed();
        this.pullForce = 1;
        this.lifetime = Math.max(100, Math.random() * 400);
        this.isSimulated = true;
        this.targetDefined = false;
        this.targetX = 0;
        this.targetY = 0;

        if (!isRespawn) {
            console.debug("Creating new SVg Element")
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        }
        this.element.setAttribute("r", this.size / 2);
        this.element.setAttribute("fill", "white");
        if (!isRespawn) {
            console.log("Adding element to svg")
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
            // if (this.lifetime > 0) {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.targetDefined) {
                    this.speedX *= 0.95;
                    this.speedY *= 0.95;

                    const dx = this.targetX - this.x;
                    const dy = this.targetY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= 0.2){
                        this.isSimulated = false;
                    }

                    const directionX = dx / dist;
                    const directionY = dy / dist;

                    const maxDistance = 150; // Radius around cursor
                    const force = Math.min(dist / maxDistance, 1);
                    this.speedX += directionX * force * this.pullForce;
                    this.speedY += directionY * force * this.pullForce;
                }

                this.lifetime--;
                this.updatePosition();

            } else {
                console.log("Lifetime ended at: ");
                console.log(this.element);
            }
        // }
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

    updateViewBox() {
        this.updateSize(1)
    }

    updateSize(min = 5) {
        const [minX, minY, width, height] = this.svgParent.getAttribute('viewBox').split(' ').map(Number);
        this.size = Math.max(min, Math.random() * width / 150 + 1);
        this.element.setAttribute("r", this.size / 2);
    }
}

export class ParticleSystem {
    constructor(svg) {
        this.svgParent = svg;
        this.particles = [];
        this.placedParticles = [];
        this.startTimeline = 0;
        this.endTimeline = 0;
        this.timeline = null;
    }

    setStartPoint(x) {
        this.startTimeline =x;
        console.log("StartTimeline: " + this.startTimeline)
    }

    setEndPoint(x) {
        this.endTimeline = x;
        console.log("EndTimeline: " + this.endTimeline)
    }

    addParticles( clickPosX, clickPosY,n = 2, areaRadius = 50) {
        for (let i = 0; i < n; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const distance = Math.random() * areaRadius;
            const x = clickPosX + distance * Math.cos(theta);
            const y = clickPosY + distance * Math.sin(theta);

            this.particles.push(new Particle(this.svgParent, areaRadius, x, y))
        }
    }

    animate() {
        let placedCopy = this.placedParticles;
        placedCopy.forEach(p => {
            p.update();
            if (!p.isSimulated) {
                let index = this.placedParticles.indexOf(p);
                this.placedParticles.splice(index, 1);
                this.svgParent.removeChild(p.element)
                this.growTimeline()
            }
        })
    }

    growTimeline() {
        if (this.timeline == null) {
            this.timeline = document.createElementNS("http://www.w3.org/2000/svg", "line");
            this.timeline.setAttribute('x1', this.startTimeline);
            this.timeline.setAttribute('x2', this.startTimeline);
            this.timeline.setAttribute('y1', '50'); // Mittig auf der Y-Achse
            this.timeline.setAttribute('y2', '50');
            this.timeline.setAttribute('stroke-width', '10');


            this.svgParent.appendChild(this.timeline)
        }
        // const x2 = Number(this.timeline.getAttribute('x2')) + 0.2;
        // console.log("X: " + x2);
        // this.timeline.setAttribute('y1', '50'); // Mittig auf der Y-Achse
        // this.timeline.setAttribute('x2', `${x2}`);
        // this.timeline.setAttribute('y2', '50');
        // this.timeline.setAttribute('stroke', 'black');
        // this.timeline.setAttribute('stroke-width', '6');
        // this.timeline.setAttribute('id', 'timelineLine');
    }

    finishTimeline() {
        this.timeline.setAttribute('x2', this.endTimeline)
    }

    async udateViewBox() {
        console.log("Update particle viewBox")
        this.particles.forEach(particle => {
            particle.updateViewBox();
        });

        this.placedParticles.forEach(p => {
            p.updateViewBox()
        })
    }

    goToTarget(clientX, clientY) {
        console.log("GoToTarget: " + clientX + " " + clientY)
        this.particles.forEach(particle => {
            particle.setTarget(clientX, clientY);
            this.placedParticles.push(particle);
        });
        this.particles = []
    }
}

export function transformToSvgCoords(svg, clientX, clientY) {
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = clientX;
    svgPoint.y = clientY;

    const ctm = svg.getScreenCTM();
    return svgPoint.matrixTransform(ctm.inverse());
}
