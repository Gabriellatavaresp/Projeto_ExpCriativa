document.addEventListener('DOMContentLoaded', () => {
    const loginForm    = document.getElementById('loginForm');
    const emailInput   = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const senha = passwordInput.value;

            if (!email || !senha) {
                await swalWarning('Por favor, preencha o e-mail e a senha.');
                return;
            }

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const result = await response.json();

                if (response.ok) {
                    if (result.data.is_admin === 1 || result.data.is_admin === true) {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/home';
                    }
                } else {
                    await swalError(result.detail || 'E-mail ou senha incorretos.');
                }
            } catch (error) {
                console.error('Erro na requisição de login:', error);
                await swalError('Erro de conexão. Tente novamente mais tarde.');
            }
        });
    }
});
