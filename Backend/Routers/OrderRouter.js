const express = require('express');
const { createOrder, getOrders, updateOrderStatus } = require('../Controller/OrderController');

const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.put('/:id', updateOrderStatus);

module.exports = router;