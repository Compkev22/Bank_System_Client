'use strict';

import { Schema, model } from 'mongoose';

const creditCardSchema = new Schema({
    cardNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: false
    },
    type: {
        type: String,
        enum: ['CLASSIC', 'GOLD', 'PLATINUM', 'BLACK'],
        default: 'CLASSIC'
    },
    creditLimit: {
        type: Number,
        required: true
    },
    totalDebt: {
        type: Number,
        default: 0
    },
    availableCredit: {
        type: Number,
        required: true
    },
    cutoffDate: {
        type: Number,
        required: true,
        min: 1,
        max: 28
    },
    paymentDeadline: {
        type: Number,
        default: 20
    },
    interestRate: {
        type: Number,
        default: 2.5 // Porcentaje mensual
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'BLOCKED', 'CANCELLED'],
        default: 'ACTIVE'
    }
}, {
    timestamps: true,
    versionKey: false
});

creditCardSchema.pre('save', function () {
    this.availableCredit = this.creditLimit - this.totalDebt;
});

export default model('CreditCard', creditCardSchema);