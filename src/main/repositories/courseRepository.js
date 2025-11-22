const { getDb } = require('../database/connection');

async function create(courseData) {
  const [newCourseId] = await getDb()('cursos').insert(courseData);
  
  return getDb()('cursos').where('id', newCourseId).first();
}

async function findAll() {
  return getDb()('cursos').select('*');
}
  
async function findByProfessorId(professorId) {
  return getDb()('cursos')
    .where('professor_id', professorId)
    .select('*');
}

async function update(id, courseData) {
  return getDb()('cursos').where('id', id).update(courseData);
}

async function findById(id) {
  return getDb()('cursos').where('id', id).first();
}

module.exports = {
  findById,
  create,
  findAll,
  findByProfessorId,
  update
};
