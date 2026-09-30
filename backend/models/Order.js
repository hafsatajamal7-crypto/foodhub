import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  items: [{
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  }],
  subtotal: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, required: true, min: 0 },
  tax: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  deliveryAddress: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: { type: String, enum: ['Cash on Delivery'], default: 'Cash on Delivery' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' },
  orderStatus: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Pending', index: true },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
