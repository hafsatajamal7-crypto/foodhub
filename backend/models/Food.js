import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  ingredients: { type: [String], default: [] },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  isAvailable: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export default mongoose.model('Food', foodSchema);
