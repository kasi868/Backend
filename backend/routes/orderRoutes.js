const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Table = require('../models/Table');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { tableId, items, total, paymentMethod } = req.body;
    const employeeId = req.user._id;
    const restaurantId = req.user.restaurantId; // Get restaurant from logged-in user

    const order = new Order({
      tableId,
      employeeId,
      restaurantId,
      items,
      total,
      paymentMethod,
    });

    const createdOrder = await order.save();

    // Update the table with the current order ID
    await Table.findByIdAndUpdate(tableId, { currentOrderId: createdOrder._id });

    // Emit a real-time event to the specific restaurant's room
    const io = req.app.get('io');
    io.to(restaurantId.toString()).emit('newOrder', createdOrder);

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all orders for the user's restaurant
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Only fetch orders that belong to the user's restaurant
    const orders = await Order.find({ restaurantId: req.user.restaurantId })
      .populate('tableId', 'tableNumber')
      .populate('employeeId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;