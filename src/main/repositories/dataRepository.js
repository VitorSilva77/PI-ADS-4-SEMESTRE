const { getDb } = require('../database/connection');

function applyFiltersAndOrdering(query, options = {}) {
    const { filters, orderBy, orderDirection } = options;

    if (filters && typeof filters === 'object') {
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (value !== undefined && value !== null && value !== '') {
                if (typeof value === 'string' && value.includes('%')) {
                    query.where(key, 'like', value);
                } else {
                    query.where(key, value);
                }
            }
        });
    }

    if (orderBy) {
        const direction = (orderDirection && orderDirection.toLowerCase() === 'desc') ? 'desc' : 'asc';
        query.orderBy(orderBy, direction);
    }

    return query;
}

const DataRepository = {
    async create(tableName, data) {
        const [newId] = await getDb()(tableName).insert(data);
        return getDb()(tableName).where('id', newId).first();
    },

    async read(tableName, id) {
        return getDb()(tableName).where('id', id).first();
    },

    async update(tableName, id, data) {
        return getDb()(tableName).where('id', id).update(data);
    },

    async delete(tableName, id) {
        return getDb()(tableName).where('id', id).del();
    },

    async list(tableName, options = {}) {
        let query = getDb()(tableName);
        query = applyFiltersAndOrdering(query, options);
        return query;
    },

    async findOneBy(tableName, criteria) {
        return getDb()(tableName).where(criteria).first();
    },

    async count(tableName, options = {}) {
        let query = getDb()(tableName).count('* as total');
        query = applyFiltersAndOrdering(query, options);
        const result = await query.first();
        return parseInt(result.total, 10);
    }
};

module.exports = DataRepository;
