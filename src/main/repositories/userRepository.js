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

module.exports = {
  findByEmail,
  findByFuncional,
  findById,
  findAll,
  create,
  update,
  remove
};