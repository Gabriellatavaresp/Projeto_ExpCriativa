document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const senha = passwordInput.value;

            if (!email || !senha) {
                alert("Por favor, preencha o e-mail e a senha.");
                return;
            }

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, senha })
                });

                const result = await response.json();

                if (response.ok) {
                    // Salvar as informações do usuário logado se necessário
                    localStorage.setItem('user', JSON.stringify(result.data));
                    
                    // Redirecionar dependendo do tipo de usuário
                    if (result.data.is_admin === 1 || result.data.is_admin === true) {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/home';
                    }
                } else {
                    // Mostrar mensagem de erro retornada pela API
                    alert(result.detail || "E-mail ou senha incorretos.");
                }
            } catch (error) {
                console.error("Erro na requisição de login:", error);
                alert("Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.");
            }
        });
    }
});
