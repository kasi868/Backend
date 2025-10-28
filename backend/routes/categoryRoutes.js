const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Item = require('../models/Item'); // Import the Item model
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find({ restaurantId: req.user.restaurantId });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name } = req.body;
    const restaurantId = req.user.restaurantId;
    
    const categoryExists = await Category.findOne({ name, restaurantId });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const category = await Category.create({
      name,
      restaurantId,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name } = req.body;
    
    const category = await Category.findOne({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    category.name = name || category.name;
    
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  console.log("DELETE /categories/:id", req.params.id, "user:", req.user);

  try {
    // --- Get the restaurantId properly ---
    let restaurantId;

    // Case 1: If auth middleware attached user.restaurantId as an object
    if (req.user.restaurantId?._id) {
      restaurantId = req.user.restaurantId._id;
    }
    // Case 2: If it’s a plain string (from stored userData)
    else if (req.user.restaurantId) {
      restaurantId = req.user.restaurantId;
    }
    // Case 3: Safety fallback — reject if it’s missing
    else {
      return res.status(400).json({ message: 'Restaurant ID missing in user context' });
    }

    // --- Check if items exist in this category for that restaurant ---
    const itemsInCategory = await Item.countDocuments({
      categoryId: req.params.id,
      restaurantId,
    });

    if (itemsInCategory > 0) {
      return res.status(400).json({
        message: 'Cannot delete category. It still contains items.',
      });
    }

    // --- Delete the category belonging to this restaurant ---
    const deletedCategory = await Category.findOneAndDelete({
      _id: req.params.id,
      restaurantId,
    });

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category removed successfully', category: deletedCategory });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;