'use strict';

import { Schema, model } from 'mongoose';

const loanPaymentSchema = new Schema({
    loan: {
        type: Schema.Types.ObjectId,
        ref: 'Loan',
        required: [true, 'El préstamo es obligatorio']
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'La cuenta de origen es obligatoria']
    },
    installmentDetail: {
        type: Schema.Types.ObjectId,
        ref: 'LoanDetail',
        required: [true, 'La referencia a la cuota es obligatoria']
    },
    amountPaid: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('LoanPayment', loanPaymentSchema);