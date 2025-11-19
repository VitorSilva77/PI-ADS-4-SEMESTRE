let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  
  try {
    const storedUser = localStorage.getItem('profuturo_currentUser');
    console.log('USERPAGE.JS: Valor lido do localStorage:', storedUser);

    if (storedUser) {
      currentUser = JSON.parse(storedUser); 
 
      if (!currentUser || !currentUser.id) { 
        console.warn('USERPAGE.JS: Sessão encontrada, mas inválida. Limpando.');
        localStorage.removeItem('profuturo_currentUser');
        currentUser = null;
      } else {
         console.log('USERPAGE.JS: Usuário (após JSON.parse):', currentUser);
         await api.restoreSession(currentUser);
         console.log('Sessão restaurada do localStorage.');
      }
    }

    if (currentUser) {
      console.log(`USERPAGE.JS: Renderizando página para: ${currentUser.nome}`);
      console.log(`Usuário logado: ${currentUser.nome} (Role: ${currentUser.role})`);
      initializePage(currentUser); 
      await loadPageContent();
    } else {
      console.warn('Nenhuma sessão válida encontrada. Redirecionando para o login.');
      window.location.href = 'index.html';
    }
  } catch (err) {
    console.error('Erro fatal ao verificar sessão (JSON corrompido?):', err);
    localStorage.removeItem('profuturo_currentUser'); 
    window.location.href = 'index.html';
  }
});

function initializePage(user) {
  renderUserInfo(user);
  applyRBAC(user.role_name);
  attachGlobalListeners();
}

async function loadPageContent() {
 
  await loadCourseCards();
  await loadDashboardData(null);
  await loadEnrollmentData();
  await loadGradesCourseData();
}

function attachGlobalListeners() {
  const logoutButton = document.querySelector('.logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        localStorage.removeItem('profuturo_currentUser');
        await api.logout();
        window.location.href = 'index.html';
      } catch (err) {
        console.error('Erro ao fazer logout:', err);
      }
    });
  }

  const registrationForm = document.querySelector('.registration form');
  if (registrationForm) {
    registrationForm.addEventListener('submit', handleRegistrationSubmit);
  }

  const noticeForm = document.getElementById('formNotice');
  if (noticeForm) {
    noticeForm.addEventListener('submit', handleNoticeSubmit);
  }

  const enrollmentForm = document.getElementById('enrollment-form');
  if (enrollmentForm) {
    enrollmentForm.addEventListener('submit', handleEnrollmentSubmit);
  }

  const gradesCourseSelect = document.getElementById('grades-course-select');
  if (gradesCourseSelect) {
    gradesCourseSelect.addEventListener('change', handleGradesCourseChange);
  }

  const gradesStudentSelect = document.getElementById('grades-student-select');
  if (gradesStudentSelect) {
    gradesStudentSelect.addEventListener('change', handleGradesStudentChange);
  }
  
  const gradesForm = document.getElementById('grades-form');
  if (gradesForm) {
    gradesForm.addEventListener('submit', handleGradesFormSubmit);
  }

}

function renderUserInfo(user) {
  const headerTitle = document.querySelector('.header h2');
  if (headerTitle) {
    headerTitle.textContent = `Dashboard - Olá, ${user.nome}!`;
  }
}

function applyRBAC(role) {
  const roles = {
    isTI: role === 'TI',
    isRH: role === 'RH',
    isProfessor: role === 'Professor',
  };

  // --- Menu Lateral ---
  if (!roles.isTI && !roles.isRH) {
    document.querySelector('a[href="#relatorios"]')?.closest('a').remove();
  }
  if (!roles.isTI) {
     document.querySelector('a[href="./usuarios.html"]')?.closest('a').remove();
  }
  
  // --- Seções Principais ---
  if (!roles.isTI) {
    document.querySelector('.registration')?.remove();
    document.getElementById('enrollment-section')?.remove();
  }
  if (!roles.isTI && !roles.isRH && !roles.isProfessor) {
     document.querySelector('.mural .form-container')?.remove();
  }
  if (!roles.isTI && !roles.isRH && !roles.isProfessor) {
    document.querySelector('.charts')?.remove();
    document.querySelector('section.chart')?.remove();
  }

  if (roles.isProfessor) {
    const area = document.getElementById('area-criacao-cursos');
    if (area) area.style.display = 'block';
  }
  if (roles.isTI) {
    const area = document.getElementById('area-atribuicao-professores');
    if (area) area.style.display = 'block';

    const enrollSection = document.getElementById('enrollment-section');
    if (enrollSection) enrollSection.style.display = 'block';
  }

  if (roles.isTI || roles.isProfessor) {
    const gradesSection = document.getElementById('grades-section');
    if (gradesSection) gradesSection.style.display = 'block';
  }
  
}

