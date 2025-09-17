const { executeQuery } = require('../config/database');

class Ticket {
    constructor(data) {
        this.id_chamado = data.id_chamado;
        this.titulo = data.titulo;
        this.descricao = data.descricao;
        this.status = data.status;
        this.id_usuario_abertura = data.id_usuario_abertura;
        this.id_usuario_responsavel_ti = data.id_usuario_responsavel_ti;
        this.usuario_abertura = data.usuario_abertura;
        this.usuario_responsavel_ti = data.usuario_responsavel_ti;
        this.data_criacao = data.data_criacao;
        this.data_atualizacao = data.data_atualizacao;
    }

    // Buscar todos os chamados
    static async findAll() {
        try {
            const query = `
                SELECT 
                    ch.*,
                    ua.nome as usuario_abertura,
                    uti.nome as usuario_responsavel_ti
                FROM chamados ch
                JOIN usuarios ua ON ch.id_usuario_abertura = ua.id_usuario
                LEFT JOIN usuarios uti ON ch.id_usuario_responsavel_ti = uti.id_usuario
                ORDER BY ch.id_chamado DESC
            `;
            
            const result = await executeQuery(query);
            return result.map(ticketData => new Ticket(ticketData));
        } catch (error) {
            console.error('Erro ao buscar chamados:', error);
            throw error;
        }
    }

    // Buscar chamados por usuário
    static async findByUser(userId) {
        try {
            const query = `
                SELECT 
                    ch.*,
                    ua.nome as usuario_abertura,
                    uti.nome as usuario_responsavel_ti
                FROM chamados ch
                JOIN usuarios ua ON ch.id_usuario_abertura = ua.id_usuario
                LEFT JOIN usuarios uti ON ch.id_usuario_responsavel_ti = uti.id_usuario
                WHERE ch.id_usuario_abertura = ?
                ORDER BY ch.id_chamado DESC
            `;
            
            const result = await executeQuery(query, [userId]);
            return result.map(ticketData => new Ticket(ticketData));
        } catch (error) {
            console.error('Erro ao buscar chamados por usuário:', error);
            throw error;
        }
    }

    // Buscar chamados abertos (para TI)
    static async findOpen() {
        try {
            const query = `
                SELECT 
                    ch.*,
                    ua.nome as usuario_abertura,
                    uti.nome as usuario_responsavel_ti
                FROM chamados ch
                JOIN usuarios ua ON ch.id_usuario_abertura = ua.id_usuario
                LEFT JOIN usuarios uti ON ch.id_usuario_responsavel_ti = uti.id_usuario
                WHERE ch.status IN ('Aberto', 'Em Andamento')
                ORDER BY ch.id_chamado DESC
            `;
            
            const result = await executeQuery(query);
            return result.map(ticketData => new Ticket(ticketData));
        } catch (error) {
            console.error('Erro ao buscar chamados abertos:', error);
            throw error;
        }
    }

    // Buscar chamado por ID
    static async findById(id) {
        try {
            const query = `
                SELECT 
                    ch.*,
                    ua.nome as usuario_abertura,
                    uti.nome as usuario_responsavel_ti
                FROM chamados ch
                JOIN usuarios ua ON ch.id_usuario_abertura = ua.id_usuario
                LEFT JOIN usuarios uti ON ch.id_usuario_responsavel_ti = uti.id_usuario
                WHERE ch.id_chamado = ?
            `;
            
            const result = await executeQuery(query, [id]);
            
            if (result.length > 0) {
                return new Ticket(result[0]);
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar chamado por ID:', error);
            throw error;
        }
    }

    // Criar novo chamado
    static async create(ticketData) {
        try {
            const query = `
                INSERT INTO chamados (titulo, descricao, status, id_usuario_abertura) 
                VALUES (?, ?, ?, ?)
            `;
            
            const result = await executeQuery(query, [
                ticketData.titulo,
                ticketData.descricao,
                ticketData.status || 'Aberto',
                ticketData.id_usuario_abertura
            ]);

            return await Ticket.findById(result.insertId);
        } catch (error) {
            console.error('Erro ao criar chamado:', error);
            throw error;
        }
    }

    // Atualizar status do chamado
    async updateStatus(newStatus, responsavelTiId = null) {
        try {
            let query, params;
            
            if (responsavelTiId) {
                query = `
                    UPDATE chamados 
                    SET status = ?, id_usuario_responsavel_ti = ?
                    WHERE id_chamado = ?
                `;
                params = [newStatus, responsavelTiId, this.id_chamado];
            } else {
                query = `
                    UPDATE chamados 
                    SET status = ?
                    WHERE id_chamado = ?
                `;
                params = [newStatus, this.id_chamado];
            }
            
            await executeQuery(query, params);
            return await Ticket.findById(this.id_chamado);
        } catch (error) {
            console.error('Erro ao atualizar status do chamado:', error);
            throw error;
        }
    }

    // Resolver chamado (apenas TI)
    async resolve(responsavelTiId) {
        try {
            return await this.updateStatus('Resolvido', responsavelTiId);
        } catch (error) {
            console.error('Erro ao resolver chamado:', error);
            throw error;
        }
    }

    // Atribuir chamado para TI
    async assignToTI(responsavelTiId) {
        try {
            return await this.updateStatus('Em Andamento', responsavelTiId);
        } catch (error) {
            console.error('Erro ao atribuir chamado:', error);
            throw error;
        }
    }

    // Obter estatísticas de chamados
    static async getStatistics() {
        try {
            const query = `
                SELECT 
                    status,
                    COUNT(*) as total
                FROM chamados 
                GROUP BY status
            `;
            
            const result = await executeQuery(query);
            
            const stats = {
                total: 0,
                abertos: 0,
                em_andamento: 0,
                resolvidos: 0
            };

            result.forEach(row => {
                stats.total += row.total;
                switch (row.status) {
                    case 'Aberto':
                        stats.abertos = row.total;
                        break;
                    case 'Em Andamento':
                        stats.em_andamento = row.total;
                        break;
                    case 'Resolvido':
                        stats.resolvidos = row.total;
                        break;
                }
            });

            return stats;
        } catch (error) {
            console.error('Erro ao obter estatísticas de chamados:', error);
            throw error;
        }
    }
}

module.exports = Ticket;

