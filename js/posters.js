let scale = 1;
let isDragging = false;
let startX, startY, imgX = 0, imgY = 0;

// Open Modal
function openModal(imageSrc) {
    const modal = document.getElementById("posterModal");
    const modalImg = document.getElementById("modalImg");

    modal.style.display = "flex";
    modalImg.src = imageSrc;
    scale = 1;
    imgX = 0;
    imgY = 0;
    modalImg.style.transform = `scale(${scale}) translate(0px, 0px)`;
}

// Close Modal
function closeModal() {
    document.getElementById("posterModal").style.display = "none";
}

// Zoom In
function zoomIn() {
    scale += 0.2;
    applyTransform();
}

// Zoom Out
function zoomOut() {
    if (scale > 0.4) {
        scale -= 0.2;
        applyTransform();
    }
}

// Reset Zoom
function resetZoom() {
    scale = 1;
    imgX = 0;
    imgY = 0;
    applyTransform();
}

// Apply Transform (Zoom + Pan)
function applyTransform() {
    const img = document.getElementById("modalImg");
    img.style.transform = `scale(${scale}) translate(${imgX}px, ${imgY}px)`;
}

// Enable Dragging for Panning
document.getElementById("modalImg").addEventListener("mousedown", (e) => {
    if (scale > 1) {
        isDragging = true;
        startX = e.clientX - imgX;
        startY = e.clientY - imgY;
        e.preventDefault();
    }
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        imgX = e.clientX - startX;
        imgY = e.clientY - startY;
        applyTransform();
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

// Close modal when clicking outside the image
document.getElementById("posterModal").addEventListener("click", function(event) {
    if (event.target === this) {
        closeModal();
    }
});
