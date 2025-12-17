const Order = require('../Module/OrderModel');
const Medicine = require('../Module/MedicineModel');

const createOrder = async (req, res) => {
    try {
        const { userName, userPhone, items } = req.body;
        
        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const gst = subtotal * 0.18; // 18% GST
        const total = subtotal + gst;
        
        // Create order
        const order = new Order({
            userName,
            userPhone,
            items,
            subtotal,
            gst,
            total
        });
        
        await order.save();
        
        // Update medicine stock
        for (const item of items) {
            const medicine = await Medicine.findById(item.medicineId);
            if (medicine) {
                await Medicine.findByIdAndUpdate(
                    item.medicineId,
                    { $inc: { stock: -item.quantity } }
                );
            } else {
                // Try to find by name if ID doesn't work
                await Medicine.findOneAndUpdate(
                    { name: item.name },
                    { $inc: { stock: -item.quantity } }
                );
            }
        }
        
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createOrder, getOrders, updateOrderStatus };