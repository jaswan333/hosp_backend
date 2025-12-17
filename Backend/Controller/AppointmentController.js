const Appointment = require('../Module/AppointmentModel');
const User = require('../Module/UserModel');

const createAppointment = async (req, res) => {
    try {
        const appointmentData = req.body;
        const bedCharges = appointmentData.bedType === 'General' ? 500 : 
                          appointmentData.bedType === 'Private' ? 1500 : 
                          appointmentData.bedType === 'ICU' ? 3000 : 2000;
        
        const appointment = new Appointment({
            ...appointmentData,
            bedCharges,
            medicineCharges: Math.floor(Math.random() * 1000) + 500,
            labCharges: Math.floor(Math.random() * 800) + 400
        });

        await appointment.save();
        res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAppointments = async (req, res) => {
    try {
        const userId = req.query.userId;
        const query = userId ? { userId } : {};
        const appointments = await Appointment.find(query).populate('userId', 'name email phone');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getUserAppointments = async (req, res) => {
    try {
        const { userId } = req.params;
        const appointments = await Appointment.find({ userId }).populate('userId', 'name email phone');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ message: 'Appointment updated', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        await Appointment.findByIdAndDelete(id);
        res.json({ message: 'Appointment cancelled' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createAppointment, getAppointments, getUserAppointments, updateAppointment, deleteAppointment };