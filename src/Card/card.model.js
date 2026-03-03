'use strict';

import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
    cardNumber: { 
        type: String, 
        required: [true, 'El número de tarjeta es obligatorio'],
        unique: true,
        trim: true,
        match: [/^\d{16}$/, 'El número de tarjeta debe tener 16 dígitos']
    },
    holderName: {
        type: String,
        required: [true, 'El nombre del titular es obligatorio'],
        trim: true,
        uppercase: true
    },
    expirationDate: {
        type: String, // Formato MM/YY
        required: [true, 'La fecha de expiración es obligatoria'],
        trim: true
    },
    cvv: {
        type: String,
        required: [true, 'El CVV es obligatorio'],
        minLength: 3,
        maxLength: 4
    },
    type: {
        type: String,
        enum: ['DEBIT', 'CREDIT'],
        default: 'DEBIT'
    },
    brand: {
        type: String,
        enum: ['VISA', 'MASTERCARD', 'AMEX'],
        required: true
    },
    creditLimit: {
        type: Number,
        default: 0,
        min: [0, 'El límite de crédito no puede ser negativo']
    },
    consumedAmount: {
        type: Number,
        default: 0,
        min: [0, 'El monto consumido no puede ser negativo']
    },
    image: { 
        type: String,
        default: 'cards/default_card' 
    },
    isActive: {
        type: Boolean,
        default: true
    },
    
    isApproved: {
        type: Boolean,
        default: false 
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'La tarjeta debe estar asociada a una cuenta bancaria']
    },

}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('Card', cardSchema);