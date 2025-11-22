const { getDb } = require('../database/connection');

async function findByEmail(email) {
  return getDb()('usuarios')
    .join('roles', 'usuarios.role_id', '=', 'roles.id')
    .where('usuarios.email', email)
    .select(
      'usuarios.id',
      'usuarios.nome',
      'usuarios.email',
      'usuarios.password_hash',
      'usuarios.is_active',
      'roles.nome as role_name' 
    )
    .first(); 
}

async function findByFuncional(funcional) {
  return getDb()('usuarios')
    .join('roles', 'usuarios.role_id', '=', 'roles.id')
    .where('usuarios.funcional', funcional) 
    .select(
      'usuarios.id',
      'usuarios.nome',
      'usuarios.email',
      'usuarios.password_hash',
      'usuarios.is_active',
      'roles.nome as role_name'
    )
    .first();
}

async function findById(id) {
  return getDb()('usuarios')
    .join('roles', 'usuarios.role_id', '=', 'roles.id')
    .where('usuarios.id', id)
    .select(
      'usuarios.id',
      'usuarios.funcional',
      'usuarios.nome',
      'usuarios.email',
      'usuarios.role_id',
      'usuarios.is_active',
      'roles.nome as role_name'
    )
    .first();
}

async function findAll() {
  return getDb()('usuarios')
    .join('roles', 'usuarios.role_id', '=', 'roles.id')
    .select(
      'usuarios.id',
      'usuarios.funcional',
      'usuarios.nome',
      'usuarios.email',
      'usuarios.is_active',
      'roles.nome as role_name'
    )
    .orderBy('usuarios.nome', 'asc');
}

async function create(userData) {
  const [newUserId] = await getDb()('usuarios').insert(userData);
  return getDb()('usuarios').where('id', newUserId).first();
}

async function update(id, userData) {
  await getDb()('usuarios').where('id', id).update(userData);
  return findById(id); 
}

async function remove(id) {
  return getDb()('usuarios').where('id', id).delete();
}

async function findAllProfessors() {
  return getDb()('usuarios')
    .where('role_id', 3) // 3 é o ID da role 'Professor'
    .select('id', 'nome')
    .orderBy('nome', 'asc');
}

async function findAvailableStudents() {
  const role = await getDb()('roles').where('nome', 'Aluno').first();
  if (!role) {
    throw new Error("Role 'Aluno' não encontrada.");
  }
  const busyStudentIds = await getDb()('matriculas')
  .select('aluno_id')
  .where('status', 'cursando');

  return getDb()('usuarios')
  .select('id', 'nome', 'funcional')
  .where('role_id', role.id)
  .whereNotIn('id', busyStudentIds.map(student => student.aluno_id))
  .orderBy('nome', 'asc');
}

module.exports = {
  findByEmail,
  findByFuncional,
  findById,
  findAll,
  findAllProfessors,
  create,
  update,
  remove,
  findAvailableStudents
};