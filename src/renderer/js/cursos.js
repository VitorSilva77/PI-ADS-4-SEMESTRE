document.addEventListener('DOMContentLoaded', () => {

    const storedUser = localStorage.getItem('profuturo_currentUser');
    if (!storedUser) {
        window.location.href = 'index.html';
        return;
    }

    const searchInput = document.getElementById('searchInput');
    const workloadFilter = document.getElementById('workloadFilter');
    
    let allCourses = [];  


    async function loadCourses() {
        const container = document.getElementById('courses-container');
        if (!container) return;

        try {
            const response = await api.getAllCourses();
            if (response.success) {
                allCourses = response.data;
                if (allCourses.length === 0) {
                    container.innerHTML = '<p>Nenhum curso encontrado.</p>';
                } else {
                    renderCourses(allCourses);
                }
            } else {
                container.innerHTML = `<p style="color: red;">${response.error || 'Não foi possível carregar os cursos.'}</p>`;
            }
        } catch (err) {
            console.error('Erro ao carregar cursos:', err);
            container.innerHTML = '<p style="color: red;">Erro de comunicação ao buscar os cursos.</p>';
        }
    }

    function renderCourses(courses) {
        const container = document.getElementById('courses-container');
        container.innerHTML = ''; 

        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.dataset.courseId = course.id;

            const imagePath = course.imagem_path 
                ? course.imagem_path
                : '../assets/images/teste1.png';

            card.innerHTML = `
                <img src="${imagePath}" alt="${course.titulo}" class="course-card-image">
                <div class="course-card-content">
                    <h4>${course.titulo}</h4>
                    <p>${course.descricao || 'Sem descrição disponível.'}</p>
                </div>
                <div class="course-card-footer">
                    <span>Carga horária: ${course.carga_horaria || 'N/D'}h</span>
                    <button class="edit-course-btn" data-course-id="${course.id}" data-course-title="${course.titulo}" data-course-description="${course.descricao}" data-course-workload="${course.carga_horaria}" data-professor-id="${course.professor_id}">
                        <i class="fa-solid fa-edit"></i> Editar
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function filterAndRender() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedWorkload = workloadFilter.value;

        const filteredCourses = allCourses.filter(course => {
            const matchesSearch = course.titulo.toLowerCase().includes(searchTerm);
            
            let matchesWorkload = true;
            if (selectedWorkload !== 'all') {
                const workload = parseInt(course.carga_horaria, 10);
                if (!isNaN(workload)) {
                    switch (selectedWorkload) {
                        case '0-20':
                            matchesWorkload = workload > 0 && workload <= 20;
                            break;
                        case '21-40':
                            matchesWorkload = workload > 20 && workload <= 40;
                            break;
                        case '41-80':
                            matchesWorkload = workload > 40 && workload <= 80;
                            break;
                        case '81+':
                            matchesWorkload = workload > 80;
                            break;
                    }
                } else {
                    matchesWorkload = false; 
                }
            }

            return matchesSearch && matchesWorkload;
        });

        renderCourses(filteredCourses);
    }

    
    searchInput.addEventListener('input', filterAndRender);
    workloadFilter.addEventListener('change', filterAndRender);

   
    loadCourses();

    // Lógica para o modal de edição
    const editModal = document.createElement('div');
    editModal.id = 'editCourseModal';
    editModal.className = 'modal';
    editModal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>Editar Curso</h2>
            <form id="editCourseForm">
                <input type="hidden" id="editCourseId">
                <div class="form-group">
                    <label for="editCourseName">Nome do Curso:</label>
                    <input type="text" id="editCourseName" required>
                </div>
                <div class="form-group">
                    <label for="editCourseDescription">Descrição:</label>
                    <textarea id="editCourseDescription" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="editCourseWorkload">Carga Horária (horas):</label>
                    <input type="number" id="editCourseWorkload" required min="1">
                </div>
                <div class="form-group">
                    <label for="editProfessorId">Professor:</label>
                    <select id="editProfessorId" required>
                        <!-- Opções serão preenchidas via JavaScript -->
                    </select>
                </div>
                <button type="submit">Salvar Alterações</button>
                <p id="editFormMessage" style="display: none; margin-top: 10px;"></p>
            </form>
        </div>
    `;
    document.body.appendChild(editModal);

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-course-btn') || e.target.closest('.edit-course-btn')) {
            const btn = e.target.closest('.edit-course-btn');
            const courseId = btn.dataset.courseId;
            const courseTitle = btn.dataset.courseTitle;
            const courseDescription = btn.dataset.courseDescription;
            const courseWorkload = btn.dataset.courseWorkload;
            const professorId = btn.dataset.professorId;

            document.getElementById('editCourseId').value = courseId;
            document.getElementById('editCourseName').value = courseTitle;
            document.getElementById('editCourseDescription').value = courseDescription;
            document.getElementById('editCourseWorkload').value = courseWorkload;
            
            // Seleciona o professor correto no select
            const editProfessorSelect = document.getElementById('editProfessorId');
            if (editProfessorSelect) {
                editProfessorSelect.value = professorId;
            }

            document.getElementById('editFormMessage').style.display = 'none';
            editModal.style.display = 'block';
        } else if (e.target.classList.contains('close-button') || e.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    const editCourseForm = document.getElementById('editCourseForm');
    if (editCourseForm) {
        editCourseForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const courseId = parseInt(document.getElementById('editCourseId').value, 10);
            const courseName = document.getElementById('editCourseName').value;
            const courseDescription = document.getElementById('editCourseDescription').value;
            const courseWorkload = parseInt(document.getElementById('editCourseWorkload').value, 10);
            const professorId = parseInt(document.getElementById('editProfessorId').value, 10);
            const editFormMessage = document.getElementById('editFormMessage');

            if (!courseName || !courseDescription || isNaN(courseWorkload) || courseWorkload <= 0 || isNaN(professorId)) {
                editFormMessage.textContent = 'Por favor, preencha todos os campos corretamente.';
                editFormMessage.style.color = 'red';
                editFormMessage.style.display = 'block';
                return;
            }

            const updatedCourseData = {
                titulo: courseName,
                descricao: courseDescription,
                carga_horaria: courseWorkload,
                professor_id: professorId,
            };

            try {
                const response = await api.updateCourse(courseId, updatedCourseData);
                
                if (response.success) {
                    editFormMessage.textContent = `Curso "${courseName}" atualizado com sucesso!`;
                    editFormMessage.style.color = 'green';
                    loadCourses(); // Recarrega a lista de cursos
                    setTimeout(() => {
                        editModal.style.display = 'none';
                    }, 1500);
                } else {
                    editFormMessage.textContent = response.error || 'Erro ao atualizar o curso.';
                    editFormMessage.style.color = 'red';
                }
            } catch (err) {
                console.error('Erro ao submeter atualização do curso:', err);
                editFormMessage.textContent = 'Erro de comunicação ao tentar atualizar o curso.';
                editFormMessage.style.color = 'red';
            }
            editFormMessage.style.display = 'block';
        });
    }

    async function loadProfessors() {
        const professorSelect = document.getElementById('professorId');
        const editProfessorSelect = document.getElementById('editProfessorId');
        
        if (!professorSelect && !editProfessorSelect) return;

        try {
            const response = await api.getAllProfessors(); 
            if (response.success) {
                const professors = response.data;
                professors.forEach(prof => {
                    const option = document.createElement('option');
                    option.value = prof.id;
                    option.textContent = prof.nome;
                    if (professorSelect) {
                        professorSelect.appendChild(option.cloneNode(true));
                    }
                    if (editProfessorSelect) {
                        editProfessorSelect.appendChild(option.cloneNode(true));
                    }
                });
            } else {
                console.error('Erro ao carregar professores:', response.error);
            }
        } catch (err) {
            console.error('Erro de comunicação ao buscar professores:', err);
        }
    }

    loadProfessors();

    const newCourseForm = document.getElementById('newCourseForm');
    const formMessage = document.getElementById('formMessage');

    if (newCourseForm) {
        newCourseForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const courseName = document.getElementById('courseName').value;
            const courseDescription = document.getElementById('courseDescription').value;
            const courseWorkload = parseInt(document.getElementById('courseWorkload').value, 10);
            const professorId = parseInt(document.getElementById('professorId').value, 10);
            const imageInput = document.getElementById('courseImage');
            const file = imageInput.files[0];

            let imageData = null;

            if (file) {
                const buffer = await file.arrayBuffer();
                imageData = {
                    name: file.name,
                    type: file.type,
                    buffer: buffer 
                };
            }

            if (!courseName || !courseDescription || isNaN(courseWorkload) || courseWorkload <= 0 || isNaN(professorId)) {
                formMessage.textContent = 'Por favor, preencha todos os campos corretamente.';
                formMessage.style.color = 'red';
                formMessage.style.display = 'block';
                return;
            }

            const newCourseData = {
                titulo: courseName,
                descricao: courseDescription,
                carga_horaria: courseWorkload,
                professor_id: professorId,
                image: imageData 
            };

            try {
                const response = await api.createCourse(newCourseData);
                
                if (response.success) {
                    formMessage.textContent = `Curso "${courseName}" criado com sucesso!`;
                    formMessage.style.color = 'green';
                    newCourseForm.reset(); 
                    loadCourses(); 
                } else {
                    formMessage.textContent = response.error || 'Erro ao criar o curso.';
                    formMessage.style.color = 'red';
                }
            } catch (err) {
                console.error('Erro ao submeter novo curso:', err);
                formMessage.textContent = 'Erro de comunicação ao tentar criar o curso.';
                formMessage.style.color = 'red';
            }
            formMessage.style.display = 'block';
        });
    }
});
