const DataService = require('../services/dataService');

const DataController = {
    async create(tableName, data, userId) {
        try {
            return await DataService.create(tableName, data, userId);
        } catch (error) {
            console.error(`Erro ao criar registro na tabela ${tableName}:`, error.message);
            throw new Error(`Falha na criação: ${error.message}`);
        }
    },

    async read(tableName, id) {
        try {
            return await DataService.read(tableName, id);
        } catch (error) {
            console.error(`Erro ao ler registro na tabela ${tableName}:`, error.message);
            throw new Error(`Falha na leitura: ${error.message}`);
        }
    },

    async update(tableName, id, data, userId) {
        try {
            return await DataService.update(tableName, id, data, userId);
        } catch (error) {
            console.error(`Erro ao atualizar registro na tabela ${tableName}:`, error.message);
            throw new Error(`Falha na atualização: ${error.message}`);
        }
    },

    async delete(tableName, id, userId) {
        try {
            return await DataService.delete(tableName, id, userId);
        } catch (error) {
            console.error(`Erro ao deletar registro na tabela ${tableName}:`, error.message);
            throw new Error(`Falha na exclusão: ${error.message}`);
        }
    },

    async list(tableName, options = {}) {
        try {
            return await DataService.list(tableName, options);
        } catch (error) {
            console.error(`Erro ao listar registros na tabela ${tableName}:`, error.message);
            throw new Error(`Falha na listagem: ${error.message}`);
        }
    }
};

module.exports = DataController;