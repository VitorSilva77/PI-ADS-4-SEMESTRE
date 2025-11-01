const DataRepository = require('../repositories/dataRepository');
const { logAction } = require('./auditService');

const DataService = {
    async create(tableName, data, userId) {
        if (!data) {
            throw new Error('Dados inválidos para criação.');
        }
        const newRecord = await DataRepository.create(tableName, data);
        await logAction(userId, `CREATE_${tableName.toUpperCase()}`, tableName, newRecord.id, data);
        return newRecord;
    },

    async read(tableName, id) {
        return DataRepository.read(tableName, id);
    },

    async update(tableName, id, data, userId) {
        const affectedRows = await DataRepository.update(tableName, id, data);
        if (affectedRows > 0) {
            await logAction(userId, `UPDATE_${tableName.toUpperCase()}`, tableName, id, data);
        }
        return affectedRows;
    },

    async delete(tableName, id, userId) {
        const affectedRows = await DataRepository.delete(tableName, id);
        if (affectedRows > 0) {
            await logAction(userId, `DELETE_${tableName.toUpperCase()}`, tableName, id, { id });
        }
        return affectedRows;
    },

    async list(tableName, options = {}) {
        return DataRepository.list(tableName, options);
    },

    async count(tableName, options = {}) {
        return DataRepository.count(tableName, options);
    }
};

module.exports = DataService;