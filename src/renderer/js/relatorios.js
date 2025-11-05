document.addEventListener('DOMContentLoaded', () => {
    const storedUser = localStorage.getItem('profuturo_currentUser');
    if (!storedUser) {
        window.location.href = 'index.html';
        return;
    }

    const btnGenerate = document.getElementById('btnGenerateReport');
    const tableContainer = document.getElementById('report-table-container');
    
    let reportData = [];

    btnGenerate.addEventListener('click', async () => {
        btnGenerate.disabled = true;
        btnGenerate.textContent = 'Gerando...';
        tableContainer.innerHTML = '<p>Gerando relatório, por favor aguarde...</p>';    
        try {
            const responseAwait = window.api.getCourseAveragesReport();
            if (responseAwait.success && responseAwait.data) {
                reportData = responseAwait.data;
                
                if(reportData.length === 0) {
                    tableContainer.innerHTML = '<p>Nenhum dado encontrado para o relatório.</p>';
                }   else {
                    renderHtmlTable(reportData); 
                    exportToXlsx(reportData);
                }  
            } else {
                tableContainer.innerHTML = `<p>Erro ao gerar relatório: ${responseAwait.error}</p>`;
            }
        } catch (err) {
            console.error('Erro ao gerar relatório:', err);
            tableContainer.innerHTML = `<p>Erro ao gerar relatório: ${err.message}</p>`;
        } finally {
            btnGenerate.disabled = false;
            btnGenerate.textContent = 'Gerar Relatório de Médias por Curso';
        }
    });
    
    function renderHtmlTable(data) {
        const table= document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>id</th>
                    <th>Nome do Curso</th>
                    <th>Professor</th>
                    <th>CH</th>
                    <th>Média de Notas </th>
                </tr>  
            </thead>
            <tbody>
                ${data.map(row => ` 
                    <tr>
                        <td>${row.id}</td>
                        <td>${row.titulo}</td>
                        <td>${row.professor_nome}</td>
                        <td>${row.carga_horaria}</td>
                        <td>${parseFloat(row.media_curso).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        tableContainer.innerHTML = '<h2>Pré-Visualização de Relatório</h2>';
        tableContainer.appendChild(table);
    }
    function exportToXlsx(data) {
        const dataToExport = data.map(row => ({
            'ID': row.id,
            'Nome do Curso': row.titulo,
            'Professor': row.professor_nome,
            'Carga Horária': row.carga_horaria,
            'Média de Notas': parseFloat(row.media_curso).toFixed(2),
            'Descrição': row.descricao
        }));
        
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Médias por Curso');

        const today = new Date().toISOString().slice(0,10);
        XLSX.writeFile(wb, `Relatorio_Medias_por_Curso_${today}.xlsx`);
    }

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

