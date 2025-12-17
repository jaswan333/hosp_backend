const express = require('express');
const { createAppointment, getAppointments, getUserAppointments, updateAppointment, deleteAppointment } = require('../Controller/AppointmentController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/user/:userId', getUserAppointments);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;