async function loadCourseCards() {
  const container = document.querySelector('.courses-container');
  if (!container) return;

  try {
    let response;
    if (currentUser && currentUser.role_name === 'Professor') {
      response = await api.getCoursesByProfessor(currentUser.id);
    } else {
      response = await api.getAllCourses();
    }

    if (response.success) {
      if (response.data.length === 0) {
        container.innerHTML = '<p>Nenhum curso encontrado.</p>';
        return;
      }
      
      container.innerHTML = ''; 
      response.data.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card'; 
        card.dataset.courseId = course.id;

        const imagePath = course.imagem_path 
          ? course.imagem_path
          : '../assets/images/teste1.png'; //imagem defaut que carreag se nn existir o caminho na tabela

        card.innerHTML = `
          <img src="${imagePath}" alt="${course.titulo}" class="course-card-image">
          <div class="course-card-content">
            <h4>${course.titulo}</h4>
            <p>Carga horária: ${course.carga_horaria || 'N/D'}h</p>
          </div>
        `;
        container.appendChild(card);
      });
      
      setupCourseSelection();
    } else {
      container.innerHTML = `<p style="color: red;">${response.error || 'Não foi possível carregar os cursos.'}</p>`;
    }
  } catch (err) {
    console.error('Erro ao carregar cursos:', err);
    container.innerHTML = '<p style="color: red;">Erro de comunicação ao buscar os cursos.</p>';
  }
}

function setupCourseSelection() {
  const courseCards = document.querySelectorAll('.course-card');
  
  const gradesCourseSelect = document.getElementById('grades-course-select');

  if (!gradesCourseSelect) return; 

  courseCards.forEach(card => {
    card.addEventListener('click', () => {
      const isAlreadySelected = card.classList.contains('selected');
      
      courseCards.forEach(c => c.classList.remove('selected'));

      let selectedCourseId = null;

      if (isAlreadySelected) {
        loadDashboardData(); 
          
        gradesCourseSelect.value = "";

      } else {
          card.classList.add('selected');

          selectedCourseId = card.dataset.courseId;
          
          loadDashboardData(selectedCourseId);
          
          gradesCourseSelect.value = selectedCourseId;
      }
      gradesCourseSelect.dispatchEvent(new Event('change'));
    });

  });

}

async function loadDashboardData(courseId = null) {
    console.log(`Carregando dados do dashboard para o curso: ${courseId || 'Todos'}`);

    const chartSection = document.querySelector('section.chart');
    if (chartSection) {
        const title = chartSection.querySelector('.section-title');
        if (title) {
            title.textContent = courseId ? `Gráficos do Curso Selecionado` : 'Gráficos Gerais';
        }
    }
    try {
      if (typeof loadGradeDistributionChart === 'function') {
        await loadGradeDistributionChart(courseId);
      }
      
      if (typeof loadEnrollmentStatusChart === 'function') {
        loadEnrollmentStatusChart(courseId); 
      }

    } catch (err) {
      console.error('Erro ao recarregar os gráficos:', err);
    }
}

async function handleRegistrationSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const button = form.querySelector('button[type="submit"]');
  
  const funcional = document.getElementById('regFuncional').value;
  const nome = document.getElementById('regNome').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const roleName = document.getElementById('regRole').value;

  if (!funcional || !nome || !email || !password || !roleName) {
      alert('Por favor, preencha todos os campos.');
      return;
  }
  
  button.disabled = true;
  button.textContent = 'Salvando...';

  try {
    const response = await api.createUser({ funcional, nome, email, password, roleName });

    if (response.success) {
      alert('Usuário criado com sucesso!');
      form.reset();
    } else {
      alert(`Erro ao salvar: ${response.error}`);
    }
  } catch (err) {
    console.error('Erro ao registrar:', err);
    alert('Erro de comunicação ao registrar usuário.');
  } finally {
    button.disabled = false;
    button.textContent = 'Salvar';
  }
}

