const carousel = document.querySelector(".carousel");
const slides = document.querySelectorAll(".carousel-slide");
const leftBtn = document.querySelector(".carousel-btn.left");
const rightBtn = document.querySelector(".carousel-btn.right");

let currentIndex = 0;
const slideWidth = slides[0].offsetWidth + 20; // 20px gap

// Arrow navigation
leftBtn.addEventListener("click", () => {
  if (currentIndex > 0) currentIndex--;
  carousel.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
});

rightBtn.addEventListener("click", () => {
  if (currentIndex < slides.length - 1) currentIndex++;
  carousel.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
});

// Drag / swipe support
let isDragging = false;
let startX, scrollLeft;

carousel.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.pageX;
  scrollLeft = currentIndex * slideWidth;
  carousel.style.cursor = "grabbing";
});

carousel.addEventListener("mouseleave", () => {
  isDragging = false;
  carousel.style.cursor = "grab";
});

carousel.addEventListener("mouseup", () => {
  isDragging = false;
  carousel.style.cursor = "grab";
});

carousel.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const x = e.pageX;
  const walk = (x - startX) * 1; // drag sensitivity
  carousel.style.transform = `translateX(-${scrollLeft - walk}px)`;
});
