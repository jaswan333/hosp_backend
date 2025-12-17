const validateAppointment = (req, res, next) => {
    const { patientName, email, phone, age, department, appointmentDate } = req.body;
    
    const errors = [];
    
    if (!patientName || patientName.trim().length < 2) {
        errors.push('Patient name must be at least 2 characters');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Valid email is required');
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone || !phoneRegex.test(phone.replace(/[-\s]/g, ''))) {
        errors.push('Valid 10-digit phone number is required');
    }
    
    if (!age || age < 1 || age > 120) {
        errors.push('Valid age between 1-120 is required');
    }
    
    if (!department) {
        errors.push('Department is required');
    }
    
    const appointmentDateObj = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!appointmentDate || appointmentDateObj < today) {
        errors.push('Valid future appointment date is required');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    next();
};

const validateUser = (req, res, next) => {
    const { name, email, password } = req.body;
    
    const errors = [];
    
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Valid email is required');
    }
    
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    next();
};

module.exports = { validateAppointment, validateUser };