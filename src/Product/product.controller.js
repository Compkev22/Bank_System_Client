'use strict';

import Product from './product.model.js';

// 1. Ver catálogo completo (Para todos los usuarios)
export const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query;
        
        // Solo mostramos los que están activos
        const filter = { isActive: true };
        if (type) filter.type = type.toUpperCase(); // Por si quieren filtrar solo SERVICIOS o PRODUCTOS

        const products = await Product.find(filter)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            total: products.length,
            data: products,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el catálogo', error: error.message });
    }
};

