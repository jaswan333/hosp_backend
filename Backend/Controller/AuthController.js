const User = require('../Module/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password.toString(), 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully', user: { id: user._id, name, email, phone } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        const user = await User.findOne({ email });
        console.log('Login attempt for:', email);
        console.log('User found:', user ? 'Yes' : 'No');
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password.toString(), user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ 
            message: 'Login successful', 
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
            token 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { register, login };