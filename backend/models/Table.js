const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    currentEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Employee who booked
    currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }, // Current order
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a table number is unique only within a specific restaurant
tableSchema.index({ tableNumber: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);