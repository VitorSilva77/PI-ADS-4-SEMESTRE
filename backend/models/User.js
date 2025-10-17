const { executeQuery } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    constructor(data) {
        this.id_usuario = data.id_usuario;
        this.funcional = data.funcional;
        this.senha = data.senha;
        this.nome = data.nome;
        this.id_tipo_usuario = data.id_tipo_usuario;
        this.tipo_usuario = data.tipo_usuario;
    }

    static async findByFuncional(funcional) {
        try {
            const query = `
                SELECT u.*, tu.nome_tipo as tipo_usuario 
                FROM usuarios u 
                JOIN tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario 
                WHERE u.funcional = ?
            `;
            const result = await executeQuery(query, [funcional]);
            
            if (result.length > 0) {
                return new User(result[0]);
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar usuário por funcional:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const query = `
                SELECT u.*, tu.nome_tipo as tipo_usuario 
                FROM usuarios u 
                JOIN tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario 
                WHERE u.id_usuario = ?
            `;
            const result = await executeQuery(query, [id]);
            
            if (result.length > 0) {
                return new User(result[0]);
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }

    async verifyPassword(password) {
        try {
            return await bcrypt.compare(password, this.senha);
        } catch (error) {
            console.error('Erro ao verificar senha:', error);
            return false;
        }
    }

    static async create(userData) {
        try {

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.senha, saltRounds);

            const query = `
                INSERT INTO usuarios (funcional, senha, nome, id_tipo_usuario) 
                VALUES (?, ?, ?, ?)
            `;
            
            const result = await executeQuery(query, [
                userData.funcional,
                hashedPassword,
                userData.nome,
                userData.id_tipo_usuario
            ]);

            // Buscar o usuário criado
            return await User.findById(result.insertId);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }

    async getPermissions() {
        try {
            const query = `
                SELECT p.nome_permissao 
                FROM permissoes p
                JOIN tipo_usuario_permissoes tup ON p.id_permissao = tup.id_permissao
                WHERE tup.id_tipo_usuario = ?
            `;
            
            const result = await executeQuery(query, [this.id_tipo_usuario]);
            return result.map(row => row.nome_permissao);
        } catch (error) {
            console.error('Erro ao obter permissões:', error);
            throw error;
        }
    }

    async hasPermission(permission) {
        try {
            const permissions = await this.getPermissions();
            return permissions.includes(permission);
        } catch (error) {
            console.error('Erro ao verificar permissão:', error);
            return false;
        }
    }

    getHierarchyLevel() {
        const hierarchy = {
            'Gerencia': 4,
            'TI': 3,
            'RH': 2,
            'Professor': 1
        };
        return hierarchy[this.tipo_usuario] || 0;
    }

    toJSON() {
        const { senha, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

module.exports = User;

