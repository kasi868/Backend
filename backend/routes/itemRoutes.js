const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Corrected path: save directly in the 'uploads' folder
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// @desc    Get all items for a restaurant
// @route   GET /api/items
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const items = await Item.find({ restaurantId: req.user.restaurantId }).populate('categoryId', 'name');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new item
// @route   POST /api/items
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, categoryId } = req.body;
    const restaurantId = req.user.restaurantId._id; // Use the ID from the populated object

    const item = new Item({
      name,
      price,
      description,
      categoryId,
      restaurantId,
      image: req.file ? `/uploads/${req.file.filename}` : null, // Corrected URL format
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, categoryId } = req.body;
    const item = await Item.findOne({ _id: req.params.id, restaurantId: req.user.restaurantId });

    if (item) {
      item.name = name || item.name;
      item.price = price || item.price;
      item.description = description || item.description;
      item.categoryId = categoryId || item.categoryId;
      if (req.file) {
        item.image = `/uploads/${req.file.filename}`; // Corrected URL format
      }

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const deletedItem = await Item.findOneAndDelete({ 
      _id: req.params.id, 
      restaurantId: req.user.restaurantId 
    });

    if (deletedItem) {
      res.json({ message: 'Item removed', item: deletedItem });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;