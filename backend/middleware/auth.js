const User = require('../models/User');

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Acesso negado. Faça login para continuar.'
        });
    }
    next();
};

const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Acesso negado. Faça login para continuar.'
                });
            }

            const user = await User.findById(req.session.user.id_usuario);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não encontrado.'
                });
            }

            const hasPermission = await user.hasPermission(permission);
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado. Você não tem permissão para esta ação.'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Erro no middleware de permissão:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor.'
            });
        }
    };
};


const canRegisterUserType = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Acesso negado. Faça login para continuar.'
            });
        }

        const user = await User.findById(req.session.user.id_usuario);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado.'
            });
        }

        const { tipo_usuario } = req.body;
        const registerableTypes = await User.getRegisterableUserTypes(user.tipo_usuario);
        
        if (!registerableTypes.includes(tipo_usuario)) {
            return res.status(403).json({
                success: false,
                message: `Você não tem permissão para cadastrar usuários do tipo ${tipo_usuario}.`
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Erro no middleware de cadastro:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
};

const requireUserType = (userTypes) => {
    return async (req, res, next) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Acesso negado. Faça login para continuar.'
                });
            }

            const user = await User.findById(req.session.user.id_usuario);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não encontrado.'
                });
            }

            const allowedTypes = Array.isArray(userTypes) ? userTypes : [userTypes];
            if (!allowedTypes.includes(user.tipo_usuario)) {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado. Tipo de usuário não autorizado.'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Erro no middleware de tipo de usuário:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor.'
            });
        }
    };
};

const requireHierarchy = (requiredLevel) => {
    return async (req, res, next) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Acesso negado. Faça login para continuar.'
                });
            }

            const user = await User.findById(req.session.user.id_usuario);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não encontrado.'
                });
            }

            const userLevel = user.getHierarchyLevel();
            if (userLevel < requiredLevel) {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado. Você não tem o nível hierárquico necessário.'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Erro no middleware de hierarquia:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor.'
            });
        }
    };
};

const addUserToRequest = async (req, res, next) => {
    try {
        if (req.session.user) {
            const user = await User.findById(req.session.user.id_usuario);
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        console.error('Erro ao adicionar usuário à requisição:', error);
        next();
    }
};

module.exports = {
    requireAuth,
    requirePermission,
    canRegisterUserType,
    requireUserType,
    addUserToRequest,
    requireHierarchy
};

