const angle = 20;

const lerp = (start, end, amount) => {
  return (1 - amount) * start + amount * end;
};

const remap = (value, oldMax, newMax) => {
  const newValue = ((value + oldMax) * (newMax * 2)) / (oldMax * 2) - newMax;
  return Math.min(Math.max(newValue, -newMax), newMax);
};

window.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Use clientX/Y instead of pageX/Y to avoid scroll issues
      const posX = event.clientX - rect.left - centerX;
      const posY = event.clientY - rect.top - centerY;

      const x = remap(posX, rect.width / 2, angle);
      const y = remap(posY, rect.height / 2, angle);

      card.dataset.rotateX = y;   // note: X rotation corresponds to vertical movement
      card.dataset.rotateY = -x;  // Y rotation corresponds to horizontal movement
    });

    card.addEventListener("mouseleave", () => {
      card.dataset.rotateX = 0;
      card.dataset.rotateY = 0;
    });
  });

  const update = () => {
    cards.forEach((card) => {
      let currentX = parseFloat(getComputedStyle(card).getPropertyValue("--rotateX"));
      let currentY = parseFloat(getComputedStyle(card).getPropertyValue("--rotateY"));

      if (isNaN(currentX)) currentX = 0;
      if (isNaN(currentY)) currentY = 0;

      const targetX = parseFloat(card.dataset.rotateX) || 0;
      const targetY = parseFloat(card.dataset.rotateY) || 0;

      const x = lerp(currentX, targetX, 0.05);
      const y = lerp(currentY, targetY, 0.05);

      card.style.setProperty("--rotateX", x + "deg");
      card.style.setProperty("--rotateY", y + "deg");
    });
  };

  setInterval(update, 1000 / 60);
});
