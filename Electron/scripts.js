google.charts.load('current', { packages: ['corechart'] });

google.charts.setOnLoadCallback(drawCharts);

function drawCharts() {
  
  var dataLinha = google.visualization.arrayToDataTable([
    ['Mês', 'Vendas'],
    ['Jan',  1000],
    ['Fev',  1170],
    ['Mar',  660],
    ['Abr',  1030],
    ['Mai',  1200],
    ['Jun',  900]
  ]);

  var optionsLinha = {
    title: 'Vendas Mensais',
    curveType: 'function',
    legend: { position: 'bottom' },
    chartArea: { width: '80%', height: '70%' }
  };

  var chartLinha = new google.visualization.LineChart(
    document.getElementById('chart-box')
  );
  chartLinha.draw(dataLinha, optionsLinha);

  // Gráfico de BARRAS 
  var dataBarras = google.visualization.arrayToDataTable([
    ['Categoria', 'Quantidade'],
    ['Cursos', 12],
    ['Alunos', 30],
    ['Instrutores', 8]
  ]);

  var optionsBarras = {
    title: 'Distribuição de Usuários e Cursos',
    legend: { position: 'none' },
    colors: ['#ff9800'],
    chartArea: { width: '80%', height: '70%' }
  };

  var chartBarras = new google.visualization.ColumnChart(
    document.getElementById('chart-box1')
  );
  chartBarras.draw(dataBarras, optionsBarras);
}
