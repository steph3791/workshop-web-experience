document.addEventListener("DOMContentLoaded", function () {
    const timelineList = document.getElementById("timeline-list");

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
});


document.addEventListener("DOMContentLoaded", function () {
    const timePoints = document.querySelectorAll(".timeline ol li a");
    let startTime = null;
    let endTime = null;

    const fillingLine = document.querySelector('.filling-line');
    const timelineContainer = document.querySelector('.timeline');
    const resizeElement = document.querySelector('.timeline ol');

    let currentWidth = resizeElement.offsetWidth;  // Startbreite der Timeline
    const viewportWidth = window.innerWidth * 0.80;

    function getOffsetRelativeToTimeline(element) {
        const elementRect = element.getBoundingClientRect();
        const timelineRect = timelineContainer.getBoundingClientRect();
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
        if (!timelineContainer.contains(event.target)) {
            resetSelection();
        }
    });

    document.addEventListener("wheel", function (event) {
        // event.preventDefault();
        const zoomSpeed = 100;
        const delta = event.deltaY < 0 ? zoomSpeed : -zoomSpeed;

        currentWidth = Math.max(viewportWidth, currentWidth + delta);
        resizeElement.style.width = `${currentWidth}px`;
        updateFillingLine();
    });
});

