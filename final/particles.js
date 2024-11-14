import {Particle, ParticleSystem} from './particles2.js';


document.addEventListener("DOMContentLoaded", function () {
    console.log("Loading particles")
    const svg = document.getElementById("timeline");
    const line = document.getElementById("timelineLine");

    let mouse = {x: 0, y: 0, isDown: false};

    const particleSystem = new ParticleSystem(svg);

    function start() {
        particleSystem.animate()
        requestAnimationFrame(start);
    }

    svg.addEventListener("mouseup", () => {
        mouse.isDown = false;

    });

    svg.addEventListener("mousemove", (event) => {
        mouse.x = event.clientX;
    });

    line.addEventListener("mousedown", (event) => {
        console.log("Clicked on line")
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.isDown = true;
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
//     initParticles();
//     animateParticles();
    start()
})



