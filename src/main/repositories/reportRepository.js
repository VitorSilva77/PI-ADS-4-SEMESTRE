const { Pool } = require('pg');
const { getDb } = require('../database/connection');

async function getCoursePerformance(courseId = null) {
  const query = getDb()('cursos')
    .join('matriculas', 'cursos.id', '=', 'matriculas.curso_id')
    .select(
      'cursos.titulo' 
    )
    .avg('matriculas.nota_final as mediaNota') 
    .where('matriculas.status', 'concluido')   
    .groupBy('cursos.id', 'cursos.titulo')     
    .orderBy('mediaNota', 'desc');
    
  if (courseId) {
    query.where('cursos.id', courseId);
  }

  return await query;
}

async function getEnrollmentStatus(courseId = null) {
  const query = getDb()('matriculas')
    .select('status')
    .count('id as count')
    .whereIn('status', ['concluido', 'cursando'])
    .groupBy('status');

  if (courseId) {
    query.where('curso_id', courseId);
  }

  return await query;
}

async function getGradeDistribution(courseId = null) {
  const query = getDb()('matriculas')
    .select(
      getDb().raw(`
        CASE
          WHEN nota_final BETWEEN 0 AND 1.99 THEN '0 - 1.9'
          WHEN nota_final BETWEEN 2 AND 3.99 THEN '2 - 3.9'
          WHEN nota_final BETWEEN 4 AND 5.99 THEN '4 - 5.9'
          WHEN nota_final BETWEEN 6 AND 7.99 THEN '6 - 7.9'
          WHEN nota_final >= 8 THEN '8 - 10'
          ELSE NULL
        END AS faixa_nota
      `)
    )
    .count('id as quantidade')
    .where('status', 'concluido') 
    .whereNotNull('nota_final')  
    .groupBy('faixa_nota')
    .orderBy('faixa_nota', 'asc'); 

  if (courseId) {
    query.where('curso_id', courseId);
  }

  return await query;
}

/* 
  query usada no knex:
  WITH medias_por_curso AS (
            SELECT 
                curso_id,
                AVG(nota_final) AS media_curso
            FROM pro_futuro_schema.matriculas
            WHERE status = 'concluido'
            GROUP BY curso_id
        )
        SELECT 
            c.titulo,
            c.descricao,
            c.carga_horaria,
            c.professor_id,
            m.media_curso
        FROM pro_futuro_schema.cursos AS c
        INNER JOIN medias_por_curso AS m 
        ON c.id = m.curso_id
        ORDER BY c.titulo;
*/

const getCourseAverages = async () => {
  try {
    const mediasPorCurso = getDb()('matriculas') //cria a subconsulta/CTE que estavamos usando na query anterior
      .select('curso_id')
      .avg('nota_final as media_curso')
      .where('status', 'concluido') // apenas de alunos que concluíram
      .whereNotNull('nota_final') // ignora notas null
      .groupBy('curso_id')
      .as('m'); 

    const results = await getDb()('cursos as c') 
      .join(mediasPorCurso, 'c.id', '=', 'm.curso_id') 
      .leftJoin('usuarios as u', 'c.professor_id', '=', 'u.id') 
      .select(
        'c.id',
        'c.titulo',
        'c.descricao',
        'c.carga_horaria',
        'u.nome as professor_nome', 
        'm.media_curso' 
      )
      .orderBy('c.titulo', 'asc');

    return results;

  } catch (error) {
    console.error('Erro ao buscar médias dos cursos:', error);
    throw new Error('Falha ao gerar relatório de médias.');
  }
}

module.exports = {
  getCoursePerformance,
  getEnrollmentStatus,
  getGradeDistribution,
  getCourseAverages
};