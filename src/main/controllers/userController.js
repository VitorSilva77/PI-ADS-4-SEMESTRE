const userService = require('../services/userService');

async function handleCreateUser(event, userData) {
  try {
    const newUser = await userService.createUser(userData);
    return { success: true, data: newUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetAllUsers() {
  try {
    const users = await userService.getAllUsers();
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetUserById(event, id) {
  try {
    const user = await userService.getUserById(id);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleUpdateUser(event, id, userData) {
  try {
    const updatedUser = await userService.updateUser(id, userData);
    return { success: true, data: updatedUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleDeleteUser(event, id) {
  try {
    const result = await userService.deleteUser(id);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetAllProfessors() {
  try {
    const professors = await userService.getAllProfessors();
    return { success: true, data: professors };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  handleCreateUser,
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateUser,
  handleDeleteUser,
  handleGetAllProfessors
};