document.addEventListener("DOMContentLoaded", function () {
    const basePath = "";

    // ==============================
    // Load Navbar
    // ==============================
    document.getElementById("navbar-container").innerHTML = `
        <nav class="navbar">
            <div class="logo">
                <img src="../logo/logo.png" alt="logo">
            </div>
            <ul class="nav-list">
                <li><a href="../index.html">Home</a></li>
                <li class="dropdown-parent">
                    <a href="#">Explore</a>
                    <ul class="dropdown">
                        <li><a href="../html/Posters.html">Posters</a></li>
                        <li><a href="#">More Coming</a></li>
                    </ul>
                </li>
                <li><a href="../html/people.html">People</a></li>
                <li><a href="../html/aboutus.html">About Us</a></li>
                <li><a href="../html/event.html">Events</a></li>
                 <li><a href="/blog/">Blog</a></li>
                <li><a href="../html/support.html">Support Us</a></li>
            </ul>
            <div class="menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    `;

    // ==============================
    // Load Footer
    // ==============================
    document.getElementById("footer-container").innerHTML = `
        <footer class="footer-section">
            <!-- Footer Main Content -->
            <div class="footer-content">
                <!-- Left: Logo + About + Social -->
                <div class="footer-widget">
                    <div class="footer-logo">
                        <img src="../logo/logo.png" alt="SPACE Lab Logo">
                    </div>
                    <div class="footer-text">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                    <div class="footer-social-icon">
                        <span>Follow us</span>
                        <a href="#"><i class="fab fa-facebook-f"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="https://www.instagram.com/spaceprobe_ltd/"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/company/spaceprobe-pvt-ltd/"><i class="fab fa-linkedin"></i></a>
                    </div>
                </div>

                <!-- Middle: Useful Links -->
                <div class="footer-widget">
                    <h3>Useful Links</h3>
                    <ul>
                        <li><a href="../index.html">Home</a></li>
                        <li><a href="../html/aboutus.html">About</a></li>
                        <li><a href="/blog/">Blog</a></li>

                        <li><a href="../html/services.html">Services</a></li>
                        <li><a href="../html/contact.html">Contact</a></li>
                    </ul>
                </div>

                <!-- Right: Subscribe + Contact Info -->
                <div class="footer-widget">
                    <h3>Subscribe</h3>
                    <p>Don’t miss to subscribe to our new feeds, kindly fill the form below.</p>
                    <div class="subscribe-form">
                        <input type="text" placeholder="Email Address">
                        <button><i class="fab fa-telegram-plane"></i></button>
                    </div>

                    <div class="footer-contact">
                        <div class="single-cta">
                            <i class="fas fa-map-marker-alt"></i>
                            <div class="cta-text">
                                <h4>Find us</h4>
                                <span>Borivali, Mumbai</span>
                            </div>
                        </div>

                        <div class="single-cta">
                            <i class="far fa-envelope-open"></i>
                            <div class="cta-text">
                                <h4>Mail us</h4>
                                <span>director@spaceprobe.in</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Copyright Section -->
            <div class="copyright-area">
                <p>&copy; 2025 SPACEPROBE. All Rights Reserved <a href="#">SPACEPROBE</a></p>
                <div class="footer-menu">
                    <a href="../index.html">Home</a>
                    <a href="../html/terms.html">Terms</a>
                    <a href="../html/privacy.html">Privacy</a>
                    <a href="../html/contact.html">Contact</a>
                </div>
            </div>
        </footer>
    `;

    // Initialize Navbar Toggle Logic
    initNavbarToggle();
});

// ==============================
// Navbar Functionality
// ==============================
function initNavbarToggle() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navList = document.querySelector(".nav-list");
    const dropdownParents = document.querySelectorAll(".dropdown-parent");

    // Hamburger toggle
    menuToggle?.addEventListener("click", e => {
        e.stopPropagation();
        navList?.classList.toggle("active");
        menuToggle.classList.toggle("open");

        if (!navList.classList.contains("active")) closeAllDropdowns();
    });

    // Dropdown behavior
    dropdownParents.forEach(parent => {
        const dropdown = parent.querySelector(".dropdown");
        const link = parent.querySelector("a");

        // Desktop hover
        parent.addEventListener("mouseenter", () => {
            if (window.innerWidth > 768) {
                dropdown?.classList.add("show");
                dropdown.style.position = "absolute";
            }
        });

        parent.addEventListener("mouseleave", () => {
            if (window.innerWidth > 768) dropdown?.classList.remove("show");
        });

        // Mobile click
        link.addEventListener("click", e => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const isOpen = dropdown?.classList.contains("show");
                closeAllDropdowns();
                if (!isOpen) {
                    dropdown?.classList.add("show");
                    link.classList.add("active");
                    dropdown.style.position = "relative";
                }
            }
        });
    });

    // Click outside to close menu
    document.addEventListener("click", e => {
        if (!navList.contains(e.target) && !menuToggle.contains(e.target)) {
            navList.classList.remove("active");
            menuToggle.classList.remove("open");
            closeAllDropdowns();
        }
    });

    function closeAllDropdowns() {
        document.querySelectorAll(".dropdown").forEach(d => {
            d.classList.remove("show");
            d.style.position = window.innerWidth <= 768 ? "relative" : "absolute";
        });
        document.querySelectorAll(".dropdown-parent > a").forEach(link => link.classList.remove("active"));
    }
}
