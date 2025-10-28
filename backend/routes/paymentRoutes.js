const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');

// IMPORTANT: Make sure you have installed the razorpay package on your server
// In your backend folder, run: npm install razorpay

// Initialize Razorpay. It's best practice to use environment variables for keys.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @route   POST /api/payment/create-order
 * @desc    Creates a new Razorpay order
 * @access  Private
 */
router.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ message: 'Amount is required' });
  }

  // Razorpay expects the amount in the smallest currency unit (e.g., paise for INR).
  const options = {
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`, // A unique ID for the receipt
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: 'Something went wrong while creating the payment order.' });
  }
});

module.exports = router;