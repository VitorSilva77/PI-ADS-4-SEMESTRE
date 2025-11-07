document.addEventListener('DOMContentLoaded', () => {
    const storedUser = localStorage.getItem('profuturo_currentUser');
    if (!storedUser) {
        window.location.href = 'index.html';
        return;
    }

    const reportButtons = document.querySelectorAll('.report-options button');
    const tableContainer = document.getElementById('report-table-container');
    
    let reportData = [];
    let currentReportType = '';
    let currentExportFileName = '';
    let currentExcelMapper = () => ({});

    const btnDownload = document.getElementById('btnDownloadReport');
    const reportActions = document.getElementById('report-actions');

    reportButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const btn = event.target;
            currentReportType = btn.dataset.reportType;
            
            reportButtons.forEach(b => b.disabled = true);
            btn.textContent = 'Gerando...';
            tableContainer.innerHTML = '<p>Gerando relatório, por favor aguarde...</p>';
            
            try {
                let responseAwait;
                let reportTitle = '';
                let exportFileName = '';
                let tableHeaders = [];
                let tableRowsMapper = () => '';
                let excelMapper = () => ({});

                switch (currentReportType) {
                    case 'detailedEnrollments':
                        responseAwait = await window.api.getDetailedEnrollmentsReport();
                        reportTitle = 'Relatório de Matrículas Detalhadas';
                        exportFileName = 'Matriculas_Detalhadas';
                        tableHeaders = ['Funcional', 'Nome', 'Email', 'Curso', 'Data Matrícula', 'Status', 'Nota Final'];
                        tableRowsMapper = (row) => `
                            <td>${row.funcional}</td>
                            <td>${row.nome}</td>
                            <td>${row.email}</td>
                            <td>${row.nome_curso}</td>
                            <td>${row.data_matricula}</td>
                            <td>${row.status}</td>
                            <td>${row.nota !== null ? parseFloat(row.nota).toFixed(2) : 'N/A'}</td>
                        `;
                        excelMapper = (row) => ({
                            'Funcional': row.funcional,
                            'Nome': row.nome,
                            'Email': row.email,
                            'Curso': row.nome_curso,
                            'Data Matrícula': row.data_matricula,
                            'Status': row.status,
                            'Nota Final': row.nota !== null ? parseFloat(row.nota).toFixed(2) : 'N/A'
                        });
                        break;
                    case 'courseAverages':
                        responseAwait = await window.api.getCourseAveragesReport();
                        reportTitle = 'Relatório de Médias por Curso';
                        exportFileName = 'Medias_por_Curso';
                        tableHeaders = ['ID', 'Nome do Curso', 'Professor', 'CH', 'Média de Notas'];
                        tableRowsMapper = (row) => `
                            <td>${row.id}</td>
                            <td>${row.titulo}</td>
                            <td>${row.professor_nome}</td>
                            <td>${row.carga_horaria}</td>
                            <td>${parseFloat(row.media_curso).toFixed(2)}</td>
                        `;
                        excelMapper = (row) => ({
                            'ID': row.id,
                            'Nome do Curso': row.titulo,
                            'Professor': row.professor_nome,
                            'Carga Horária': row.carga_horaria,
                            'Média de Notas': parseFloat(row.media_curso).toFixed(2),
                            'Descrição': row.descricao
                        });
                        break;
                    case 'totalStudents':
                        responseAwait = await window.api.getTotalStudentsPerCourseReport();
                        reportTitle = 'Relatório de Total de Alunos por Curso';
                        exportFileName = 'Total_Alunos_por_Curso';
                        tableHeaders = ['Nome do Curso', 'Total de Alunos'];
                        tableRowsMapper = (row) => `
                            <td>${row.titulo}</td>
                            <td>${row.total_alunos}</td>
                        `;
                        excelMapper = (row) => ({
                            'Nome do Curso': row.titulo,
                            'Total de Alunos': row.total_alunos
                        });
                        break;

                    case 'studentsPerProfessor':
                        responseAwait = await window.api.getStudentsPerProfessorReport();
                        reportTitle = 'Relatório de Alunos por Professor';
                        exportFileName = 'Alunos_por_Professor';
                        tableHeaders = ['Nome do Professor', 'Total de Alunos', 'Cursos', 'Alunos Matriculados'];
                        tableRowsMapper = (row) => `
                            <td>${row.professor_nome}</td>
                            <td>${row.total_alunos}</td>
                            <td>${row.cursos}</td>
                            <td>${row.alunos}</td>
                        `;
                        excelMapper = (row) => ({
                            'Nome do Professor': row.professor_nome,
                            'Total de Alunos': row.total_alunos,
                            'Cursos': row.cursos,
                            'Alunos Matriculados': row.alunos
                        });
                        break;
                    default:
                        throw new Error('Tipo de relatório desconhecido.');
                }

                if (responseAwait.success && responseAwait.data) {
                    reportData = responseAwait.data;
                    
                    if(reportData.length === 0) {
                        tableContainer.innerHTML = '<p>Nenhum dado encontrado para o relatório.</p>';
                        reportActions.style.display = 'none';
                    }   else {
                        renderHtmlTable(reportData, reportTitle, tableHeaders, tableRowsMapper); 
                        currentExportFileName = exportFileName;
                        currentExcelMapper = excelMapper;
                        reportActions.style.display = 'block';
                    }  
                } else {
                    tableContainer.innerHTML = `<p>Erro ao gerar relatório: ${responseAwait.error}</p>`;
                }
            } catch (err) {
                console.error('Erro ao gerar relatório:', err);
                tableContainer.innerHTML = `<p>Erro ao gerar relatório: ${err.message}</p>`;
            } finally {
                reportButtons.forEach(b => b.disabled = false);
                btn.textContent = btn.dataset.reportType === 'courseAverages' ? 'Média de Cursos' : 
                                  btn.dataset.reportType === 'totalStudents' ? 'Total de Alunos por Curso' :
                                  btn.dataset.reportType === 'detailedEnrollments' ? 'Matrículas Detalhadas' :
                                  'Alunos por Professor';
            }
        });
    });
    
    function renderHtmlTable(data, title, headers, rowMapper) {
        const table= document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    ${headers.map(header => `<th>${header}</th>`).join('')}
                </tr>  
            </thead>
            <tbody>
                ${data.map(row => ` 
                    <tr>
                        ${rowMapper(row)}
                    </tr>
                `).join('')}
            </tbody>
        `;
        tableContainer.innerHTML = `<h2>${title}</h2>`;
        tableContainer.appendChild(table);
    }
    function exportToXlsx(data, sheetName, excelMapper) {
        const dataToExport = data.map(excelMapper);
        
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        const today = new Date().toISOString().slice(0,10);
        XLSX.writeFile(wb, `Relatorio_${sheetName}_${today}.xlsx`);
    }

    btnDownload.addEventListener('click', () => {
        if (reportData.length > 0) {
            exportToXlsx(reportData, currentExportFileName, currentExcelMapper);
        } else {
            alert('Nenhum relatório para baixar.');
        }
    });

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
});

