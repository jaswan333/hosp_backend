const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: true },
    age: { type: Number, required: false },
    gender: { type: String, required: true },
    emergencyType: { type: String, required: true },
    symptoms: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
    
    // Location fields
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String }
    },
    
    // Pregnancy fields
    isPregnancy: { type: Boolean, default: false },
    pregnancyWeeks: { type: Number },
    pregnancyComplications: { type: String },
    
    // Assignment
    assignedDoctor: { type: String },
    assignedAmbulance: { type: String },
    estimatedArrival: { type: Date },
    
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminNotes: { type: String },
    completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Emergency', emergencySchema);