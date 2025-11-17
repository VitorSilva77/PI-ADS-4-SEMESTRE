document.addEventListener('DOMContentLoaded', () => {

    const storedUser = localStorage.getItem('profuturo_currentUser');
    if (!storedUser) {
        window.location.href = 'index.html'; 
        return;
    }

    const currentUser = JSON.parse(storedUser);

    const userAvatar = document.getElementById('userAvatar');
    const perfilFuncional = document.getElementById('perfilFuncional');
    const perfilNome = document.getElementById('perfilNome');
    const perfilEmail = document.getElementById('perfilEmail');
    
    const passwordForm = document.getElementById('password-reset-form');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordMessage = document.getElementById('password-message');
    const savePasswordBtn = document.getElementById('btn-save-password');

    function loadUserProfile() {
        if (!currentUser) return;

        const nomeParts = currentUser.nome.split(' ');
        const firstInitial = nomeParts[0] ? nomeParts[0][0] : '';
        const lastInitial = nomeParts.length > 1 ? nomeParts[nomeParts.length - 1][0] : '';
        const initials = `${firstInitial}${lastInitial}`.toUpperCase();

        userAvatar.textContent = initials || '...';

        perfilFuncional.value = currentUser.funcional || 'Não informado';
        perfilNome.value = currentUser.nome || 'Não informado';
        perfilEmail.value = currentUser.email || 'Não informado';
    }

    async function handlePasswordSubmit(e) {
        e.preventDefault();
        
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        showPasswordMessage('', 'success'); 

        if (!newPassword || !confirmPassword) {
            showPasswordMessage('Por favor, preencha ambos os campos de senha.', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showPasswordMessage('As senhas não coincidem.', 'error');
            return;
        }
        if (newPassword.length < 6) {

            showPasswordMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        savePasswordBtn.disabled = true;
        savePasswordBtn.textContent = 'Salvando...';

        try {
            const userId = currentUser.id;

            const userData = { password: newPassword };

            const response = await window.api.updateUser(userId, userData);

            if (response.success) {
                showPasswordMessage('Senha atualizada com sucesso!', 'success');
                passwordForm.reset(); 
            } else {
                showPasswordMessage(`Erro ao atualizar: ${response.error}`, 'error');
            }
        } catch (err) {
            console.error('Erro ao redefinir senha:', err);
            showPasswordMessage(`Erro de comunicação: ${err.message}`, 'error');
        } finally {
            savePasswordBtn.disabled = false;
            savePasswordBtn.textContent = 'Redefinir Senha';
        }
    }

    function showPasswordMessage(message, type = 'error') {
        passwordMessage.textContent = message;
        passwordMessage.className = type; 
    }

    passwordForm.addEventListener('submit', handlePasswordSubmit);

    const logoutButton = document.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
        try {
            localStorage.removeItem('profuturo_currentUser');
            await window.api.logout();
            window.location.href = 'index.html';
        } catch (err) {
            console.error('Erro ao fazer logout:', err);
        }
        });
    }

    loadUserProfile();
});