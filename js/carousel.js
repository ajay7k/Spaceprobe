document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById('carousel');
  let currentIndex = 0;

  fetch('/api/gallery')
    .then(res => res.json())
    .then(images => {
      if (!images || images.length === 0) {
        carousel.innerHTML = '<p style="color:white;">No images found in gallery.</p>';
        return;
      }

      // Add each image to the carousel
      images.forEach(img => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        const image = document.createElement('img');
        image.src = `photo_album/${img}`;
        slide.appendChild(image);
        carousel.appendChild(slide);
      });

      initCarousel();
    })
    .catch(err => {
      console.error('Error loading gallery:', err);
      carousel.innerHTML = '<p style="color:white;">Failed to load gallery.</p>';
    });

  function initCarousel() {
    const slides = document.querySelectorAll(".carousel-slide");
    if (!slides.length) return;

    const leftBtn = document.querySelector(".carousel-btn.left");
    const rightBtn = document.querySelector(".carousel-btn.right");
    const slideWidth = slides[0].offsetWidth + 20;

    leftBtn.addEventListener("click", () => {
      if (currentIndex > 0) currentIndex--;
      carousel.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
    });

    rightBtn.addEventListener("click", () => {
      if (currentIndex < slides.length - 1) currentIndex++;
      carousel.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
    });

    // Auto-slide every 4 seconds
    setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      carousel.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
    }, 4000);
  }
});
