'use strict';

import { Schema, model } from 'mongoose';

const creditCardPaymentSchema = new Schema({
    creditCard: {
        type: Schema.Types.ObjectId,
        ref: 'CreditCard',
        required: [true, 'La tarjeta de crédito es obligatoria']
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'La cuenta de origen es obligatoria']
    },
    amount: {
        type: Number,
        required: [true, 'El monto del pago es obligatorio'],
        min: [1, 'El pago mínimo debe ser de 1']
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        default: 'Pago de tarjeta de crédito'
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('CreditCardPayment', creditCardPaymentSchema);