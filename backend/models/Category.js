import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
}, { timestamps: true });

categorySchema.index({ name: 1, restaurant: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
