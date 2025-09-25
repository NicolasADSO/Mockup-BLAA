
    const book = document.getElementById('book');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Animación inicial
    setTimeout(() => book.classList.add('open'), 2000);

    function switchForm(target) {
      book.classList.remove('open');
      setTimeout(() => {
        if (target === 'register') {
          loginForm.style.display = 'none';
          registerForm.style.display = 'block';
        } else {
          loginForm.style.display = 'block';
          registerForm.style.display = 'none';
        }
        book.classList.add('open');
      }, 1500);
    }
  