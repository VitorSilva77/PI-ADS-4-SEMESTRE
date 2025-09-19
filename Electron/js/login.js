document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const funcional = document.getElementById('text').value;
    const senha = document.getElementById('password').value;
    const errorMessage = document.getElementById('login-error-message');
    
    try {
        const response = await login(funcional, senha);
        
        if (response.success) {
            
            localStorage.setItem('user', JSON.stringify(response.user));
            
            window.location.href = 'userPage.html';
        } else {
            errorMessage.textContent = response.message;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        errorMessage.textContent = 'Erro ao fazer login. Tente novamente.';
        errorMessage.style.display = 'block';
    }
});