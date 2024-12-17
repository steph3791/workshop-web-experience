import {ParticleSystem, transformToSvgCoords} from "./particles2.js";

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

    //Drag Funktion
    let isMouseDown = false;


    // Horizontale Linie für den Zeitstrahl zeichnen
    const timelineLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    timelineLine.setAttribute('x1', '0');
    timelineLine.setAttribute('y1', '50'); // Mittig auf der Y-Achse
    timelineLine.setAttribute('x2', '1440');
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
            labelOffset: 25, // Abstand des Labels unterhalb des Tick-Strichs
            fontSize: 15,    // Schriftgröße in Pixeln
            radius: 10,
            color: '#03008C',
        },
        {
            interval: 30, // Halbstunden-Ticks
            className: 'timeline-vertical-line-halfHour',
            length: 15,
            minZoomLevel: 2,
            showLabel: true,
            labelOffset: 20,
            fontSize: 14,    // Schriftgröße in Pixeln
            radius: 7,
            color: '#4A90E2',
        },
        {
            interval: 15, // Viertelstunden-Ticks
            className: 'timeline-vertical-line-quarterHour',
            length: 10,
            minZoomLevel: 8,
            showLabel: true,
            labelOffset: 15,
            fontSize: 12,    // Schriftgröße in Pixeln
            radius: 5,
            color: '#A5C9F9',
        },
        {
            interval: 5, // 5-Minuten-Ticks
            className: 'timeline-vertical-line-fiveMinutes',
            length: 7,
            minZoomLevel: 20, //Ticks werden bei Zoomlevel >= 18 angezeigt
            showLabel: true,
            labelOffset: 13, // Kürzerer Abstand für 5-Minuten-Ticks
            fontSize: 8,    // Schriftgröße in Pixeln
            radius: 2,
            color: '#d3e2f6',
        },
        {
            interval: 1, // 1-Minuten-Ticks
            className: 'timeline-vertical-line-oneMinute',
            length: 5,
            minZoomLevel: 40,
            showLabel: false,
            labelOffset: 2,
            fontSize: 8,    // Schriftgröße in Pixeln
            radius: 0.5,
            color: '#e5effc',
        },
    ];

    // Funktion zur Berechnung der Schriftgröße
    function getFontSize() {
        let fontSize;
        if (zoomLevel <= 5) {
            fontSize = 15 / zoomLevel; // Größere Schriftgröße bei Zoomlevel 1–4
        } else if (zoomLevel > 5 && zoomLevel <= 10) {
            fontSize = 20 / zoomLevel;
        } else if (zoomLevel > 10 && zoomLevel <= 15) {
            fontSize = 25 / zoomLevel;
        } else if (zoomLevel > 15 && zoomLevel <= 20) {
            fontSize = 28 / zoomLevel;
        } else if (zoomLevel > 20 && zoomLevel <= 25) {
            fontSize = 30 / zoomLevel;
        } else if (zoomLevel > 25 && zoomLevel <= 40) {
            fontSize = 35 / zoomLevel;
        } else if (zoomLevel > 40 && zoomLevel <= 60) {
            fontSize = 50 / zoomLevel;
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
        svg.querySelectorAll('.tick-label-above').forEach(label => label.remove());


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
        // Bereich von 0:00 bis 8:00(rot für weniger bevorzugte Zeiten)
        highlightTicksAndLabels(0, 480, 'red');
        // Bereich von 8:00 bis 12:00 (grün für Meetings oder zahlungspflichtige Parkzeiten)
        highlightTicksAndLabels(480, 720, 'green');
        //12:00 - 13:00
        highlightTicksAndLabels(720, 780, 'red');
        //13:00 bis 17:00
        highlightTicksAndLabels(780, 1020, 'green');
        // 17:00 bis 24:00
        highlightTicksAndLabels(1020, 1440, 'red');
    }


    function addTicksForTickType(tickType, showLabel) {
        const startX = viewBox.x;
        const endX = viewBox.x + viewBox.width;

        const startMinute = Math.floor(startX);
        const endMinute = Math.ceil(endX);

        const firstTick = Math.ceil(startMinute / tickType.interval) * tickType.interval;

        const centerY = parseFloat(timelineLine.getAttribute('y1')); // Mittige Y-Position der Timeline-Linie

        for (let i = firstTick; i <= endMinute; i += tickType.interval) {
            const x = i;

            // Prüfen, ob der Tick bereits existiert
            let tick = svg.querySelector(`.tick.${tickType.className}[data-x="${x}"]`);
            if (!tick) {
                // Kreis erstellen
                tick = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                tick.setAttribute('cx', x);               // X-Position
                tick.setAttribute('cy', centerY);         // Exakte mittige Y-Position
                tick.setAttribute('r', tickType.radius);  // Größe des Kreises
                tick.setAttribute('fill', tickType.color);
                tick.setAttribute('filter', 'url(#boxShadow)');
                tick.setAttribute('class', `tick ${tickType.className}`);
                tick.setAttribute('data-x', x);           // Zum Identifizieren
                svg.appendChild(tick);
            }

            // Beschriftungen hinzufügen
            if (showLabel) {
                addTickLabels(x, centerY, tickType);
            }
        }
    }

    function addTickLabels(x, centerY, tickType) {
        // Standard-Label unterhalb der Kreise
        let existingLabelHHMM = svg.querySelector(`.tick-label[data-x="${x}"]`);
        if (!existingLabelHHMM) {
            if (x % 15 === 0) {
                const labelHHMM = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                labelHHMM.setAttribute('x', x);
                labelHHMM.setAttribute('y', centerY + tickType.labelOffset); // Unterhalb der Linie
                labelHHMM.textContent = formatTime(x); // hh:mm Format
                labelHHMM.setAttribute('class', 'tick-label');
                labelHHMM.setAttribute('data-x', x);
                labelHHMM.style.fontSize = `${getFontSize()}px`;
                svg.appendChild(labelHHMM);
            }
        }

        // 5-Minuten-Ticks
        if (tickType.interval === 5 && !existingLabelHHMM) {
            let existingLabelMinutes = svg.querySelector(`.tick-label-above[data-x="${x}"]`);
            if (!existingLabelMinutes) {
                const minutes = x % 60;
                if (minutes !== 0 && minutes % 15 !== 0) {
                    const labelMinutes = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    labelMinutes.setAttribute('x', x);
                    labelMinutes.setAttribute('y', centerY + 0.5); // Oberhalb des Kreises
                    labelMinutes.textContent = formatMinutes(x, tickType);
                    labelMinutes.setAttribute('class', 'tick-label-above');
                    labelMinutes.setAttribute('data-x', x);
                    labelMinutes.style.fontSize = `${getFontSize()}px`;
                    svg.appendChild(labelMinutes);
                }
            }
        }
    }



    // Hilfsfunktion zur Formatierung der Zeit
    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${mins.toString().padStart(2, '0')}`; // Standardformat hh:mm
    }

    function formatMinutes(minutes, tickType) {
        if (tickType.interval === 5) {
            return minutes % 60; // Nur Minuten anzeigen
        }
    }


    // In der updateViewBox Funktion:
    function updateViewBox(mouseX) {
        const svgRect = svg.getBoundingClientRect();
        const mouseXRelativeToSvg = mouseX - svgRect.left;

        const mouseXInViewBox = viewBox.x + (mouseXRelativeToSvg / svgRect.width) * viewBox.width;

        const newWidth = 1440 / zoomLevel + padding;

        viewBox.x = mouseXInViewBox - ((mouseXInViewBox - viewBox.x) * (newWidth / viewBox.width));

        // Begrenzungen sicherstellen
        if (viewBox.x < 0) {
            viewBox.x = 0;
        }
        if (viewBox.x + newWidth > 1440) {
            viewBox.x = 1440 - newWidth;
        }

        viewBox.width = newWidth;

        svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
        particleSystem.udateViewBox();
    }

    function renderParticles() {
        particleSystem.animate()
        requestAnimationFrame(renderParticles);
    }

    function addParticleTarget(clientX) {
        const svgCoords = transformToSvgCoords(svg, clientX, timelineLine.getAttribute('y1'))
        particleSystem.goToTarget(svgCoords.x, timelineLine.getAttribute('y1'));
    }

    // Event Listener für Mausrad zum Zoomen
    svg.addEventListener('wheel', function (e) {
        e.preventDefault();
        const scaleAmount = 1.2;
        if (e.deltaY < 0) {
            // Reinzoomen
            zoomLevel *= scaleAmount;
            console.log('Reinzoomen, zoomLevel:', zoomLevel);
            if (zoomLevel > 60) {
                zoomLevel = 60; // Maximales Zoomlevel
                console.log(`ZoomLevel auf 60 begrenzt`);
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
        if (e.button === 0) {
            console.debug("left button click")
            const svgCoords = transformToSvgCoords(svg, e.clientX, e.clientY)
            particleSystem.setStartPoint(svgCoords.x)
            isMouseDown = true;
            particleSystem.addParticles(svgCoords.x, svgCoords.y);
            addParticleTarget(e.clientX);
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
        if (isMouseDown) {
            if (e.clientX % 1.5 == 0) {
                const svgCoords = transformToSvgCoords(svg, e.clientX, e.clientY)
                particleSystem.addParticles(svgCoords.x, svgCoords.y);
                addParticleTarget(e.clientX);
            }
        }

    });

    svg.addEventListener('mouseup', function (e) {
        isPanning = false;
        isMouseDown = false;
        const svgCords = transformToSvgCoords(svg, e.clientX, e.clientY);
        particleSystem.setEndPoint(svgCords.x);
        particleSystem.finishTimeline();
    });

    svg.addEventListener('mouseleave', function () {
        isPanning = false;
    });

    svg.addEventListener('contextmenu', function (event) {
        event.preventDefault()
    })

    // function addMarking(startMinute, endMinute, color) {
    //     const markingsLayer = document.getElementById('markings-layer');
    //
    //     // Rechteck für die Markierung erstellen
    //     const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    //     rect.setAttribute('x', startMinute); // Startposition in Minuten
    //     rect.setAttribute('y', 20); // Position leicht über der Zeitlinie
    //     rect.setAttribute('width', endMinute - startMinute); // Breite entspricht der Dauer
    //     rect.setAttribute('height', 60); // Höhe des Rechtecks
    //     rect.setAttribute('fill', color); // Farbe der Markierung
    //
    //     markingsLayer.appendChild(rect);
    // }

    function highlightTicksAndLabels(startMinute, endMinute, color) {
        // Alle Ticks im SVG auswählen
        const ticks = document.querySelectorAll('.tick');
        const labels = document.querySelectorAll('.tick-label, .tick-label-above');

        ticks.forEach(tick => {
            const tickX = parseInt(tick.getAttribute('x1')); // Die X-Position des Ticks
            if (tickX >= startMinute && tickX <= endMinute) {
                tick.style.stroke = color;
            }
        });

        labels.forEach(label => {
            const labelX = parseInt(label.getAttribute('x')); // Die X-Position des Labels
            if (labelX >= startMinute && labelX <= endMinute) {
                label.style.fill = color;
            }
        });
    }

    // Initiales Zeichnen der Tick-Markierungen
    updateTicks();
    renderParticles();

    // // Bereich von 0:00 bis 8:00(rot für weniger bevorzugte Zeiten)
    // addMarking(0, 480, 'red');
    // // Bereich von 8:00 bis 12:00 (grün für Meetings oder zahlungspflichtige Parkzeiten)
    // addMarking(480, 720, 'green');
    // //12:00 - 13:00
    // addMarking(720, 780, 'red');
    // //13:00 bis 17:00
    // addMarking(780, 1020, 'green');
    // // 17:00 bis 24:00
    // addMarking(1020, 1440, 'red');


});

