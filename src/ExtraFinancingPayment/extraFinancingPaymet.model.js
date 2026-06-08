'use strict';

import { Schema, model } from 'mongoose';

const extraFinancingPaymentSchema = new Schema({
    extraFinancing: {
        type: Schema.Types.ObjectId,
        ref: 'ExtraFinancing',
        required: [true, 'El extrafinanciamiento es obligatorio']
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'La cuenta de origen es obligatoria']
    },
    detail: {
        type: Schema.Types.ObjectId,
        ref: 'ExtraFinancingDetail',
        required: [true, 'La referencia a la cuota es obligatoria']
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('ExtraFinancingPayment', extraFinancingPaymentSchema);