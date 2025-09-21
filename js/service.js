"use strict";
/* globals THREE, $, TweenLite, Power3, TimelineMax  */

// ---------- Globals ----------
let camera, scene, renderer;
let plane;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let timer = 0;

const darkBlue = new THREE.Color(0x00344A); // base color
let farthestStars, farStars, nearStars;

// color buffers
let baseColors = null;   
let currentColors = null; 

// glow control
let hoveredFaceIndex = null;
let glowTarget = 0;   
let glowValue = 0;    

// ---------- Init ----------
function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor("#121212");
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    addLights();
    createPlane();
    createStarsField();

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("mousemove", onMouseMove);
    addInteractions();
}

// ---------- Lights ----------
function addLights() {
    const lights = [
        [0xffffff, 1, 0, 1, 1],
        [0xffffff, 0.4, 1, -1, 1],
        [0x666666, 0.2, -1, -1, 0.2],
        [0x666666, 0.2, 0, -1, 0.2],
        [0x666666, 0.2, 1, -1, 0.2]
    ];
    lights.forEach(l => {
        const light = new THREE.DirectionalLight(l[0], l[1]);
        light.position.set(l[2], l[3], l[4]).normalize();
        scene.add(light);
    });
}

// ---------- Plane ----------
function createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(400, 400, 70, 70);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        vertexColors: true,
        flatShading: true
    });

    const pos = geometry.attributes.position;
    const vertexCount = pos.count;

    const dx = new Float32Array(vertexCount);
    const dy = new Float32Array(vertexCount);
    const delay = new Float32Array(vertexCount);

    for (let i = 0; i < vertexCount; i++) {
        pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 4);
        pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * 4);
        pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * 4);

        dx[i] = Math.random() - 0.5;
        dy[i] = Math.random() - 0.5;
        delay[i] = Math.random() * 5;
    }

    geometry.userData.dx = dx;
    geometry.userData.dy = dy;
    geometry.userData.delay = delay;

    // colors
    baseColors = new Float32Array(vertexCount * 3);
    currentColors = new Float32Array(vertexCount * 3);

    for (let i = 0; i < vertexCount; i++) {
        baseColors[i * 3 + 0] = darkBlue.r;
        baseColors[i * 3 + 1] = darkBlue.g;
        baseColors[i * 3 + 2] = darkBlue.b;

        currentColors[i * 3 + 0] = darkBlue.r;
        currentColors[i * 3 + 1] = darkBlue.g;
        currentColors[i * 3 + 2] = darkBlue.b;
    }

    geometry.setAttribute("color", new THREE.BufferAttribute(currentColors, 3));

    plane = new THREE.Mesh(geometry, material);
    scene.add(plane);
}

// ---------- Stars ----------
function createStars(amount, yDistance, color = 0xffffff) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(amount * 3);
    for (let i = 0; i < amount; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 1500;
        positions[i * 3 + 1] = yDistance;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1500;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: color, size: 1.5, transparent: true, opacity: 0.8 });
    return new THREE.Points(geometry, material);
}

function createStarsField() {
    farthestStars = createStars(1200, 420, 0x0952BD);
    farStars = createStars(1200, 370, 0xA5BFF0);
    nearStars = createStars(1200, 290, 0x118CD6);

    scene.add(farthestStars, farStars, nearStars);
    farStars.rotation.x = 0.25;
    nearStars.rotation.x = 0.25;
}

