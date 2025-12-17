const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

// Emergency routes
const emergencyRoutes = require('./Routers/EmergencyRouter');
app.use('/api/emergencies', emergencyRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Hospital API Server' });
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
.then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📋 Emergency API: http://localhost:${PORT}/api/emergencies`);
    });
})
.catch(err => {
    console.error('❌ MongoDB Error:', err.message);
});