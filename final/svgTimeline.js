import {ParticleSystem} from "./particles2.js";

document.addEventListener("DOMContentLoaded", function () {
    const svg = document.getElementById('timeline');
    const particleSystem = new ParticleSystem(svg);

    // Initiale ViewBox-Parameter
    let zoomLevel = 1;
    // Initiale ViewBox-Parameter mit Padding
    let padding = 50; // Beispielwert, je nach Bedarf anpassen
    let viewBox = {
        x: -padding,
        y: 0,
        width: 1440 + padding,
        height: 100,
    };

    // Pan-Funktionalität
    let isPanning = false;
    let startPoint = {x: 0, y: 0};
    let startViewBoxX = 0;


    // Horizontale Linie für den Zeitstrahl zeichnen
    const timelineLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    timelineLine.setAttribute('x1', '0');
    timelineLine.setAttribute('y1', '50'); // Mittig auf der Y-Achse
    timelineLine.setAttribute('x2', '1600');
    timelineLine.setAttribute('y2', '50');
    timelineLine.setAttribute('stroke', 'black');
    timelineLine.setAttribute('stroke-width', '2');
    timelineLine.setAttribute('id', 'timelineLine');

    svg.appendChild(timelineLine);
    console.log("Appended timeline")


    // Definieren der verschiedenen Tick-Typen
    const tickTypes = [
        {
            interval: 60, // Stunden-Ticks
            className: 'timeline-vertical-line-hour',
            length: 20,   // Länge der Tick-Markierung
            minZoomLevel: 1,
            showLabel: true,
            labelOffset: 30, // Abstand des Labels unterhalb des Tick-Strichs
            fontSize: 16,    // Schriftgröße in Pixeln
        },
        {
            interval: 30, // Halbstunden-Ticks
            className: 'timeline-vertical-line-halfHour',
            length: 15,
            minZoomLevel: 2,
            showLabel: true,
            labelOffset: 20,
            fontSize: 14,    // Schriftgröße in Pixeln
        },
        {
            interval: 15, // Viertelstunden-Ticks
            className: 'timeline-vertical-line-quarterHour',
            length: 10,
            minZoomLevel: 4,
            showLabel: true,
            labelOffset: 10,
            fontSize: 12,    // Schriftgröße in Pixeln
        },
        {
            interval: 5, // 5-Minuten-Ticks
            className: 'timeline-vertical-line-fiveMinutes',
            length: 7,
            minZoomLevel: 8,
            showLabel: false,
            labelOffset: 5, // Kürzerer Abstand für 5-Minuten-Ticks
            fontSize: 10,    // Schriftgröße in Pixeln
        },
        {
            interval: 1, // 1-Minuten-Ticks
            className: 'timeline-vertical-line-oneMinute',
            length: 5,
            minZoomLevel: 16,
            showLabel: false,
            labelOffset: 2,
            fontSize: 10,    // Schriftgröße in Pixeln
        },
    ];

    // Funktion zur Berechnung der Schriftgröße
    function getFontSize() {
        let fontSize;
        if (zoomLevel <= 14) {
            fontSize = 24 / zoomLevel; // Größere Schriftgröße bei Zoomlevel 1–4
        } else {
            fontSize = 52 / zoomLevel; // Kleinere Schriftgröße bei höheren Zoomlevels
        }
        console.log(`ZoomLevel: ${zoomLevel}, FontSize: ${fontSize}`);
        return fontSize;
    }

    // Funktion zum Berechnen der Pixel pro Minute
    function getPixelsPerMinute() {
        const svgRect = svg.getBoundingClientRect();
        return svgRect.width / viewBox.width;
    }


    // Funktion zum Aktualisieren der Tick-Markierungen basierend auf dem Zoomlevel
    function updateTicks() {
        // Entferne bestehende Ticks und Beschriftungen
        svg.querySelectorAll('.tick').forEach(tick => tick.remove());
        svg.querySelectorAll('.tick-label').forEach(label => label.remove());

        const pixelsPerMinute = getPixelsPerMinute();
        const minPixelDistance = 40; // Mindestpixelabstand zwischen Labels
        const minTickInterval = Math.ceil(minPixelDistance / pixelsPerMinute);

        let currentLabelTickType = null;

        // Bestimme den höchstaufgelösten sichtbaren Tick-Typ für Beschriftungen
        for (let i = tickTypes.length - 1; i >= 0; i--) {
            const tickType = tickTypes[i];
            if (zoomLevel >= tickType.minZoomLevel) {
                if (tickType.showLabel) {
                    currentLabelTickType = tickType;
                    break;
                }
            }
        }

        tickTypes.forEach(tickType => {
            if (zoomLevel >= tickType.minZoomLevel) {
                // Übergebe den Tick-Typ und ob er Labels zeigen soll
                addTicksForTickType(tickType, tickType === currentLabelTickType);
            }
        });
    }

    // Funktion zum Hinzufügen von Ticks für einen bestimmten Tick-Typ
    function addTicksForTickType(tickType, showLabel) {
        const startX = viewBox.x;
        const endX = viewBox.x + viewBox.width;

        const startMinute = Math.floor(startX);
        const endMinute = Math.ceil(endX);

        const firstTick = Math.ceil(startMinute / tickType.interval) * tickType.interval;

        for (let i = firstTick; i <= endMinute; i += tickType.interval) {
            const x = i;
            const y1 = 50 - tickType.length / 2;
            const y2 = 50 + tickType.length / 2;

            // Prüfen, ob der Tick bereits existiert
            let tick = svg.querySelector(`.tick.${tickType.className}[data-x="${x}"]`);
            if (!tick) {
                tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                tick.setAttribute('x1', x);
                tick.setAttribute('y1', y1);
                tick.setAttribute('x2', x);
                tick.setAttribute('y2', y2);
                tick.setAttribute('class', `tick ${tickType.className}`);
                tick.setAttribute('data-x', x); // Attribut zur Identifikation
                svg.appendChild(tick);
            } else {
                console.log(`Tick bereits vorhanden bei x=${x}`);
            }

            // Beschriftungen hinzufügen, wenn es der aktuelle Tick-Typ ist
            if (showLabel) {
                // Prüfen, ob bereits ein Label an dieser Position existiert
                let existingLabel = svg.querySelector(`.tick-label[data-x="${x}"]`);
                if (!existingLabel) {
                    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    label.setAttribute('x', x);
                    // Verwendung des spezifischen labelOffset für die y-Position
                    label.setAttribute('y', y2 + tickType.labelOffset);
                    label.setAttribute('class', 'tick-label');
                    label.setAttribute('data-x', x); // Attribut zur Identifikation
                    label.style.fontSize = getFontSize(); // Schriftgröße über style setzen
                    label.setAttribute('stroke', 'none');
                    label.textContent = formatTime(i);
                    svg.appendChild(label);
                    setTimeout(() => {
                        label.style.opacity = 1;
                    }, 10);
                } else {
                    console.log(`Beschriftung bereits vorhanden bei x=${x}`);
                }
            }
        }
    }

    // Hilfsfunktion zur Formatierung der Zeit
    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${mins.toString().padStart(2, '0')}`;
    }

    // In der updateViewBox Funktion:
    function updateViewBox(mouseX) {
        const svgRect = svg.getBoundingClientRect();
        const mouseXRelativeToSvg = mouseX - svgRect.left;

        const mouseXInViewBox = viewBox.x + (mouseXRelativeToSvg / svgRect.width) * viewBox.width;

        const newWidth = 1440 / zoomLevel + padding; // Padding berücksichtigen

        viewBox.x = mouseXInViewBox - ((mouseXInViewBox - viewBox.x) * (newWidth / viewBox.width));

        // Begrenzungen sicherstellen
        if (viewBox.x < -padding) {
            viewBox.x = -padding;
        }
        if (viewBox.x + newWidth > 1440 + padding) {
            viewBox.x = 1440 + padding - newWidth;
        }

        viewBox.width = newWidth;

        svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    }

    function renderParticles() {
        particleSystem.animate()
        requestAnimationFrame(renderParticles);
    }

    // Event Listener für Mausrad zum Zoomen
    svg.addEventListener('wheel', function (e) {
        e.preventDefault();
        const scaleAmount = 1.2;
        if (e.deltaY < 0) {
            // Reinzoomen
            zoomLevel *= scaleAmount;
            console.log('Reinzoomen, zoomLevel:', zoomLevel);
            if (zoomLevel > 32) {
                zoomLevel = 32; // Maximales Zoomlevel
                console.log(`ZoomLevel auf 22 begrenzt`);
            }
        } else {
            // Rauszoomen
            zoomLevel /= scaleAmount;
            console.log('Rauszoomen, zoomLevel:', zoomLevel);
            if (zoomLevel < 1) {
                zoomLevel = 1; // Minimales Zoomlevel
                console.log(`ZoomLevel auf 1 begrenzt`);
            }
        }
        updateViewBox(e.clientX);
        updateTicks();
    });

    // Event Listener für Mausereignisse zum Panning
    svg.addEventListener('mousedown', function (e) {
        if (e.button === 2) {
            console.debug("right button click")
            isPanning = true;
            startPoint = {x: e.clientX, y: e.clientY};
            startViewBoxX = viewBox.x;
        }
    });

    svg.addEventListener('mousemove', function (e) {
        if (isPanning) {
            e.preventDefault();
            const dx = e.clientX - startPoint.x;
            const svgRect = svg.getBoundingClientRect();
            const deltaX = (dx / svgRect.width) * viewBox.width;

            viewBox.x = startViewBoxX - deltaX;

            // Begrenzungen sicherstellen
            if (viewBox.x < 0) {
                viewBox.x = 0;
            }
            if (viewBox.x + viewBox.width > 1440) {
                viewBox.x = 1440 - viewBox.width;
            }

            svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
            updateTicks();
        }
    });

    svg.addEventListener('mouseup', function () {
        isPanning = false;
    });

    svg.addEventListener('mouseleave', function () {
        isPanning = false;
    });

    svg.addEventListener('contextmenu', function (event) {
        event.preventDefault()
    })

    // Initiales Zeichnen der Tick-Markierungen
    updateTicks();
    renderParticles()
    console.log("Finished loading svgTimeline")
});

