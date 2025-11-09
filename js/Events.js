// ===================================================================
// FullCalendar Initialization (No Changes Here)
// ===================================================================
document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  // This calendar setup remains the same. It works perfectly.
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    events: [
      { title: 'Experience Virtual Tour', start: '2025-12-12' },
      { title: 'Night Sky Observation Drive', start: '2025-11-05' },
      { title: 'Book your Science Outreach programme', start: '2025-10-30' },
      { title: 'Consult your Scientist', start: '2025-10-30' },
      { title: 'Workshop / Hands-on-Training Session', start: '2025-10-30' }
    ],
    eventColor: '#b06fff',
    eventTextColor: '#fff',

    // When an event is clicked in the calendar, scroll to the card
    eventClick: function (info) {
      info.jsEvent.preventDefault();

      const clickedTitle = info.event.title.trim();
      const clickedDate = info.event.startStr;

      const cards = document.querySelectorAll(`.event-card[data-date='${clickedDate}']`);
      let matchedCard = null;

      cards.forEach(card => {
        const title = card.querySelector('h2')?.innerText.trim();
        if (title === clickedTitle && !matchedCard) matchedCard = card;
      });

      if (matchedCard) {
        matchedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        matchedCard.classList.add('highlight');
        setTimeout(() => matchedCard.classList.remove('highlight'), 2000);
      } else {
        alert('Event card not found for this date.');
      }
    }
  });

  calendar.render();
});


// ===================================================================
// START: Updated Modal and Form Handling Logic
// ===================================================================

// --- Get references to all the new modal and form elements ---
const modal = document.getElementById('registrationModal');
const bookingForm = document.getElementById('bookingForm');
const modalTitle = document.getElementById('modalEventTitle');
const eventNameInput = document.getElementById('eventName');
const participantsInput = document.getElementById('participants');
const participantLimitsText = document.getElementById('participantLimits');
const formMessage = document.getElementById('formMessage');

/**
 * NEW: This function now dynamically populates the form before showing it.
 * It's called by the `onclick="openForm(this)"` on each "Book Now" button.
 * @param {HTMLElement} buttonElement - The button that was clicked.
 */
window.openForm = function (buttonElement) {
  // Find the parent .event-card of the button that was clicked
  const card = buttonElement.closest('.event-card');
  
  // Get event details from the card
  const eventTitle = card.querySelector('h2').innerText;
  const participantsText = card.querySelector('.participants').innerText;
  
  // Use regular expressions to safely extract min and max participant numbers
  const minMatch = participantsText.match(/Min Participants:\s*(\d+)/);
  const maxMatch = participantsText.match(/Max Participants:\s*(\d+)/);
  
  // Set default values in case the numbers aren't found
  const min = minMatch ? minMatch[1] : 1;
  const max = maxMatch ? maxMatch[1] : 50;

  // --- Populate the modal form with the event's specific data ---
  modalTitle.innerText = eventTitle;         // Set the visible title
  eventNameInput.value = eventTitle;       // Set the hidden input's value
  participantsInput.min = min;             // Set the validation minimum
  participantsInput.max = max;             // Set the validation maximum
  participantLimitsText.innerText = `(Min: ${min}, Max: ${max})`; // Show limits to user

  // Reset any previous form messages before showing
  formMessage.textContent = '';
  formMessage.className = 'form-message'; // Resets to default styling
  
  // Display the modal
  modal.style.display = 'block';
};

/**
 * Closes the registration modal and resets the form.
 */
window.closeForm = function () {
  modal.style.display = 'none';
  bookingForm.reset(); // Clear out the form fields for the next time
};

/**
 * Closes the modal if the user clicks on the background overlay.
 */
window.onclick = function (event) {
  if (event.target === modal) {
    closeForm();
  }
};

/**
 * NEW: Handles the form submission when the "Proceed to Payment" button is clicked.
 * This is the core of the new functionality.
 */
bookingForm.addEventListener('submit', async function (event) {
  event.preventDefault(); // IMPORTANT: Prevents the browser from reloading the page

  // Provide immediate feedback to the user
  formMessage.textContent = 'Processing your booking...';
  formMessage.className = 'form-message show info';

  // Create a simple JavaScript object from the form data
  const formData = new FormData(bookingForm);
  const bookingDetails = Object.fromEntries(formData.entries());

  // --- This is where we will communicate with the backend ---
  try {
    // We are sending the 'bookingDetails' object to our future server endpoint
    // The endpoint '/api/bookings' does not exist yet. We will create it in the next step.
    const response = await fetch('http://localhost:3000/api/bookings', { // Assuming backend runs on port 3000
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingDetails),
    });

    const result = await response.json();

    if (!response.ok) {
      // If the server returns an error (e.g., validation failed)
      throw new Error(result.message || 'An unknown error occurred.');
    }

    // If the server responds successfully
    formMessage.textContent = 'Booking successful! You will be redirected shortly.';
    formMessage.className = 'form-message show success';

    // In a real application, you would redirect to a payment or confirmation page
    // For now, we'll just close the form after a short delay
    setTimeout(() => {
       closeForm();
       // window.location.href = '/thank-you.html'; // Example of a redirect
    }, 2500);

  } catch (error) {
    // If the fetch request itself fails (e.g., network error or server is down)
    console.error('Submission failed:', error);
    formMessage.textContent = `Error: ${error.message}`;
    formMessage.className = 'form-message show error';
  }
});