async function loadEnrollmentData() {
  const enrollSection = document.getElementById('enrollment-section');
  
  if (!enrollSection || enrollSection.style.display === 'none') {
    return;
  }

  const courseSelect = document.getElementById('enroll-course-select');
  const studentSelect = document.getElementById('enroll-student-select');
  const messageEl = document.getElementById('enroll-message');
  
  messageEl.textContent = ''; 
  messageEl.className = '';

  try {
    
    courseSelect.disabled = true;
    const courseResponse = await api.getAllCourses();
    
    if (courseResponse.success) {
      courseSelect.innerHTML = '<option value="">-- Selecione um curso --</option>'; 
      courseResponse.data.forEach(course => {
        courseSelect.innerHTML += `<option value="${course.id}">${course.titulo}</option>`;
      });
    } else {
      courseSelect.innerHTML = '<option value="">Erro ao carregar cursos</option>';
    }

    studentSelect.disabled = true;
    const studentResponse = await api.getAvailableStudents();
    
    if (studentResponse.success) {
      studentSelect.innerHTML = '<option value="">-- Selecione um aluno --</option>'; 
      if (studentResponse.data.length === 0) {
        studentSelect.innerHTML = '<option value="">Nenhum aluno disponível</option>';
      } else {
        studentResponse.data.forEach(student => {
          studentSelect.innerHTML += `<option value="${student.id}">${student.nome} (Funcional: ${student.funcional || 'N/D'})</option>`;
        });
      }
    } else {
      studentSelect.innerHTML = '<option value="">Erro ao carregar alunos</option>';
    }
    
  } catch (err) {
    console.error('Erro ao carregar dados de matrícula:', err);
    messageEl.textContent = 'Erro de comunicação ao carregar dados.';
    messageEl.className = 'error';
  } finally {
    
    courseSelect.disabled = false;
    studentSelect.disabled = false;
  }
}


