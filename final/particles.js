import {Particle} from './particles2.js';

document.addEventListener("DOMContentLoaded", function () {
    console.log("Loading particles")
    const svg = document.getElementById("timeline");
    const line = document.getElementById("timelineLine");

    const svgWidth = svg.getBoundingClientRect().width;
    const svgHeight = svg.getBoundingClientRect().height;

    console.log("SVG Width: " + svgWidth + " SVGHeight: " + svgHeight);
    const particles = [];
    const placedParticles = [];
    const particleCount = 500;
    let mouse = {x: 0, y: 0, isDown: false};

    function initParticles() {
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(svgWidth, svgHeight, 'timeline'));
        }
    }

    function animateParticles() {
        particles.forEach(particle => {
            particle.update();
            particle.setIsSimulated(true)
        });

        placedParticles.forEach(p => {
            if (svg.contains(p.getElement())) svg.removeChild(p.getElement());
        })
        placedParticles.splice(0, placedParticles.length - 1);
        console.log("PlacedParticles: " + placedParticles.length + " Particles: " + particles.length + " Children: " + svg.children.length)
        requestAnimationFrame(animateParticles);
    }

    svg.addEventListener("mouseup", () => {
        mouse.isDown = false;

    });

    svg.addEventListener("mousemove", (event) => {
        mouse.x = event.clientX;
        if (mouse.isDown) {
            drawTimerange()
        }
    });

    line.addEventListener("mousedown", (event) => {
        console.log("Clicked on line")
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.isDown = true;
        initializeTimerangeDraw()
    })

    // function initializeTimerangeDraw() {
    //     timeline.setAttribute('stroke-width', 20);
    //     timeline.setAttribute('stroke', 'white')
    //     timeline.setAttribute('x1', mouse.x)
    //     timeline.setAttribute('x2', mouse.x * 0.95)
    // }
    //
    // function drawTimerange() {
    //     timeline.setAttribute('x2', mouse.x)
    // }
    //
    // function clearTimeRange() {
    //     timeline.setAttribute('stroke-width', 0);
    // }

    // window.addEventListener("resize", () => {
    //     svg.setAttribute("width", window.innerWidth);
    //     svg.setAttribute("height", window.innerHeight);
    // });

// Initialize and start the animation
    initParticles();
    animateParticles();
})



