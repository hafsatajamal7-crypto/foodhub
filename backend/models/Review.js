import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 1000, default: '' },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
