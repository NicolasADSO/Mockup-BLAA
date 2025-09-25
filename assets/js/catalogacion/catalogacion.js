
    function toggleOrder(id) {
      const el = document.getElementById(id);
      el.classList.toggle("hidden");
      el.previousElementSibling.classList.toggle("active");
    }
  