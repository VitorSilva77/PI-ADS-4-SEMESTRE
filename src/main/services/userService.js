const userRepository = require('../repositories/userRepository');
const roleRepository = require('../repositories/roleRepository');
const auditService = require('./auditService');
const { getCurrentUser } = require('./authService');
const { checkRole, hashPassword } = require('../utils/security');
const { ROLES } = require('../utils/constants');

async function createUser(userData) {
  const { funcional, email, nome, password, roleName } = userData;
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Não autenticado.');
  }

  checkRole(currentUser.role_name, [ROLES.TI]);

  // Valida dados
  if (!funcional || !email || !nome || !password || !roleName) {
    throw new Error('Todos os campos (nome, email, senha, tipo) são obrigatórios.');
  }

  //Verifica se usuário já existe
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error('Este e-mail (funcional) já está em uso.');
  }

  const existingUserFuncional = await userRepository.findByFuncional(funcional);
  if (existingUserFuncional) {
    throw new Error('Este funcional já está em uso.');
  }
  
  // Verifica se o tipo de usuário é válido
  const role = await roleRepository.findByName(roleName);
  if (!role) {
    throw new Error(`O tipo de usuário '${roleName}' é inválido.`);
  }

  // Gera hash da senha
  const password_hash = await hashPassword(password);

  //Salva no banco
  const dbData = {
    funcional,
    nome,
    email,
    password_hash,
    role_id: role.id,
    is_active: true
  };
  const newUser = await userRepository.create(dbData);

  //Log auditoria
  await auditService.log(currentUser.id, 'CREATE_USER', 'usuarios', newUser.id, { email: newUser.email, role: roleName });
  
  //Retorna usuário (sem o hash)
  delete newUser.password_hash;
  return newUser;
}

async function getAllUsers() {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Não autenticado.');
  checkRole(currentUser.role_name, [ROLES.TI]);

  const users = await userRepository.findAll();

  return users.map(user => {
    delete user.password_hash;
    return user;
  });
}

async function getUserById(id) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Não autenticado.');
  checkRole(currentUser.role_name, [ROLES.TI]);

  const user = await userRepository.findById(id);
  if (!user) throw new Error('Usuário não encontrado.');
  
  delete user.password_hash; 
  return user;
}

async function updateUser(id, userData) {
  const { funcional, email, nome, password, roleName, is_active } = userData;
  
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Não autenticado.');
  checkRole(currentUser.role_name, [ROLES.TI]);

  const existingUser = await userRepository.findById(id);
  if (!existingUser) throw new Error('Usuário não encontrado.');

  const dbData = {
    funcional: funcional || existingUser.funcional,
    nome: nome || existingUser.nome,
    email: email || existingUser.email,
    is_active: is_active,
  };

  // atualiza role
  if (roleName && roleName !== existingUser.role_name) {
    const role = await roleRepository.findByName(roleName);
    if (!role) throw new Error(`O tipo de usuário '${roleName}' é inválido.`);
    dbData.role_id = role.id;
  }

  // atualiza Senha 
  if (password) {
    dbData.password_hash = await hashPassword(password);
  }

  const updatedUser = await userRepository.update(id, dbData);
  await auditService.log(currentUser.id, 'UPDATE_USER', 'usuarios', updatedUser.id, { changes: Object.keys(dbData) });

  delete updatedUser.password_hash;
  return updatedUser;
}

async function deleteUser(id) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Não autenticado.');
  checkRole(currentUser.role_name, [ROLES.TI]);

  if (currentUser.id === id) {
    throw new Error('Não é possível excluir o próprio usuário.');
  }

  const existingUser = await userRepository.findById(id);
  if (!existingUser) throw new Error('Usuário não encontrado.');

  await userRepository.remove(id);
  await auditService.log(currentUser.id, 'DELETE_USER', 'usuarios', id, { email: existingUser.email });

  return { success: true, message: 'Usuário excluído.' };
}

async function getAvailableStudents() {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Não autenticado.');
  checkRole(currentUser.role_name, [ROLES.TI]); 

  return userRepository.findAvailableStudents();
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAvailableStudents
};