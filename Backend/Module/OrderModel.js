const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userPhone: { type: String, required: true },
  items: [{
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  gst: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'delivered'], default: 'pending' },
  orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);