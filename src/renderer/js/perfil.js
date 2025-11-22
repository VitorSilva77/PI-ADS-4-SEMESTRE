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

        if (!newPassword || !confirmPassword) {
            alert('Por favor, preencha ambos os campos de senha.'); 
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        if (newPassword.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        savePasswordBtn.disabled = true;
        savePasswordBtn.textContent = 'Salvando...';

        try {
            const userId = currentUser.id;
            const userData = { password: newPassword };

            const response = await window.api.updateUser(userId, userData);

            if (response.success) {
                alert('Senha atualizada com sucesso!');
                passwordForm.reset(); 
            } else {
                alert(`Erro ao atualizar: ${response.error}`);
            }
        } catch (err) {
            console.error('Erro ao redefinir senha:', err);
            alert(`Erro de comunicação: ${err.message}`);
        } finally {
            savePasswordBtn.disabled = false;
            savePasswordBtn.textContent = 'Redefinir Senha';
        }
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