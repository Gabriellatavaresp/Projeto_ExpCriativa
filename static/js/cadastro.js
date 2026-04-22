    // mascara CPF
    const cpfInput = document.getElementById('cpf');

    cpfInput.addEventListener('input', function () {
      let digits = this.value.replace(/\D/g, '').slice(0, 11);
      let formatted = digits;
      if (digits.length > 9)
        formatted = digits.slice(0,3)+'.'+digits.slice(3,6)+'.'+digits.slice(6,9)+'-'+digits.slice(9);
      else if (digits.length > 6)
        formatted = digits.slice(0,3)+'.'+digits.slice(3,6)+'.'+digits.slice(6);
      else if (digits.length > 3)
        formatted = digits.slice(0,3)+'.'+digits.slice(3);
      this.value = formatted;
    });

    // alternar visibilidade da senha
    const eyeOpen = `<svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    const eyeOff  = `<svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

    function togglePw(id, btn) {
      const input = document.getElementById(id);
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.innerHTML = isHidden ? eyeOff : eyeOpen;
    }

    // Auxiliares de validação
    function setError(fieldId, errorId, show) {
      const input = document.getElementById(fieldId);
      const msg   = document.getElementById(errorId);
      if (show) {
        input.classList.add('error');
        msg.classList.add('visible');
      } else {
        input.classList.remove('error');
        msg.classList.remove('visible');
      }
    }

    // limpa o erro ao digitar
    ['name','cpf','email','username','password','confirmPassword'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        setError(id, id+'Error', false);
      });
    });

    // verificaçoes para enviar formulário
    document.getElementById('registerForm').addEventListener('submit', function (e) {
      e.preventDefault();

      const name            = document.getElementById('name').value.trim();
      const cpf             = document.getElementById('cpf').value.replace(/\D/g,'');
      const email           = document.getElementById('email').value.trim();
      const username        = document.getElementById('username').value.trim();
      const password        = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      let valid = true;

      if (!name) {
        setError('name', 'nameError', true); valid = false;
      }
      if (cpf.length !== 11) {
        setError('cpf', 'cpfError', true); valid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('email', 'emailError', true); valid = false;
      }
      if (username.length < 3) {
        setError('username', 'usernameError', true); valid = false;
      }
      if (password.length < 8) {
        setError('password', 'passwordError', true); valid = false;
      }
      if (confirmPassword !== password) {
        setError('confirmPassword', 'confirmPasswordError', true); valid = false;
      }

      if (!confirmPassword) {
        setError('confirmPassword', 'confirmPasswordError', true); valid = false
      }

      if (valid) {
        // redireciona para a landing page ao logar
        window.location.href = '/';
      }
    });