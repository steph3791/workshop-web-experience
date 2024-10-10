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

    timePoints.forEach((point, index) => {
        point.addEventListener("click", function (event) {
            event.preventDefault();

            if (!startTime) {
                startTime = point;
                point.classList.add("active");
            } else if (!endTime && startTime !== point) {
                endTime = point;
                point.classList.add("active");

                const startOffset = getOffsetRelativeToTimeline(startTime);
                const endOffset = getOffsetRelativeToTimeline(endTime);
                const lineWidth = endOffset - startOffset;

                fillingLine.style.left = `${startOffset}px`;
                fillingLine.style.width = `${lineWidth}px`;
                fillingLine.style.display = 'block';
            } else {
                timePoints.forEach(p => p.classList.remove("active"));
                fillingLine.style.display = 'none';

                startTime = point;
                endTime = null;
                point.classList.add("active");
            }
        });
    });

    document.addEventListener("wheel", function (event) {
        // event.preventDefault();

        const zoomSpeed = 100;
        const delta = event.deltaY < 0 ? zoomSpeed : -zoomSpeed;

        currentWidth = Math.max(viewportWidth, currentWidth + delta);
        resizeElement.style.width = `${currentWidth}px`;
    });
});

