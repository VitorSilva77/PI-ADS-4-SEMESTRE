const mysql = require("mysql2/promise");
const ExcelJS = require("exceljs");

const cursoId = process.argv[2];

if (!cursoId) {
  console.error("Por favor, informe o ID do curso. Ex: node relatorioCurso.js 2");
  process.exit(1);
}

async function gerarRelatorioCursoEspecifico(cursoId) {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "14022006",
      database: "pro_futuro_schema",
    });

    const [rows] = await connection.execute(`
      SELECT 
          c.id AS id_curso,
          c.titulo AS curso,
          u.nome AS professor,
          COUNT(m.id) AS total_alunos
      FROM 
          cursos c
      LEFT JOIN 
          usuarios u ON c.professor_id = u.id
      LEFT JOIN 
          matriculas m ON m.curso_id = c.id
      WHERE 
          c.id = ?
      GROUP BY 
          c.id, c.titulo, u.nome;
    `, [cursoId]);

    if (rows.length === 0) {
      console.log(`Nenhum curso encontrado com o ID ${cursoId}`);
      await connection.end();
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Relatório do Curso");

    sheet.columns = [
      { header: "ID do Curso", key: "id_curso", width: 15 },
      { header: "Curso", key: "curso", width: 30 },
      { header: "Professor", key: "professor", width: 25 },
      { header: "Total de Alunos", key: "total_alunos", width: 18 },
    ];

    rows.forEach((row) => sheet.addRow(row));

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center" };

    const filePath = `./relatorio_curso_${cursoId}.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    console.log(`Relatório gerado: ${filePath}`);

    await connection.end();
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
  }
}

gerarRelatorioCursoEspecifico(cursoId);
