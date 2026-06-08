'use strict';

import Product from './product.model.js';

/**
 * Ver catálogo completo de productos/servicios (Solo activos)
 * GET /api/client/products
 */
export const getActiveProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query;
        
        // El cliente SIEMPRE ve solo lo activo
        const filter = { isActive: true };
        if (type) filter.type = type.toUpperCase(); 

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

/**
 * Ver detalle de un producto en específico
 * GET /api/client/products/:id
 */
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validamos que exista y que además esté activo
        const product = await Product.findOne({ _id: id, isActive: true });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado o no disponible actualmente' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el producto', error: error.message });
    }
};