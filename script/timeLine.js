document.addEventListener("DOMContentLoaded", function () {
    const timePoints = document.querySelectorAll(".time ol li a");
    let startTime = null;
    let endTime = null;

    const fillingLine = document.querySelector('.filling-line');
    const timelineContainer = document.querySelector('.time');

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
});

const resizeElement = document.querySelector('ol');


document.addEventListener("wheel", function (event) {
    console.log(event);
    console.log(event.deltaX, event.deltaY)

    resizeElement.style.width = 2000 + `px`;
    console.log(parseInt(resizeElement.style.width), resizeElement.style.width);
})