// ---------- Animate ----------
function animate() {
    requestAnimationFrame(animate);
    timer += 0.01;

    const pos = plane.geometry.attributes.position;
    const dx = plane.geometry.userData.dx;
    const dy = plane.geometry.userData.dy;
    const delay = plane.geometry.userData.delay;

    for (let i = 0; i < pos.count; i++) {
        const ox = pos.getX(i);
        const oy = pos.getY(i);
        pos.setX(i, ox - (Math.sin(timer + delay[i]) / 40) * dx[i]);
        pos.setY(i, oy + (Math.sin(timer + delay[i]) / 40) * dy[i]);
    }
    pos.needsUpdate = true;

    // raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane, false);

    if (intersects.length > 0) {
        hoveredFaceIndex = intersects[0].faceIndex;
        glowTarget = 1.0;
    } else {
        glowTarget = 0.0;
    }

    glowValue += (glowTarget - glowValue) * 0.5;

    const colorAttr = plane.geometry.attributes.color;
    const colorArray = colorAttr.array;

    for (let i = 0; i < colorArray.length; i++) {
        colorArray[i] += (baseColors[i] - colorArray[i]) * 0.2;
    }

    if (hoveredFaceIndex !== null && glowValue > 0.01) {
        const index = plane.geometry.index.array;
        const triOffset = hoveredFaceIndex * 3;
        const vi0 = index[triOffset + 0];
        const vi1 = index[triOffset + 1];
        const vi2 = index[triOffset + 2];

        const glowColor = darkBlue.clone().offsetHSL(0, 0, 0.35);

        [vi0, vi1, vi2].forEach(vIdx => {
            const off = vIdx * 3;
            colorArray[off + 0] += (glowColor.r - colorArray[off + 0]) * glowValue;
            colorArray[off + 1] += (glowColor.g - colorArray[off + 1]) * glowValue;
            colorArray[off + 2] += (glowColor.b - colorArray[off + 2]) * glowValue;
        });
    }

    colorAttr.needsUpdate = true;

    // star drift
    farthestStars.rotation.y -= 0.00001;
    farStars.rotation.y -= 0.00005;
    nearStars.rotation.y -= 0.00011;

    renderer.render(scene, camera);
}

// ---------- Resize / Mouse ----------
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

// ---------- UI Interactions ----------
function addInteractions() {
    const introContainer = $(".intro-container");
    const skyContainer = $(".sky-container");
    const xMark = $(".x-mark");
    const servicesSection = $(".services-section");

    $(".shift-camera-button").click(() => {
        const introTimeline = new TimelineMax();

        introTimeline.add([
            TweenLite.to(introContainer, 0.5, { opacity: 0, ease: Power3.easeIn }),
            TweenLite.to(camera.rotation, 3, { x: Math.PI / 2, ease: Power3.easeInOut }),
            TweenLite.to(camera.position, 2.5, { z: 20, ease: Power3.easeInOut }),
            TweenLite.to(camera.position, 3, { y: 120, ease: Power3.easeInOut }),
            TweenLite.to(plane.scale, 3, { x: 2, ease: Power3.easeInOut })
        ]);

        introTimeline.add([
            TweenLite.to(xMark, 2, { opacity: 1, ease: Power3.easeInOut }),
            TweenLite.to(skyContainer, 2, { opacity: 1, ease: Power3.easeInOut }),
            TweenLite.to(servicesSection, 2, { opacity: 1, y: 0, pointerEvents: "auto", ease: Power3.easeInOut })
        ]);
    });

    xMark.click(() => {
        const outroTimeline = new TimelineMax();
        outroTimeline.add([
            TweenLite.to(xMark, 0.5, { opacity: 0, ease: Power3.easeInOut }),
            TweenLite.to(skyContainer, 0.5, { opacity: 0, ease: Power3.easeInOut }),
            TweenLite.to(camera.rotation, 3, { x: 0, ease: Power3.easeInOut }),
            TweenLite.to(camera.position, 3, { z: 50, ease: Power3.easeInOut }),
            TweenLite.to(camera.position, 2.5, { y: 0, ease: Power3.easeInOut }),
            TweenLite.to(plane.scale, 3, { x: 1, ease: Power3.easeInOut }),
            TweenLite.to(servicesSection, 0.5, { opacity: 0, y: 60, pointerEvents: "none", ease: Power3.easeInOut })
        ]);

        outroTimeline.add([
            TweenLite.to(introContainer, 0.5, { opacity: 1, ease: Power3.easeIn })
        ]);
    });
}

// ---------- Start ----------
init();
animate();
