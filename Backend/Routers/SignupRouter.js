const express = require('express');
const { register, login } = require('../Controller/AuthController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;