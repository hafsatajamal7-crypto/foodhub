import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: '' },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  cuisine: { type: [String], default: [] },
  address: { type: String, required: true },
  phone: { type: String, default: '' },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  deliveryTime: { type: String, default: '25-35 min' },
  deliveryFee: { type: Number, min: 0, default: 0 },
  openingHours: { type: String, default: 'Daily, 11:00 AM - 10:00 PM' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Blocked'], default: 'Pending', index: true },
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);
