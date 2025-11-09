document.addEventListener("DOMContentLoaded", () => {
  // ===== MODALS =====
  const modals = {
    payment: document.getElementById("paymentModal"),
    volunteer: document.getElementById("volunteerModal"),
    collaborate: document.getElementById("collabModal"),
    donate: document.getElementById("donateModal")
  };

  // ===== PAYMENT MODAL ELEMENTS =====
  const paidBtn = document.getElementById("paidBtn");
  const paidMsg = document.getElementById("paidMsg");
  const copyBtn = document.querySelector(".copy-btn");
  const neftDetails = document.getElementById("neftDetails");

  // ===== OPEN PAYMENT MODAL =====
  document.querySelectorAll(".pay-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      paidMsg.style.display = "none";
      paidBtn.disabled = false;
      paidBtn.innerText = "I Paid";
      copyBtn.innerText = "Copy Details";
      modals.payment.style.display = "block";
    });
  });

  // ===== OPEN VOLUNTEER & COLLABORATE MODALS =====
  document.querySelectorAll(".volunteer-btn").forEach(btn =>
    btn.addEventListener("click", () => (modals.volunteer.style.display = "block"))
  );
  document.querySelectorAll(".collaborate-btn").forEach(btn =>
    btn.addEventListener("click", () => (modals.collaborate.style.display = "block"))
  );

  // ===== OPEN DONATE MODAL =====
  document.querySelectorAll(".open-donate-modal").forEach(btn =>
    btn.addEventListener("click", () => (modals.donate.style.display = "block"))
  );

  // ===== CLOSE BUTTONS =====
  document.querySelectorAll(".modal .close").forEach(btn =>
    btn.addEventListener("click", () => {
      btn.closest(".modal").style.display = "none";
    })
  );

  // ===== CLOSE MODALS ON OUTSIDE CLICK =====
  window.addEventListener("click", e => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });

  // ===== COPY NEFT DETAILS =====
  if (copyBtn && neftDetails) {
    copyBtn.addEventListener("click", () => {
      const text = neftDetails.innerText.replace(/\n/g, " ");
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerText = "Copied!";
        setTimeout(() => (copyBtn.innerText = "Copy Details"), 2000);
      });
    });
  }

  // ===== MARK AS PAID =====
  if (paidBtn && paidMsg) {
    paidBtn.addEventListener("click", () => {
      paidMsg.style.display = "block";
      paidBtn.disabled = true;
      paidBtn.innerText = "Acknowledged";
    });
  }
});
