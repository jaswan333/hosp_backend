const express = require('express');
const { createEmergency, getEmergencies, getUserEmergencies, updateEmergency, deleteEmergency } = require('../Controller/EmergencyController');
const router = express.Router();

router.post('/', createEmergency);
router.get('/', getEmergencies);
router.get('/user/:userId', getUserEmergencies);
router.put('/:id', updateEmergency);
router.delete('/:id', deleteEmergency);

module.exports = router;