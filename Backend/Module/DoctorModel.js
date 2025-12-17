const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    experience: { type: String, required: true },
    status: { type: String, enum: ['Available', 'Busy', 'Off Duty'], default: 'Available' },
    attendance: { type: String, default: '95%' },
    image: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    qualifications: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);