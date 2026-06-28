'use strict';
import { Schema, model } from 'mongoose';

const creditCardRequestSchema = new Schema({
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

  cardType: {
    type: String,
    enum: ['CLASSIC', 'GOLD', 'PLATINUM', 'BLACK'],
    default: 'CLASSIC',
    required: true
  },
  requestedCreditLimit: {
    type: Number,
    required: true  
  },
  cutoffDate: {
    type: Number,
    min: 1,
    max: 28,
    required: true  
  },
  deliveryAddress: {
    address:   { type: String, required: true },
    latitude:  { type: Number, required: true },
    longitude: { type: Number, required: true }
  },

  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING',
    required: true
  },
  approvedCreditLimit: {
    type: Number,
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
  },
  creditCard: {
    type: Schema.Types.ObjectId,
    ref: 'CreditCard',
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

export default model('CreditCardRequest', creditCardRequestSchema);