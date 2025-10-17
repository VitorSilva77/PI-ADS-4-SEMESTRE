let selectedCourseId = null;
let coursesData = [];
let charts = {};

function initializeCharts() {

    charts.attendance = new Chart(
        document.getElementById('attendanceChart'),
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Frequência',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        }
    );

    charts.performance = new Chart(
        document.getElementById('performanceChart'),
        {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Desempenho',
                    data: [],
                    backgroundColor: 'rgb(54, 162, 235)'
                }]
            }
        }
    );

    charts.progress = new Chart(
        document.getElementById('progressChart'),
        {
            type: 'doughnut',
            data: {
                labels: ['Completo', 'Em Progresso', 'Não Iniciado'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgb(75, 192, 192)',
                        'rgb(255, 205, 86)',
                        'rgb(255, 99, 132)'
                    ]
                }]
            }
        }
    );
}

async function loadAndDisplayCourses() {
    try {

        const apiResp = await fetchCourses();
        if (!apiResp || apiResp.success !== true) {
            console.warn('Resposta inesperada ao buscar cursos:', apiResp);
            return;
        }
        coursesData = apiResp.courses || [];
        console.log('Dados dos cursos carregados:', coursesData); // Debug

        createCourseCards(coursesData);

        initializeCharts();

        updateCharts();

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function createCourseCards(courses) {
    const container = document.querySelector('.courses-container');
    container.innerHTML = ''; 

    courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';
        const courseId = course.id_curso || course.id;
        const courseName = course.nome_curso || course.nome || course.name || 'Curso';
        const totalAlunos = course.total_alunos || 0;
        const status = course.status || 'Ativo';
        card.setAttribute('data-course-id', courseId);
        
        card.innerHTML = `
            <h3>${courseName}</h3>
            <p>Alunos: ${totalAlunos}</p>
            <p>Status: ${status}</p>
        `;

        card.addEventListener('click', () => handleCardSelection(courseId));
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    
    const session = await window.auth.getUserSession();
    if (!session || !session.permissions.includes('viewAllCourses')) {
        const coursesSection = document.querySelector('section.courses');
        if (coursesSection) coursesSection.style.display = 'none';
        return; 
    }

    console.log('Página carregada, iniciando...');
    loadAndDisplayCourses();
});