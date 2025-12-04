const mongoose = require('mongoose');

const rfpSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  requirements: [{
    item: String,
    quantity: Number,
    specifications: String
  }],
  deliveryTimeline: {
    value: Number,
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'days'
    }
  },
  paymentTerms: {
    type: String,
    default: 'Net 30'
  },
  warranty: {
    type: String
  },
  additionalTerms: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'in-review', 'completed', 'cancelled'],
    default: 'draft'
  },
  sentToVendors: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  rawInput: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

rfpSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RFP', rfpSchema);
