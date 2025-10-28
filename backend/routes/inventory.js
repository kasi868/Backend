const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");

// ✅ Get all inventory items
router.get("/", async (req, res) => {
  try {
    const items = await Inventory.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Add new item
// router.post("/", async (req, res) => {
//   try {
//     const { itemName, category, quantity, pricePerUnit } = req.body;
//     const totalCost = quantity * pricePerUnit;
//     const newItem = new Inventory({
//       name: itemName,
//       category,
//       quantity,
//       pricePerUnit,
//       totalCost,
//     });
//     await newItem.save();
//     res.status(201).json(newItem);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });
// router.post("/", async (req, res) => {
//   try {
//     const { name, category, quantity, pricePerUnit, unit, restaurantId } = req.body;

//     if (!name || !unit || !pricePerUnit || !quantity || !restaurantId)
//       return res.status(400).json({ message: "All fields are required" });

//     const newItem = new Inventory({ name, category, quantity, pricePerUnit, unit, restaurantId });
//     await newItem.save();
//     res.status(201).json(newItem);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });
router.post("/", async (req, res) => {
  try {
    const { name, category, unit, quantity, pricePerUnit, restaurantId } = req.body;

    if (!name || !unit || !quantity || !pricePerUnit || !restaurantId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newItem = new Inventory({
      name,
      category,
      unit,
      quantity,
      pricePerUnit,
      restaurantId,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Delete item
router.delete("/:id", async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Calculate total expense
router.get("/total-expense", async (req, res) => {
  try {
    const items = await Inventory.find();
    const totalExpense = items.reduce(
      (sum, item) => sum + item.quantity * item.pricePerUnit,
      0
    );
    res.status(200).json({ totalExpense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
