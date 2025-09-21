document.addEventListener("DOMContentLoaded", function () {
    const basePath = "";

    // Load Navbar
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
                <li><a href="../html/publications.html">Publications</a></li>
                <li><a href="../html/support.html">Support Us</a></li>
            </ul>
            <div class="menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    `;

    // Load Footer
    document.getElementById("footer-container").innerHTML = `
        <footer class="footer">
            <div class="footer-container">
                <div class="footer-logo">
                    <img src="../logo/logo.png" alt="SPACE Lab Logo">
                </div>
                <div class="footer-links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="../index.html">Home</a></li>
                        <li><a href="../html/people.html">People</a></li>
                        <li><a href="../html/publications.html">Publications</a></li>
                        <li><a href="../html/support.html">Support Us</a></li>
                    </ul>
                </div>
                <div class="footer-contact">
                    <h3>Contact Us</h3>
                    <p>Email: <a href="mailto:director@spaceprobe.in">director@spaceprobe.in</a></p>
                    <p>Follow us:</p>
                    <div class="social-icons-footer">
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-linkedin"></i></a>
                        <a href="#"><i class="fab fa-github"></i></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                &copy; 2025 SPACEPROBE. All rights reserved.
            </div>
        </footer>
    `;

    initNavbarToggle();
});

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

    dropdownParents.forEach(parent => {
        const dropdown = parent.querySelector(".dropdown");
        const link = parent.querySelector("a");

        // Desktop hover
        parent.addEventListener("mouseenter", () => {
            if (window.innerWidth > 768) {
                dropdown?.classList.add("show");
                dropdown.style.position = "absolute"; // Keep hover dropdown floating
            }
        });

        parent.addEventListener("mouseleave", () => {
            if (window.innerWidth > 768) dropdown?.classList.remove("show");
        });

        // Mobile click - make dropdown push navbar
        link.addEventListener("click", e => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const isOpen = dropdown?.classList.contains("show");

                // Close all dropdowns first
                closeAllDropdowns();

                if (!isOpen) {
                    dropdown?.classList.add("show");
                    link.classList.add("active");
                    dropdown.style.position = "relative"; // Push content down
                }
            }
        });
    });

    // Click outside to close everything
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
