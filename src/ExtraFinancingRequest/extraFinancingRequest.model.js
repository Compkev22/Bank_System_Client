'use strict';
import { Schema, model } from 'mongoose';

const extraFinancingRequestSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creditCard: {
        type: Schema.Types.ObjectId,
        ref: 'CreditCard',
        required: [true, 'Debe estar vinculada a una tarjeta de crédito']
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true
    },
    totalAmount: {
        type: Number,
        required: [true, 'El monto total es obligatorio'],
        min: [1, 'El monto debe ser mayor a 0']
    },
    installments: {
        type: Number,
        required: [true, 'El número de cuotas es obligatorio'],
        enum: [12, 24, 36, 48]
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
        default: 'PENDING'
    },
    rejectionReason: {
        type: String,
        default: null
    },
    processedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Referencia al ExtraFinancing creado al aprobar
    extraFinancing: {
        type: Schema.Types.ObjectId,
        ref: 'ExtraFinancing',
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('ExtraFinancingRequest', extraFinancingRequestSchema);