const { getDb } = require('../database/connection');

//Busca uma matrícula específica por aluno e curso, independente do status
//regra: não matricular no mesmo curso duas vezes
async function findByStudentAndCourse(aluno_id, curso_id) {
  return getDb()('matriculas')
    .where({
      aluno_id: aluno_id,
      curso_id: curso_id
    })
    .first();
}

//Busca matrículas ativas para um aluno.
//regra: não pode estar cursando outro curso

async function findActiveByStudent(aluno_id) {
  return getDb()('matriculas')
    .where({
      aluno_id: aluno_id,
      status: 'cursando'
    })
    .first();
}


//Cria uma nova matrícula
async function create(aluno_id, curso_id) {
  const [newId] = await getDb()('matriculas').insert({
    aluno_id: aluno_id,
    curso_id: curso_id,
    status: 'cursando',
    data_matricula: getDb().fn.now() 
  });
  
  return getDb()('matriculas').where('id', newId).first();
}


async function findById(id) {
  return getDb()('matriculas').where('id', id).first();
}


async function findByCourse(curso_id) {
  return getDb()('matriculas as m')
    .join('usuarios as u', 'm.aluno_id', '=', 'u.id')
    .where('m.curso_id', curso_id)
    .select(
      'm.id', 
      'm.aluno_id',
      'u.nome as aluno_nome',
      'm.status',
      'm.nota_final'
    )
    .orderBy('u.nome', 'asc');
}


async function update(id, data) {
  await getDb()('matriculas').where('id', id).update(data);
  return findById(id);
}

module.exports = {
  findByStudentAndCourse,
  findActiveByStudent,
  create,
  findById,
  findByCourse,
  update
};