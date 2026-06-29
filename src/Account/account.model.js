'use strict';

import { Schema, model } from "mongoose";

const accountSchema = Schema({
    accountNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    accountType: {
        type: String,
        required: [true, "El tipo de cuenta es obligatorio"],
        enum: {
            values: ["AHORRO", "MONETARIA"],
            message: "Tipo de cuenta no válida"
        }
    },
    currency: {
        type: String,
        enum: ['GTQ', 'USD', 'EUR', 'MXN'],
        default: 'GTQ'
    },
    balance: {
        type: Number,
        default: 0,
        min: [0, "El saldo no puede ser negativo"]
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "El propietario de la cuenta es obligatorio"]
    },
    status: {
        type: Boolean,
        default: false
    },
    bank: {
        type: String,
        enum: ['Banco Kinal', 'Banco Industrial', 'Banrural', 'BAC', 'G&T Continental', 'Promerica'],
        default: 'Banco Kinal'
    },

    requestStatus: {
        type: String,
        enum: {
            values: ['PENDING', 'APPROVED', 'REJECTED'],
            message: "Estado de solicitud no válido"
        },
        default: 'PENDING'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Account', accountSchema);