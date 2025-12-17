const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

console.log('🔍 Testing MongoDB connection...');
console.log('📍 URI:', mongoURI ? mongoURI.replace(/\/\/.*@/, '//***:***@') : 'Not found in .env');

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 10000,
})
.then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    process.exit(0);
})
.catch((err) => {
    console.error('❌ MongoDB connection failed:');
    console.error('📝 Error:', err.message);
    
    if (err.message.includes('authentication failed')) {
        console.log('🔑 Check your username and password');
    } else if (err.message.includes('network')) {
        console.log('🌐 Check your internet connection');
    } else if (err.message.includes('timeout')) {
        console.log('⏰ Connection timeout - check firewall/network');
    }
    
    process.exit(1);
});