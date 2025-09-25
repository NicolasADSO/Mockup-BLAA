document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    height: 600,

    // 📌 Evento de prueba
    events: [
      { title: '📦 Pedido de prueba', start: '2025-02-10' }
    ],

    eventColor: '#990f0c',
    eventTextColor: '#fff',

    // 📌 Click en un día → crear evento
    dateClick: function (info) {
      const title = prompt('Ingrese el título del pedido:');
      if (title) {
        calendar.addEvent({
          title: title,
          start: info.dateStr,
          allDay: true
        });
      }
    }
  });

  calendar.render();
});
