/*
Space Construction 404 Page - FIXED VERSION
- Stable positioning on resize
- Phone responsive
- Optimized performance
*/

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    avoidanceDistance: 0,
    avoidanceForce: 0,
    returnSpeed: 0.1,
    clickBoostForce: 200,
    particleCount: 20,
    enableSounds: false,
    fpsThreshold: 30,
    isMobile: window.innerWidth < 768
};

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    lastMouseX: 0,
    lastMouseY: 0,
    mouseVelocityX: 0,
    mouseVelocityY: 0,
    objects: [],
    isMouseDown: false,
    fps: 60,
    isResizing: false,
    animationEnabled: true
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
    };
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// ============================================
// OBJECT CLASS - FIXED VERSION
// ============================================

class InteractiveObject {
    constructor(element) {
        this.element = element;
        this.currentOffsetX = 0;
        this.currentOffsetY = 0;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
        this.velocity = { x: 0, y: 0 };
        this.speed = parseFloat(element.dataset.speed) || 2;
        this.isAvoiding = false;
        this.rotation = 0;
        this.targetRotation = 0;
        this.scale = 1;
        this.targetScale = 1;
        
        // Store original CSS transform
        this.baseTransform = this.getBaseTransform();
    }

    getBaseTransform() {
        const style = window.getComputedStyle(this.element);
        const transform = style.transform;
        return transform !== 'none' ? transform : '';
    }

    update(mouseX, mouseY, mouseVelocityX, mouseVelocityY, isMouseDown) {
    if (!state.animationEnabled || state.isResizing) return;

    const currentCenter = getElementCenter(this.element);
    const dist = distance(currentCenter.x, currentCenter.y, mouseX, mouseY);
    const avoidRadius = CONFIG.avoidanceDistance + (currentCenter.width / 2);

    if (dist < avoidRadius) {
        this.isAvoiding = true;
        
        const angle = Math.atan2(currentCenter.y - mouseY, currentCenter.x - mouseX);
        const force = (1 - (dist / avoidRadius)) * CONFIG.avoidanceForce * this.speed;
        
        const velocityInfluence = 0.3;
        
        this.targetOffsetX = Math.cos(angle) * force - mouseVelocityX * velocityInfluence;
        this.targetOffsetY = Math.sin(angle) * force - mouseVelocityY * velocityInfluence;
        
        // REMOVED: Click boost that causes shaking
        // Only use smooth avoidance, no violent clicking
        
        this.targetRotation = (1 - (dist / avoidRadius)) * 15 * Math.sign(mouseVelocityX || 1);
        
    } else {
        this.isAvoiding = false;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
        this.targetRotation = 0;
        this.targetScale = 1;
    }

    const smoothFactor = this.isAvoiding ? 0.15 : CONFIG.returnSpeed;
    this.currentOffsetX = lerp(this.currentOffsetX, this.targetOffsetX, smoothFactor);
    this.currentOffsetY = lerp(this.currentOffsetY, this.targetOffsetY, smoothFactor);
    this.rotation = lerp(this.rotation, this.targetRotation, smoothFactor * 0.5);
    this.scale = lerp(this.scale, this.targetScale, smoothFactor);

    this.applyTransform();
}

    applyTransform() {
        // Apply only the interaction transforms, not repositioning
        const transform = `translate(${this.currentOffsetX}px, ${this.currentOffsetY}px) rotate(${this.rotation}deg) scale(${this.scale})`;
        this.element.style.transform = transform;
        
        if (this.isAvoiding) {
            this.element.classList.add('avoid');
        } else {
            this.element.classList.remove('avoid');
        }
    }

    reset() {
        this.currentOffsetX = 0;
        this.currentOffsetY = 0;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
        this.rotation = 0;
        this.targetRotation = 0;
        this.scale = 1;
        this.targetScale = 1;
        this.applyTransform();
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('%c🚀 Space Construction Site Initialized 🏗️', 'color: #FFCB39; font-size: 20px; font-weight: bold;');
    
    // Check if mobile
    CONFIG.isMobile = window.innerWidth < 768;
    
    // Reduce effects on mobile
    if (CONFIG.isMobile) {
        CONFIG.avoidanceDistance = 0;
        CONFIG.avoidanceForce = 0;
        CONFIG.particleCount = 10;
    }
    
    initializeInteractiveObjects();
    initializeMouseTracking();
    initializeClickInteractions();
    initializeKeyboardControls();
    createSparks();
    initializeSimpleInteractions();
    initializePerformanceMonitoring();
    initializeResizeHandler(); // NEW - Fixed resize handling
    startAnimationLoop();
    
    console.log('%c✨ All systems operational!', 'color: #4A90E2; font-size: 14px;');
});

// ============================================
// INTERACTIVE OBJECTS SETUP
// ============================================

