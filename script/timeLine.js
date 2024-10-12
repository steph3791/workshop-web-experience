document.addEventListener("DOMContentLoaded", function () {
    const timelineList = document.getElementById("timeline-times");
    function formatTime(hour) {
        return hour < 10 ? '0' + hour + ':00' : hour + ':00';
    }

    for (let hour = 0; hour <= 23; hour++) {
        const li = document.createElement("li");

        // Erstellt ein a-Element mit einem Daten-Attribut für die Zeit
        const anchor = document.createElement("a");
        anchor.href = "#";
        anchor.setAttribute("data-date", formatTime(hour));
        anchor.classList.add("timeline-point");
        const timeLabel = document.createElement("span");
        timeLabel.textContent = formatTime(hour);

        li.appendChild(anchor);
        li.appendChild(timeLabel);

        timelineList.appendChild(li);
    }

    // Initialisiere die Breite von #timeline-times auf 100% der Container-Breite
    const timelineContainer = document.querySelector('.horizontal-timeline-container');
    const resizeElement = document.getElementById("timeline-times");
    resizeElement.style.width = `${timelineContainer.clientWidth}px`;
    // Setze currentWidth entsprechend
    currentWidth = resizeElement.offsetWidth;

});

document.addEventListener("DOMContentLoaded", function () {
    const timePoints = document.querySelectorAll("#timeline-times li a");
    let startTime = null;
    let endTime = null;

    const fillingLine = document.querySelector('.filling-line');
    const timelineContainer = document.querySelector('.horizontal-timeline-container');
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    const resizeElement = document.querySelector('#timeline-times');

    let currentWidth = resizeElement.offsetWidth;  // Startbreite der Timeline
    const viewportWidth = window.innerWidth * 0.80;

    function getOffsetRelativeToTimeline(element) {
        const elementRect = element.getBoundingClientRect();
        const timelineRect = timelineWrapper.getBoundingClientRect();
        return elementRect.left - timelineRect.left;
    }

    function updateFillingLine() {
        if (startTime && endTime) {
            const startOffset = getOffsetRelativeToTimeline(startTime);
            const endOffset = getOffsetRelativeToTimeline(endTime);
            const lineWidth = endOffset - startOffset;

            fillingLine.style.left = `${startOffset}px`;
            fillingLine.style.width = `${lineWidth}px`;
            fillingLine.style.display = 'block';
        }
    }

    function resetSelection() {
        timePoints.forEach(p => p.classList.remove("active"));
        fillingLine.style.display = 'none';
        startTime = null;
        endTime = null;
    }

    timePoints.forEach((point) => {
        point.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation(); // Verhindert, dass Event weiter zum Dokument durchgereicht wird?

            if (!startTime) {
                startTime = point;
                point.classList.add("active");
            } else if (!endTime && startTime !== point) {
                endTime = point;
                point.classList.add("active");
                updateFillingLine();
            } else {
                resetSelection();
                startTime = point;
                endTime = null;
                point.classList.add("active");
            }
        });
    });

    document.addEventListener("click", function (event) {
        if (!timelineWrapper.contains(event.target)) {
            resetSelection();
        }
    });

    document.addEventListener("wheel", function (event) {
        const zoomSpeed = 100;
        const delta = event.deltaY < 0 ? zoomSpeed : -zoomSpeed;

        // Berechne die Position der Maus relativ zur gesamten Timeline (inklusive Scroll-Offset)
        const mousePositionX = event.clientX - timelineContainer.getBoundingClientRect().left;
        const currentScrollLeft = timelineContainer.scrollLeft;
        const mousePositionRelativeToTimeline = currentScrollLeft + mousePositionX;

        // Verhältnis der Mausposition zur aktuellen Breite
        const mouseRelativePosition = mousePositionRelativeToTimeline / currentWidth;

        // Berechne die neue Breite der Timeline basierend auf dem Scrollen (Zoom)
        const newWidth = Math.max(viewportWidth, currentWidth + delta);

        // Berechne die neue Scrollposition, um die Mausposition im Fokus zu behalten
        const newScrollLeft = (mouseRelativePosition * newWidth) - mousePositionX;

        // Setze die neue Breite der Timeline
        resizeElement.style.width = `${newWidth}px`;
        //timelineWrapper.style.width = `${newWidth}px`;

        // Begrenze die Scrollposition auf den Bereich der Timeline
        const maxScrollLeft = timelineContainer.scrollWidth - timelineContainer.clientWidth;
        timelineContainer.scrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft));

        // Aktualisiere die Linie und die Punkte
        updateFillingLine();

        // Aktualisiere die aktuelle Breite
        currentWidth = newWidth;
    });
});
