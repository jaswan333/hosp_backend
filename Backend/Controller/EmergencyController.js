const Emergency = require('../Module/EmergencyModel');

const createEmergency = async (req, res) => {
    try {
        console.log('Emergency request received:', req.body);
        
        // Validate required fields
        const { patientName, phone, gender, symptoms, emergencyType } = req.body;
        if (!patientName || !phone || !gender || !symptoms || !emergencyType) {
            return res.status(400).json({ 
                message: 'Missing required fields', 
                required: ['patientName', 'phone', 'gender', 'symptoms', 'emergencyType']
            });
        }
        
        const emergency = new Emergency(req.body);
        const savedEmergency = await emergency.save();
        console.log('Emergency saved successfully:', savedEmergency._id);
        
        res.status(201).json({ 
            message: 'Emergency request created successfully', 
            emergency: savedEmergency 
        });
    } catch (error) {
        console.error('Emergency creation error:', error.message);
        res.status(500).json({ 
            message: 'Failed to create emergency request', 
            error: error.message 
        });
    }
};

const getEmergencies = async (req, res) => {
    try {
        const emergencies = await Emergency.find().populate('userId', 'name email phone').sort({ createdAt: -1 });
        res.json(emergencies);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getUserEmergencies = async (req, res) => {
    try {
        const { userId } = req.params;
        const emergencies = await Emergency.find({ userId }).sort({ createdAt: -1 });
        res.json(emergencies);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateEmergency = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        if (updateData.status === 'completed') {
            updateData.completedAt = new Date();
        }
        
        const emergency = await Emergency.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ message: 'Emergency updated', emergency });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteEmergency = async (req, res) => {
    try {
        const { id } = req.params;
        await Emergency.findByIdAndDelete(id);
        res.json({ message: 'Emergency deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createEmergency, getEmergencies, getUserEmergencies, updateEmergency, deleteEmergency };