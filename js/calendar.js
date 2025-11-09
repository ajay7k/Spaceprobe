<script>
  document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth', // can change to 'timeGridWeek' or 'listWeek'
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek'
      },
      events: [
        {
          title: 'Space Weather Workshop',
          start: '2025-12-12',
          end: '2025-12-14'
        },
        {
          title: 'Solar Observation Drive',
          start: '2025-11-05'
        },
        {
          title: 'Space Weather Outreach Talk',
          start: '2025-10-30'
        }
      ],
      eventColor: '#b06fff', // purple
      eventTextColor: '#fff'
    });

    calendar.render();
  });
</script>
