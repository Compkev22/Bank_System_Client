'use strict';

import { Schema, model } from 'mongoose';

const extraFinancingSchema = new Schema({
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria (ej. Extra-financiamiento Efectivo)'],
        trim: true
    },
    creditCard: {
        type: Schema.Types.ObjectId,
        ref: 'CreditCard',
        required: [true, 'Debe estar vinculado a una tarjeta de crédito']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalAmount: {
        type: Number,
        required: [true, 'El monto total es obligatorio'],
        min: [0, 'El monto no puede ser negativo']
    },
    remainingBalance: {
        type: Number,
        required: true
    },
    installments: {
        type: Number,
        required: [true, 'El número de cuotas es obligatorio'],
        enum: [12, 24, 36, 48] 
    },
    monthlyPayment: {
        type: Number,
        required: true
    },
    interestRate: {
        type: Number,
        default: 1.5 
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'PAID', 'OVERDUE'],
        default: 'ACTIVE'
    }
}, {
    timestamps: true,
    versionKey: false
});

extraFinancingSchema.pre('validate', function() {
    if (this.isNew) {
        this.remainingBalance = this.totalAmount;
        const interest = this.totalAmount * ((this.interestRate ?? 1.5) / 100);
        this.monthlyPayment = parseFloat(((this.totalAmount / this.installments) + interest).toFixed(2));
    }
});

export default model('ExtraFinancing', extraFinancingSchema);