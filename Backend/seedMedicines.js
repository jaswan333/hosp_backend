const mongoose = require('mongoose');
const Medicine = require('./Module/MedicineModel');
require('dotenv').config();

const sampleMedicines = [
  {
    name: 'Paracetamol 500mg',
    category: 'Pain Relief',
    price: 25,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop',
    description: 'Effective pain relief and fever reducer',
    manufacturer: 'PharmaCorp',
    lowStockThreshold: 20,
    usedFor: 'Fever, headache, body pain'
  },
  {
    name: 'Amoxicillin 250mg',
    category: 'Antibiotic',
    price: 45,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300&h=200&fit=crop',
    description: 'Broad-spectrum antibiotic for bacterial infections',
    manufacturer: 'MediLife',
    lowStockThreshold: 15,
    usedFor: 'Bacterial infections, respiratory tract infections'
  },
  {
    name: 'Aspirin 75mg',
    category: 'Cardiac',
    price: 30,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop',
    description: 'Low-dose aspirin for heart protection',
    manufacturer: 'CardioMed',
    lowStockThreshold: 10,
    usedFor: 'Heart protection, blood thinning'
  },
  {
    name: 'Vitamin D3 1000IU',
    category: 'Vitamins',
    price: 120,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8ca6?w=300&h=200&fit=crop',
    description: 'Essential vitamin D supplement',
    manufacturer: 'VitaHealth',
    lowStockThreshold: 25,
    usedFor: 'Bone health, immunity, vitamin D deficiency'
  },
  {
    name: 'Cetirizine 10mg',
    category: 'Allergy',
    price: 45,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop',
    description: 'Antihistamine for allergies',
    manufacturer: 'AllerCare',
    lowStockThreshold: 15,
    usedFor: 'Allergies, skin rash, cold symptoms'
  },
  {
    name: 'Omeprazole 20mg',
    category: 'Digestive',
    price: 65,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=200&fit=crop',
    description: 'Proton pump inhibitor for acidity',
    manufacturer: 'GastroCare',
    lowStockThreshold: 10,
    usedFor: 'Acidity, stomach ulcer, GERD'
  },
  {
    name: 'Ibuprofen 400mg',
    category: 'Pain Relief',
    price: 35,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop',
    description: 'Anti-inflammatory pain reliever',
    manufacturer: 'PharmaCorp',
    lowStockThreshold: 18,
    usedFor: 'Inflammation, muscle pain, arthritis'
  },
  {
    name: 'Atorvastatin 20mg',
    category: 'Cardiac',
    price: 180,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop',
    description: 'Cholesterol-lowering medication',
    manufacturer: 'CardioMed',
    lowStockThreshold: 15,
    usedFor: 'High cholesterol, heart disease prevention'
  },
  {
    name: 'Multivitamin Tablets',
    category: 'Vitamins',
    price: 250,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8ca6?w=300&h=200&fit=crop',
    description: 'Complete daily vitamin supplement',
    manufacturer: 'VitaHealth',
    lowStockThreshold: 20,
    usedFor: 'Daily nutrition, vitamin deficiency'
  },
  {
    name: 'Cefixime 200mg',
    category: 'Antibiotic',
    price: 95,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300&h=200&fit=crop',
    description: 'Third-generation cephalosporin antibiotic',
    manufacturer: 'MediLife',
    lowStockThreshold: 12,
    usedFor: 'Severe bacterial infections, UTI'
  }
];

const seedMedicines = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing medicines
    await Medicine.deleteMany({});
    console.log('🗑️ Cleared existing medicines');

    // Insert sample medicines
    const insertedMedicines = await Medicine.insertMany(sampleMedicines);
    console.log(`✅ Inserted ${insertedMedicines.length} sample medicines`);

    console.log('\n📋 Sample Medicines Created:');
    insertedMedicines.forEach(med => {
      console.log(`- ${med.name} (${med.category}) - Stock: ${med.stock} - ₹${med.price} - Used for: ${med.usedFor}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding medicines:', error);
    process.exit(1);
  }
};

seedMedicines();