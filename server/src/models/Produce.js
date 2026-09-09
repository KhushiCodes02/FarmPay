const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cropName: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Oilseeds', 'Other'],
      required: true,
      default: 'Vegetables',
    },
    description: { type: String, trim: true },
    quantityAvailable: { type: Number, required: true, min: 0 },
    unit: {
      type: String,
      enum: ['kg', 'quintal', 'ton', 'crate', 'bag'],
      default: 'kg',
    },
    pricePerUnit: { type: Number, required: true, min: 0.1 },
    marketReferencePrice: { type: Number },
    harvestDate: { type: Date, default: Date.now },
    location: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    status: {
      type: String,
      enum: ['AVAILABLE', 'LOW_STOCK', 'SOLD_OUT', 'INACTIVE'],
      default: 'AVAILABLE',
      index: true,
    },
  },
  { timestamps: true }
);

produceSchema.index({ cropName: 'text', category: 'text', location: 'text' });

module.exports = mongoose.model('Produce', produceSchema);
