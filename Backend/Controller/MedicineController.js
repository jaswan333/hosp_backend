const Medicine = require('../Module/MedicineModel');

const getMedicines = async (req, res) => {
    try {
        console.log('Fetching medicines from database...');
        const medicines = await Medicine.find().sort({ name: 1 });
        console.log(`Found ${medicines.length} medicines`);
        res.json(medicines);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createMedicine = async (req, res) => {
    try {
        const medicine = new Medicine(req.body);
        const savedMedicine = await medicine.save();
        res.status(201).json({ message: 'Medicine created', medicine: savedMedicine });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock, ...otherUpdates } = req.body;
        
        // If only stock is being updated
        if (stock !== undefined && Object.keys(otherUpdates).length === 0) {
            const medicine = await Medicine.findByIdAndUpdate(
                id, 
                { stock: parseInt(stock) }, 
                { new: true }
            );
            return res.json(medicine);
        }
        
        // Full update
        const medicine = await Medicine.findByIdAndUpdate(id, req.body, { new: true });
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        await Medicine.findByIdAndDelete(id);
        res.json({ message: 'Medicine deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getLowStock = async (req, res) => {
    try {
        const medicines = await Medicine.find({ stock: { $lt: 10 } }).sort({ stock: 1 });
        res.json(medicines);
    } catch (error) {
        console.error('Error fetching low stock medicines:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getMedicines, createMedicine, updateMedicine, deleteMedicine, getLowStock };