document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navList = document.querySelector(".nav-list");
    const navLinks = document.querySelectorAll(".nav-list a");
    const dropdownMenus = document.querySelectorAll(".dropdown");

    // Toggle mobile menu
    menuToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        navList.classList.toggle("active");
        menuToggle.classList.toggle("open");

        if (!navList.classList.contains("active")) {
            closeAllDropdowns();
        }
    });

    // Handle link clicks (dropdown toggle or navigation)
    navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            const dropdown = link.nextElementSibling;

            if (dropdown && dropdown.classList.contains("dropdown")) {
                event.preventDefault(); // Prevent navigation
                dropdown.classList.toggle("show");

                // Close other dropdowns
                dropdownMenus.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove("show");
                    }
                });
            } else {
                closeNavbar();
            }
        });
    });

    // Close navbar and dropdowns when clicking outside
    document.addEventListener("click", function (event) {
        if (!navList.contains(event.target) && !menuToggle.contains(event.target)) {
            closeNavbar();
            closeAllDropdowns();
        }
    });

    function closeNavbar() {
        navList.classList.remove("active");
        menuToggle.classList.remove("open");
    }

    function closeAllDropdowns() {
        dropdownMenus.forEach(dropdown => dropdown.classList.remove("show"));
    }
});
