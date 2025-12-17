const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    department: { type: String, required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    symptoms: { type: String, required: true },
    bedType: { type: String, required: true },
    slot: { type: String, required: true },
    status: { type: String, default: 'current' },
    consultationFee: { type: Number, default: 1500 },
    bedCharges: { type: Number },
    medicineCharges: { type: Number },
    labCharges: { type: Number },
    paid: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookedOn: { type: Date, default: Date.now },
    // Emergency booking fields
    isEmergency: { type: Boolean, default: false },
    emergencyType: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    // Pregnancy booking fields
    isPregnancy: { type: Boolean, default: false },
    pregnancyWeeks: { type: Number },
    pregnancyType: { type: String },
    // Location fields
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String }
    },
    // Doctor assignment
    assignedDoctor: { type: String },
    doctorId: { type: mongoose.Schema.Types.ObjectId }
});

module.exports = mongoose.model('Appointment', appointmentSchema);