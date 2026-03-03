import { Schema, model } from "mongoose";

const loanApplicationSchema = new Schema({
    applicant: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 100
    },
    termMonths: {
        type: Number,
        required: true,
        min: 1
    },
    interestRate: {
        type: Number,
        default: 0.12
    },
    monthlyIncome: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'],
        default: 'PENDING'
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewDate: {
        type: Date
    }
}, {
    timestamps: true
});

export default model('LoanApplication', loanApplicationSchema);