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

    // valida CPF pelos dígitos verificadores
    function isValidCPF(cpf) {
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
      let sum = 0;
      for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
      let first = (sum * 10) % 11;
      if (first === 10 || first === 11) first = 0;
      if (first !== parseInt(cpf[9])) return false;
      sum = 0;
      for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
      let second = (sum * 10) % 11;
      if (second === 10 || second === 11) second = 0;
      return second === parseInt(cpf[10]);
    }

    function isStrongPassword(password) {
      // Pelo menos 8 caracteres
      if (password.length < 8) return false;

      // Pelo menos uma letra maiúscula
      if (!/[A-Z]/.test(password)) return false;

      // Pelo menos uma letra minúscula
      if (!/[a-z]/.test(password)) return false;

      // Pelo menos um número
      if (!/[0-9]/.test(password)) return false;

      // Pelo menos um caractere especial (!@#$%^&*, etc)
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

      return true;
    }

    function getPasswordStrength(password) {
      let score = 0;
      if (password.length >= 8) score += 1;          // comprimento mínimo
      if (/[A-Z]/.test(password)) score += 1;       // maiúscula
      if (/[a-z]/.test(password)) score += 1;       // minúscula
      if (/[0-9]/.test(password)) score += 1;       // número
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1; // símbolo
      return score; // 0 a 5
    }

    function validatePasswordDetailed(password) {
      return {
        length: password.length < 8,
        upper: !/[A-Z]/.test(password),
        lower: !/[a-z]/.test(password),
        number: !/[0-9]/.test(password),
        symbol: !/[!@#$%^&*(),.?":{}|<>]/.test(password),
      };
    }

    // Atualizar barra em tempo real
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strengthIndicator');

    passwordInput.addEventListener('input', () => {
      const password = passwordInput.value;
      const errors = validatePasswordDetailed(password);

      // Mostrar/ocultar erros
      setErrorVisibility('passwordErrorLength', errors.length);
      setErrorVisibility('passwordErrorUpper', errors.upper);
      setErrorVisibility('passwordErrorLower', errors.lower);
      setErrorVisibility('passwordErrorNumber', errors.number);
      setErrorVisibility('passwordErrorSymbol', errors.symbol);

      // Atualizar barra de força
      const score = 5 - Object.values(errors).filter(Boolean).length; // 0 a 5
      const percent = (score / 5) * 100;
      strengthFill.style.width = percent + '%';

      if (score <= 2) strengthFill.style.background = 'red';
      else if (score === 3) strengthFill.style.background = 'orange';
      else if (score === 4) strengthFill.style.background = 'yellowgreen';
      else if (score === 5) strengthFill.style.background = 'green';
    });

    function setErrorVisibility(id, show) {
      const el = document.getElementById(id);
      if (show) el.classList.add('visible');
      else el.classList.remove('visible');
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
      if (!isValidCPF(cpf)) {
        setError('cpf', 'cpfError', true); valid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('email', 'emailError', true); valid = false;
      }
      if (username.length < 3) {
        setError('username', 'usernameError', true); valid = false;
      }
      const pwdErrors = validatePasswordDetailed(password);
      let hasPwdError = false;
      for (let key in pwdErrors) {
        if (pwdErrors[key]) {
          setErrorVisibility(`passwordError${capitalize(key)}`, true);
          hasPwdError = true;
        } else {
          setErrorVisibility(`passwordError${capitalize(key)}`, false);
        }
      }
      if (hasPwdError) valid = false;

      // Função auxiliar
      function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
      if (confirmPassword !== password) {
        setError('confirmPassword', 'confirmPasswordError', true); valid = false;
      }

      if (!confirmPassword) {
        setError('confirmPassword', 'confirmPasswordError', true); valid = false
      }

      if (valid) {
        window.location.href = '/';
      }
    });