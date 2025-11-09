document.addEventListener("DOMContentLoaded", () => {
    /* ------------------------------------------
       SLIDE-IN ANIMATION (on scroll)
    ---------------------------------------------*/
    const slideInElements = document.querySelectorAll(".slide-in");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    slideInElements.forEach(el => observer.observe(el));

    /* ------------------------------------------
       READ MORE / READ LESS TOGGLE (Animated)
    ---------------------------------------------*/
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const button = card.querySelector(".read-more-btn");
        const fullText = card.querySelector(".full-text");

        if (button && fullText) {
            // Make sure the transition works from the start
            fullText.style.overflow = "hidden";
            fullText.style.maxHeight = "0";
            fullText.style.opacity = "0";
            fullText.style.transition = "max-height 0.5s ease, opacity 0.5s ease";

            button.addEventListener("click", () => {
                const isOpen = fullText.classList.contains("open");

                if (isOpen) {
                    // Collapse text
                    fullText.classList.remove("open");
                    fullText.style.maxHeight = "0";
                    fullText.style.opacity = "0";
                    button.textContent = "Read More";
                } else {
                    // Expand text
                    fullText.classList.add("open");
                    fullText.style.display = "block"; // ensure visible
                    fullText.style.maxHeight = fullText.scrollHeight + "px";
                    fullText.style.opacity = "1";
                    button.textContent = "Read Less";
                }
            });
        }
    });

    /* ------------------------------------------
       CONTACT FORM HANDLER (Demo Mode)
    ---------------------------------------------*/
    const contactForm = document.querySelector(".contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            customAlert("Thank you for your message! (Form submission is disabled in this demo.)");
        });
    }
});

/* ------------------------------------------
   CUSTOM ALERT BOX (Styled Overlay)
---------------------------------------------*/
function customAlert(message) {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed; inset: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999;
    `;
    
    const box = document.createElement('div');
    box.style.cssText = `
        background-color: #161b22;
        padding: 25px;
        border-radius: 10px;
        max-width: 360px;
        width: 90%;
        text-align: center;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.6);
        border: 2px solid #00ffaa;
        animation: fadeIn 0.3s ease;
    `;
    
    const msg = document.createElement('p');
    msg.style.cssText = 'color: #c9d1d9; margin-bottom: 20px; font-size: 1.1rem;';
    msg.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-primary';
    closeBtn.textContent = 'OK';
    closeBtn.onclick = () => container.remove();
    
    box.appendChild(msg);
    box.appendChild(closeBtn);
    container.appendChild(box);
    document.body.appendChild(container);
}

/* ------------------------------------------
   OPTIONAL: Fade-in keyframe for alert
---------------------------------------------*/
const fadeStyle = document.createElement("style");
fadeStyle.textContent = `
@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}
`;
document.head.appendChild(fadeStyle);
