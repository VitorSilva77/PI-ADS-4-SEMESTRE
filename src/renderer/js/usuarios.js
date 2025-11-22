document.addEventListener('DOMContentLoaded', () => {
    
    const storedUser = localStorage.getItem('profuturo_currentUser');
    if (!storedUser) {
        window.location.href = 'index.html';
        return;
    }
    
    const tableContainer = document.getElementById('ajax-table-container');
    const userForm = document.getElementById('user-form');
    const formTitle = document.getElementById('form-title');
    const formMessage = document.getElementById('form-message');
    const hiddenUserId = document.getElementById('userId');
    const btnSave = document.getElementById('btn-save');
    const btnCancel = document.getElementById('btn-cancel');

    const regNome = document.getElementById('regNome');
    const regFuncional = document.getElementById('regFuncional');
    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');
    const regRole = document.getElementById('regRole');
    const regActive = document.getElementById('regActive');

    loadUsers();

    /**
     * Busca todos os usuários da API e renderiza a tabela.
     */
    async function loadUsers() {
        tableContainer.innerHTML = '<p>Carregando usuários...</p>';
        try {
            const response = await window.api.getAllUsers();
            if (response.success) {
                renderUserTable(response.data);
            } else {
                tableContainer.innerHTML = `<p style="color: red;">${response.error}</p>`;
            }
        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
            tableContainer.innerHTML = '<p style="color: red;">Erro de comunicação ao buscar usuários.</p>';
        }
    }

    /**
     * Renderiza a tabela de usuários com os dados fornecidos.
     */
    function renderUserTable(users) {
        if (users.length === 0) {
            tableContainer.innerHTML = '<h2>Nenhum usuário cadastrado.</h2>';
            return;
        }

        const tableHeaders = ['Funcional', 'Nome', 'Email', 'Role', 'Status', 'Ações'];
        
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    ${tableHeaders.map(header => `<th>${header}</th>`).join('')}
                </tr>  
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.funcional}</td>
                        <td>${user.nome}</td>
                        <td>${user.email}</td>
                        <td>${user.role_name}</td>
                        <td>${user.is_active ? 'Ativo' : 'Inativo'}</td>
                        <td class="action-buttons">
                            <button class="btn-action btn-edit" data-id="${user.id}"><i class="fa-solid fa-pencil"></i></button>
                            <button class="btn-action btn-delete" data-id="${user.id}"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        tableContainer.innerHTML = '<h2>Usuários Cadastrados</h2>';
        tableContainer.appendChild(table);

        attachTableListeners();
    }

    /**
     * Adiciona listeners aos botões de Editar e Deletar
     */
    function attachTableListeners() {
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', handleEditClick);
        });
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', handleDeleteClick);
        });
    }

    /**
     * Lida com o submit do formulário
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const id = hiddenUserId.value;
        const userData = {
            nome: regNome.value,
            funcional: regFuncional.value,
            email: regEmail.value,
            password: regPassword.value, 
            roleName: regRole.value,
            is_active: regActive.value === 'true'
        };

        // Se não houver senha digitada (no update), remove a chave
        if (!userData.password) {
            delete userData.password;
        }

        btnSave.disabled = true;
        btnSave.textContent = 'Salvando...';

        try {
            const response = id 
                ? await window.api.updateUser(id, userData) 
                : await window.api.createUser(userData);   

            if (response.success) {
                await showFormMessage('Usuário salvo com sucesso!', 'success');
                resetForm();
                await loadUsers(); 
            } else {
                showFormMessage(`Erro: ${response.error}`, 'error');
            }
        } catch (err) {
            console.error('Erro ao salvar:', err);
            showFormMessage(`Erro de comunicação: ${err.message}`, 'error');
        } finally {
            btnSave.disabled = false;
            btnSave.textContent = 'Salvar';
        }
    }

    /**
     * Prepara o formulário para edição ao clicar no botão Editar.
     */
    async function handleEditClick(e) {
        const id = e.currentTarget.dataset.id;
        
        try {
            const response = await window.api.getUserById(id);
            if (!response.success) {
                alert(`Erro ao buscar usuário: ${response.error}`);
                return;
            }

            const user = response.data;

            formTitle.textContent = 'Editando Usuário';
            hiddenUserId.value = user.id;
            regNome.value = user.nome;
            regFuncional.value = user.funcional;
            regEmail.value = user.email;
            regRole.value = user.role_name;
            regActive.value = user.is_active ? 'true' : 'false';
            regPassword.value = ''; 
            regPassword.placeholder = 'Deixe em branco para não alterar';
            
            btnCancel.style.display = 'inline-block';
            window.scrollTo(0, 0); 

        } catch (err) {
            alert(`Erro de comunicação: ${err.message}`);
        }
    }

    /**
     * Lida com o botão Deletar.
     */
    async function handleDeleteClick(e) {
        const id = e.currentTarget.dataset.id;
        
        if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            try {
                const response = await window.api.deleteUser(id);
                if (response.success) {
                    alert('Usuário excluído com sucesso.');
                    await loadUsers(); 
                } else {
                    alert(`Erro ao excluir: ${response.error}`);
                }
            } catch (err) {
                console.error('Erro ao deletar:', err);
                alert(`Erro de comunicação: ${err.message}`);
            }
        }
    }

    /**
     * Reseta o formulário para o estado de "Criar Novo".
     */
    function resetForm() {
        userForm.reset();
        formTitle.textContent = 'Cadastrar Novo Usuário';
        hiddenUserId.value = '';
        regPassword.placeholder = 'Senha';
        btnCancel.style.display = 'none';
        hideFormMessage();
    }

    function showFormMessage(message, type = 'error') {
        formMessage.textContent = message;
        formMessage.className = type;
        formMessage.style.display = 'block';
    }

    function hideFormMessage() {
        formMessage.style.display = 'none';
    }


    userForm.addEventListener('submit', handleFormSubmit);
    btnCancel.addEventListener('click', resetForm);

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
});