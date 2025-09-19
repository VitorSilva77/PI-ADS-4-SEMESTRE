let selectedCourseId = null;
let coursesData = [];
let charts = {};

// Inicialização dos gráficos
function initializeCharts() {
    // Gráfico de Frequência
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

    // Gráfico de Desempenho
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

    // Gráfico de Progresso
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
        // Buscar dados dos cursos
        coursesData = await fetchCourses();
        console.log('Dados dos cursos carregados:', coursesData); // Debug

        // Criar cards dos cursos
        createCourseCards(coursesData);
        
        // Inicializar gráficos
        initializeCharts();
        
        // Atualizar gráficos com dados gerais
        updateCharts();

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function createCourseCards(courses) {
    const container = document.querySelector('.courses-container');
    container.innerHTML = ''; // Limpa o container

    courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.setAttribute('data-course-id', course.id);
        
        card.innerHTML = `
            <h3>${course.nome}</h3>
            <p>Alunos: ${course.total_alunos || 0}</p>
            <p>Status: ${course.status || 'Ativo'}</p>
        `;

        card.addEventListener('click', () => handleCardSelection(course.id));
        container.appendChild(card);
    });
}

// Inicialização quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada, iniciando...');
    loadAndDisplayCourses();
});