async function handleEnrollmentSubmit(e) {
  e.preventDefault();
  
  const courseSelect = document.getElementById('enroll-course-select');
  const studentSelect = document.getElementById('enroll-student-select');
  const submitBtn = document.getElementById('enroll-submit-btn');
  const messageEl = document.getElementById('enroll-message');
  
  const curso_id = courseSelect.value;
  const aluno_id = studentSelect.value;

  if (!curso_id || !aluno_id) {
    messageEl.textContent = 'Por favor, selecione um curso E um aluno.';
    messageEl.className = 'error';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Matriculando...';
  messageEl.textContent = '';
  messageEl.className = '';

  try {
    const response = await api.createEnrollment({ aluno_id, curso_id });
    
    if (response.success) {
      messageEl.textContent = 'Aluno matriculado com sucesso!';
      messageEl.className = 'success';
      
      courseSelect.value = '';
      
      await loadEnrollmentData();
      
    } else {
      messageEl.textContent = `Erro: ${response.error}`;
      messageEl.className = 'error';
    }
    
  } catch (err) {
    console.error('Erro ao matricular:', err);
    messageEl.textContent = 'Erro de comunicação ao tentar matricular.';
    messageEl.className = 'error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Matricular';
  }
}

//Carrega os cursos no dropdown de notas.
//TI ve todos, professor ve apenas os seus
async function loadGradesCourseData() {
  const select = document.getElementById('grades-course-select');
  if (!select) return;

  select.disabled = true;
  
  try {
    let response;
    if (currentUser && currentUser.role_name === 'Professor') {
      response = await api.getCoursesByProfessor(currentUser.id);
    } else {
      response = await api.getAllCourses();
    }

    if (response.success) {
      select.innerHTML = '<option value="">-- Selecione um curso --</option>'; 
      response.data.forEach(course => {
        select.innerHTML += `<option value="${course.id}">${course.titulo}</option>`;
      });
    } else {
      select.innerHTML = '<option value="">Erro ao carregar cursos</option>';
    }
  } catch (err) {
    console.error('Erro ao carregar cursos para notas:', err);
    select.innerHTML = '<option value="">Erro de comunicação</option>';
  } finally {
    select.disabled = false;
  }
}


//Chamado quando o admin/prof seleciona um curso na seção de notas.
//Carrega os alunos matriculados nesse curso.
async function handleGradesCourseChange(e) {
  const curso_id = e.target.value;
  const studentSelect = document.getElementById('grades-student-select');
  const detailsDiv = document.getElementById('grades-details');
  const messageEl = document.getElementById('grades-message');

  studentSelect.innerHTML = '<option value="">-- Selecione um aluno --</option>';
  studentSelect.disabled = true;
  detailsDiv.style.display = 'none';
  messageEl.textContent = '';
  
  if (!curso_id) return;

  studentSelect.innerHTML = '<option value="">Carregando alunos...</option>';
  
  try {
    const response = await api.getEnrollmentsByCourse(curso_id);

    if (response.success) {
      if (response.data.length === 0) {
        studentSelect.innerHTML = '<option value="">Nenhum aluno matriculado</option>';
        return;
      }
      
      studentSelect.innerHTML = '<option value="">-- Selecione um aluno --</option>';
      response.data.forEach(matricula => {
        studentSelect.innerHTML += `
          <option 
            value="${matricula.id}" 
            data-status="${matricula.status}" 
            data-nota="${matricula.nota_final || ''}"
          >
            ${matricula.aluno_nome} (Status: ${matricula.status})
          </option>
        `;
      });
      studentSelect.disabled = false;
    } else {
      studentSelect.innerHTML = '<option value="">Erro ao buscar alunos</option>';
      messageEl.textContent = `Erro: ${response.error}`;
      messageEl.className = 'error';
    }
  } catch (err) {
    console.error('Erro ao buscar matrículas:', err);
    studentSelect.innerHTML = '<option value="">Erro de comunicação</option>';
  }
}

//Chamado quando um aluno é selecionado
//Mostra os campos de nota e aplica a lógica de permissão 
function handleGradesStudentChange(e) {
  const detailsDiv = document.getElementById('grades-details');
  const noteInput = document.getElementById('grades-note-input');
  const statusInfo = document.getElementById('grades-status-info');
  const submitBtn = document.getElementById('grades-submit-btn');

  const selectedOption = e.target.options[e.target.selectedIndex];
  if (!selectedOption || !e.target.value) {
    detailsDiv.style.display = 'none';
    return;
  }

  const status = selectedOption.dataset.status;
  const nota = selectedOption.dataset.nota;

  noteInput.value = nota;
  detailsDiv.style.display = 'flex';

  if (status === 'cursando') {
    statusInfo.textContent = 'Este aluno está "Cursando". Ao salvar, o status mudará para "Concluído".';
    submitBtn.textContent = 'Concluir Aluno';
    noteInput.disabled = false;
    submitBtn.disabled = false;
  } 
  else if (status === 'concluido') {
    statusInfo.textContent = 'Este aluno já concluiu o curso.';
    submitBtn.textContent = 'Atualizar Nota';
    
    if (currentUser.role_name === 'TI') {
      noteInput.disabled = false;
      submitBtn.disabled = false;
    } else {
      noteInput.disabled = true;
      submitBtn.disabled = true;
      statusInfo.textContent += ' (Apenas TI pode editar notas de alunos concluídos)';
    }
  }
}

async function handleGradesFormSubmit(e) {
  e.preventDefault();

  const studentSelect = document.getElementById('grades-student-select');
  const noteInput = document.getElementById('grades-note-input');
  const submitBtn = document.getElementById('grades-submit-btn');
  const messageEl = document.getElementById('grades-message');

  const enrollment_id = studentSelect.value;
  const nota_final = noteInput.value;

  if (!enrollment_id || nota_final === '') {
    messageEl.textContent = 'Selecione um aluno e insira uma nota.';
    messageEl.className = 'error';
    return;
  }
  
  const notaNum = parseFloat(nota_final);
  if (notaNum < 0 || notaNum > 10) {
      messageEl.textContent = 'A nota deve ser entre 0 e 10.';
      messageEl.className = 'error';
      return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Salvando...';
  messageEl.textContent = '';
  messageEl.className = '';

  try {
    const response = await api.updateEnrollmentGrade({ enrollment_id, nota_final: notaNum });

    if (response.success) {
      messageEl.textContent = 'Nota salva com sucesso!';
      messageEl.className = 'success';

      document.getElementById('grades-details').style.display = 'none';

      await handleGradesCourseChange({ target: document.getElementById('grades-course-select') });

    } else {
      messageEl.textContent = `Erro: ${response.error}`;
      messageEl.className = 'error';
    }

  } catch (err) {
    console.error('Erro ao salvar nota:', err);
    messageEl.textContent = 'Erro de comunicação ao salvar.';
    messageEl.className = 'error';
  } finally {
    submitBtn.disabled = false;
  }
}