const express = require('express');
const { getMedicines, createMedicine, updateMedicine, deleteMedicine, getLowStock } = require('../Controller/MedicineController');
const router = express.Router();

router.get('/low-stock', getLowStock);
router.get('/', getMedicines);
router.post('/', createMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

module.exports = router;