function initializeInteractiveObjects() {
    const interactiveElements = document.querySelectorAll('.interactive-object, .interactive-barrier');
    
    interactiveElements.forEach(element => {
        const obj = new InteractiveObject(element);
        state.objects.push(obj);
    });
    
    console.log(`📦 Initialized ${state.objects.length} interactive objects`);
}

// ============================================
// FIXED RESIZE HANDLER
// ============================================

function initializeResizeHandler() {
    let resizeTimeout;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    
    window.addEventListener('resize', function() {
        // Prevent resize handling during mobile scroll
        if (CONFIG.isMobile && Math.abs(window.innerWidth - lastWidth) < 10) {
            return;
        }
        
        state.isResizing = true;
        
        // Reset all objects immediately
        state.objects.forEach(obj => obj.reset());
        
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Update mobile status
            const wasMobile = CONFIG.isMobile;
            CONFIG.isMobile = window.innerWidth < 768;
            
            // Adjust config for mobile
            if (CONFIG.isMobile && !wasMobile) {
                CONFIG.avoidanceDistance = 0;
                CONFIG.avoidanceForce = 0;
            } else if (!CONFIG.isMobile && wasMobile) {
                CONFIG.avoidanceDistance = 0;
                CONFIG.avoidanceForce = 0;
            }
            
            // Reset all objects after resize
            state.objects.forEach(obj => {
                obj.reset();
            });
            
            // Update dimensions
            lastWidth = window.innerWidth;
            lastHeight = window.innerHeight;
            
            state.isResizing = false;
            
            console.log('📐 Window resized - objects reset');
        }, 150); // Debounce resize
    });
    
    // Prevent issues on mobile orientation change
    window.addEventListener('orientationchange', function() {
        state.isResizing = true;
        state.objects.forEach(obj => obj.reset());
        
        setTimeout(() => {
            state.isResizing = false;
            location.reload(); // Refresh on orientation change for best results
        }, 500);
    });
}

// ============================================
// MOUSE TRACKING
// ============================================

function initializeMouseTracking() {
    let lastTime = Date.now();
    
    document.addEventListener('mousemove', function(e) {
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        
        state.lastMouseX = state.mouseX;
        state.lastMouseY = state.mouseY;
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
        
        if (deltaTime > 0) {
            state.mouseVelocityX = (state.mouseX - state.lastMouseX) / deltaTime * 10;
            state.mouseVelocityY = (state.mouseY - state.lastMouseY) / deltaTime * 10;
        }
        
        lastTime = currentTime;
    });
    
    document.addEventListener('mousedown', function() {
        state.isMouseDown = true;
    });
    
    document.addEventListener('mouseup', function() {
        state.isMouseDown = false;
    });
    
    // Touch support with better mobile handling
    document.addEventListener('touchmove', function(e) {
        if (CONFIG.isMobile && e.touches.length === 1) {
            const touch = e.touches[0];
            state.lastMouseX = state.mouseX;
            state.lastMouseY = state.mouseY;
            state.mouseX = touch.clientX;
            state.mouseY = touch.clientY;
        }
    }, { passive: true });
    
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            state.mouseX = touch.clientX;
            state.mouseY = touch.clientY;
            state.isMouseDown = true;
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function() {
        state.isMouseDown = false;
    }, { passive: true });
}

// ============================================
// ANIMATION LOOP
// ============================================

