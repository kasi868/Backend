const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const { protect, superadmin } = require('../middleware/authMiddleware');

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private/Superadmin
router.post('/', protect, superadmin, async (req, res) => {
  try {
    const { name, address, subscriptionMonths, razorpayKeyId, razorpayKeySecret } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Restaurant name is required' });
    }

    const restaurantExists = await Restaurant.findOne({ name });
    if (restaurantExists) {
      return res.status(400).json({ message: 'Restaurant with this name already exists' });
    }

    const subscriptionExpiresAt = new Date();
    subscriptionExpiresAt.setMonth(subscriptionExpiresAt.getMonth() + (parseInt(subscriptionMonths, 10) || 1));

    const restaurant = await Restaurant.create({
      name,
      address,
      subscriptionExpiresAt,
      razorpayKeyId,
      razorpayKeySecret,
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Private/Superadmin
router.get('/', protect, superadmin, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a restaurant (activate/deactivate, extend subscription)
// @route   PUT /api/restaurants/:id
// @access  Private/Superadmin
router.put('/:id', protect, superadmin, async (req, res) => {
  try {
    const { name, address, isActive, extendSubscriptionMonths, razorpayKeyId, razorpayKeySecret } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.name = name || restaurant.name;
    restaurant.address = address || restaurant.address;
    restaurant.razorpayKeyId = razorpayKeyId || restaurant.razorpayKeyId;
    restaurant.razorpayKeySecret = razorpayKeySecret || restaurant.razorpayKeySecret;
    if (isActive !== undefined) {
      restaurant.isActive = isActive;
    }

    if (extendSubscriptionMonths) {
      const currentExpiry = restaurant.subscriptionExpiresAt > new Date() ? restaurant.subscriptionExpiresAt : new Date();
      currentExpiry.setMonth(currentExpiry.getMonth() + parseInt(extendSubscriptionMonths, 10));
      restaurant.subscriptionExpiresAt = currentExpiry;
    }

    const updatedRestaurant = await restaurant.save();
    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;