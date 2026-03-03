'use strict';

import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        maxLength: [100, 'El nombre no puede exceder 100 caracteres'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    type: {
        type: String,
        enum: ['PRODUCTO', 'SERVICIO'],
        required: [true, 'Debe especificar si es un PRODUCTO o un SERVICIO']
    },
    stock: {
        type: Number,
        default: 0 // Si es un servicio, puede quedarse en 0. Si es un producto físico, el admin le pondrá cantidad.
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Product', productSchema);