function startAnimationLoop() {
    function animate() {
        if (!state.isResizing && state.animationEnabled) {
            state.objects.forEach(obj => {
                obj.update(
                    state.mouseX, 
                    state.mouseY, 
                    state.mouseVelocityX, 
                    state.mouseVelocityY,
                    state.isMouseDown
                );
            });
            
            state.mouseVelocityX *= 0.95;
            state.mouseVelocityY *= 0.95;
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ============================================
// CLICK INTERACTIONS
// ============================================

function initializeClickInteractions() {
    state.objects.forEach(obj => {
        obj.element.addEventListener('click', function(e) {
            e.stopPropagation();
            
            createExplosion(e.clientX, e.clientY);
            
            const center = getElementCenter(obj.element);
            const angle = Math.atan2(center.y - e.clientY, center.x - e.clientX);
            obj.targetOffsetX += Math.cos(angle) * 300;
            obj.targetOffsetY += Math.sin(angle) * 300;
            obj.targetRotation += (Math.random() - 0.5) * 720;
            
            obj.element.style.filter = 'brightness(2) drop-shadow(0 0 30px rgba(255, 203, 57, 1))';
            setTimeout(() => {
                obj.element.style.filter = '';
            }, 200);
        });
    });
}

// ============================================
// EXPLOSION EFFECT
// ============================================

function createExplosion(x, y) {
    const particleCount = CONFIG.isMobile ? 10 : 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'explosion-particle';
        
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 2 + Math.random() * 3;
        const size = 3 + Math.random() * 5;
        
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: ${['#FFCB39', '#FF6B35', '#4A90E2'][Math.floor(Math.random() * 3)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(particle);
        
        const animation = particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * 100 * velocity}px, ${Math.sin(angle) * 100 * velocity}px) scale(0)`, opacity: 0 }
        ], {
            duration: 500 + Math.random() * 500,
            easing: 'cubic-bezier(0.4, 0.0, 0.6, 1)'
        });
        
        animation.onfinish = () => particle.remove();
    }
}

// ============================================
// KEYBOARD CONTROLS
// ============================================

function initializeKeyboardControls() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'r' || e.key === 'R') {
            state.objects.forEach(obj => obj.reset());
            console.log('🔄 Objects reset');
        }
        
        if (e.key === ' ') {
            e.preventDefault();
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            createExplosion(x, y);
        }
        
        if (e.key === 'Escape') {
            const homeButton = document.querySelector('.btn-go-home');
            if (homeButton) homeButton.click();
        }
    });
}

// ============================================
// WELDING SPARKS
// ============================================

function createSparks() {
    const sparksContainer = document.querySelector('.sparks-container');
    if (!sparksContainer || CONFIG.isMobile) return;

    setInterval(() => {
        const spark = document.createElement('div');
        spark.className = 'spark';
        
        const randomX = (Math.random() - 0.5) * 60;
        const randomY = Math.random() * 60 + 20;
        
        spark.style.setProperty('--tx', `${randomX}px`);
        spark.style.setProperty('--ty', `${randomY}px`);
        spark.style.left = `${Math.random() * 40}px`;
        spark.style.animationDuration = `${1 + Math.random()}s`;
        
        sparksContainer.appendChild(spark);
        
        setTimeout(() => spark.remove(), 2000);
    }, 300);
}

// ============================================
// SIMPLE INTERACTIONS (Hover effects)
// ============================================

function initializeSimpleInteractions() {
    // Rocket
    const rocket = document.querySelector('.object_rocket');
    if (rocket) {
        rocket.addEventListener('mouseenter', function() {
            this.style.filter = 'brightness(1.3) drop-shadow(0 0 20px rgba(255, 203, 57, 0.8))';
        });
        rocket.addEventListener('mouseleave', function() {
            this.style.filter = '';
        });
    }
    
    // Construction signs
    document.querySelectorAll('.construction-sign').forEach(sign => {
        sign.addEventListener('mouseenter', function() {
            this.style.filter = 'brightness(1.3) drop-shadow(0 0 25px rgba(255, 203, 57, 1))';
        });
        sign.addEventListener('mouseleave', function() {
            this.style.filter = '';
        });
    });
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

function initializePerformanceMonitoring() {
    let lastTime = performance.now();
    let frames = 0;
    
    function checkPerformance() {
        frames++;
        const currentTime = performance.now();
        
        if (currentTime >= lastTime + 1000) {
            state.fps = Math.round((frames * 1000) / (currentTime - lastTime));
            frames = 0;
            lastTime = currentTime;
            
            if (state.fps < CONFIG.fpsThreshold) {
                document.body.classList.add('reduce-motion');
            } else {
                document.body.classList.remove('reduce-motion');
            }
        }
        
        requestAnimationFrame(checkPerformance);
    }
    
    checkPerformance();
}

// ============================================
// PAGE VISIBILITY (Pause when tab inactive)
// ============================================

document.addEventListener('visibilitychange', function() {
    state.animationEnabled = !document.hidden;
    console.log(document.hidden ? '⏸️ Paused' : '▶️ Resumed');
});

// ============================================
// CONSOLE ART
// ============================================

console.log(`
%c
    🚀 SPACE CONSTRUCTION ZONE 🏗️
    
    ╔════════════════════════════════════╗
    ║   CONTROLS:                        ║
    ║   • Move mouse to interact         ║
    ║   • Click objects for effects      ║
    ║   • Press 'R' to reset             ║
    ║   • Press 'SPACE' for explosion    ║
    ║   • Press 'ESC' to go home         ║
    ╚════════════════════════════════════╝
    
`, 'color: #FFCB39; font-family: monospace; font-size: 12px;');

// ============================================
// DEBUG TOOLS
// ============================================

window.DEBUG = {
    state: state,
    config: CONFIG,
    resetAll: () => state.objects.forEach(obj => obj.reset()),
    toggleAnimation: () => {
        state.animationEnabled = !state.animationEnabled;
        console.log(`Animation: ${state.animationEnabled ? 'ON' : 'OFF'}`);
    }
};

console.log('%c💡 Debug: window.DEBUG', 'color: #4A90E2;');