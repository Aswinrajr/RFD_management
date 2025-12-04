const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  rfpId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFP',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  pricing: {
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    breakdown: [{
      item: String,
      unitPrice: Number,
      quantity: Number,
      totalPrice: Number
    }]
  },
  deliveryTimeline: {
    value: Number,
    unit: String,
    description: String
  },
  paymentTerms: {
    type: String
  },
  warranty: {
    type: String
  },
  additionalTerms: {
    type: String
  },
  complianceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  aiSummary: {
    type: String
  },
  aiScore: {
    type: Number,
    min: 0,
    max: 100
  },
  aiRecommendation: {
    type: String
  },
  rawEmailContent: {
    type: String
  },
  emailReceivedAt: {
    type: Date
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String
  }],
  status: {
    type: String,
    enum: ['received', 'under-review', 'accepted', 'rejected'],
    default: 'received'
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

proposalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Proposal', proposalSchema);
