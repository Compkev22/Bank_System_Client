'use strict';
import { Schema, model } from 'mongoose';

const cardStatusRequestSchema = new Schema({
    card: {
        type: Schema.Types.ObjectId,
        refPath: 'cardModel',   
        required: true
    },
    cardType: {
        type: String,
        enum: ['DEBIT', 'CREDIT'],
        default: 'DEBIT',
        required: true
    },
    cardModel: {
        type: String,
        enum: ['Card', 'CreditCard'],
        default: 'Card',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedStatus: {
        type: String,
        enum: ['ACTIVATE', 'DEACTIVATE'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
        required: true
    },
    reason: {
        type: String,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    processedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

cardStatusRequestSchema.pre('validate', function () {
    this.cardModel = this.cardType === 'CREDIT' ? 'CreditCard' : 'Card';
});
export default model('CardStatusRequest', cardStatusRequestSchema);