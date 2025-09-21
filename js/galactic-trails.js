// Select canvas and set up context
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Particle configuration
const particleCount = 750;
const colors = ["#0952BD", "#A5BFF0", "#118CD6", "#1AAEE8", "#F2E8C9"];
let lightParticles = [];

// Mouse state
const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let isMouseDown = false;

// Animation control
let timer = 0;
let opacity = 1;
let speed = 0.0005;

// Update mouse position
window.addEventListener("mousemove", function (event) {
    mouse.x = event.clientX - canvas.width / 2;
    mouse.y = event.clientY - canvas.height / 2;
});

// Handle window resize
window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    lightParticles = [];
    initializeParticles();
});

// LightParticle class
function LightParticle(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    this.update = function () {
        this.draw();
    };

    this.draw = function () {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.shadowColor = this.color;
        c.shadowBlur = 15;
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    };
}

// Initialize particles
function initializeParticles() {
    for (let i = 0; i < particleCount; i++) {
        const randomColorIndex = Math.floor(Math.random() * colors.length);
        const randomRadius = Math.random() * 2;
        const x = Math.random() * (canvas.width + 200) - (canvas.width + 200) / 2;
        const y = Math.random() * (canvas.width + 200) - (canvas.width + 200) / 2;
        lightParticles.push(new LightParticle(x, y, randomRadius, colors[randomColorIndex]));
    }
}

// Initial particle setup
initializeParticles();

// Animate particles
function animate() {
    window.requestAnimationFrame(animate);

    c.save();

    // Update opacity and speed based on mouse state
    if (isMouseDown) {
        const desiredOpacity = 0.01;
        opacity += (desiredOpacity - opacity) * 0.03;
        const desiredSpeed = 0.012;
        speed += (desiredSpeed - speed) * 0.01;
    } else {
        const originalOpacity = 1;
        opacity += (originalOpacity - opacity) * 0.01;
        const originalSpeed = 0.001;
        speed += (originalSpeed - speed) * 0.01;
    }

    // Fill background
    c.fillStyle = `rgba(18, 18, 18, ${opacity})`;
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Rotate canvas
    c.translate(canvas.width / 2, canvas.height / 2);
    c.rotate(timer);
    timer += speed;

    // Draw particles
    lightParticles.forEach(particle => particle.update());

    c.restore();
}

// Mouse down/up events
window.addEventListener("mousedown", () => isMouseDown = true);
window.addEventListener("mouseup", () => isMouseDown = false);

// Start animation
animate();
