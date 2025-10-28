// backend/models/Inventory.js
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["Dairy","Meat","Grains","Flour","Vegetables","Spices","Other"], default: "Other" },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, enum: ["kg","g","litre","ml","piece"], required: true },
  pricePerUnit: { type: Number, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true }
});


module.exports = mongoose.model("Inventory", inventorySchema);
