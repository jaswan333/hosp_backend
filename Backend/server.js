const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://jaswan:jaswan333@jaswan.ueyjirz.mongodb.net/hospital?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
})
.catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('🔍 Check your internet connection and MongoDB URI');
    process.exit(1);
});

// MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected');
});

// Routes
const authRoutes = require('./Routers/SignupRouter');
const appointmentRoutes = require('./Routers/AppointmentRouter');
const userRoutes = require('./Routers/UserRouter');
const emergencyRoutes = require('./Routers/EmergencyRouter');
const medicineRoutes = require('./Routers/MedicineRouter');
const orderRoutes = require('./Routers/OrderRouter');

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);

console.log('📋 Routes loaded:');
console.log('- /api/auth');
console.log('- /api/appointments');
console.log('- /api/users');
console.log('- /api/emergencies');
console.log('- /api/medicines');
console.log('- /api/orders');

app.get('/', (req, res) => {
    res.json({ message: 'Hospital Management System API' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});