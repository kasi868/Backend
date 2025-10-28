// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const Table = require('../models/Table');
// const { protect, admin } = require('../middleware/authMiddleware');

// // @desc    Get all tables
// // @route   GET /api/tables
// // @access  Public
// router.get('/', async (req, res) => {
//   try {
//     console.log('GET /api/tables route hit');
    
//     // Check if collection exists
//     const collections = await mongoose.connection.db.listCollections().toArray();
//     const collectionNames = collections.map(c => c.name);
//     console.log('Available collections:', collectionNames);
    
//     // Get all tables with detailed logging
//     const tables = await Table.find({});
//     console.log('Tables fetched:', tables.length);
//     console.log('Tables data:', JSON.stringify(tables));
    
//     // Create a test table if none exist
//     if (tables.length === 0) {
//       console.log('No tables found, creating a test table');
//       const newTable = new Table({
//         tableNumber: 'T1',
//         capacity: 4,
//         isOccupied: false
//       });
//       await newTable.save();
//       console.log('Test table created:', newTable);
      
//       // Fetch tables again
//       const updatedTables = await Table.find({});
//       console.log('Updated tables count:', updatedTables.length);
//       return res.json(updatedTables);
//     }
    
//     res.json(tables);
//   } catch (error) {
//     console.error('Error fetching tables:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// // @desc    Create a new table
// // @route   POST /api/tables
// // @access  Private/Admin
// router.post('/', protect, admin, async (req, res) => {
//   try {
//     const { tableNumber, capacity } = req.body;
    
//     const tableExists = await Table.findOne({ tableNumber });
//     if (tableExists) {
//       return res.status(400).json({ message: 'Table number already exists' });
//     }
    
//     const table = await Table.create({ 
//       tableNumber, 
//       capacity: Number(capacity),
//       isOccupied: false
//     });
    
//     res.status(201).json(table);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // @desc    Update a table
// // @route   PUT /api/tables/:id
// // @access  Private/Admin
// router.put('/:id', protect, admin, async (req, res) => {
//   try {
//     const { tableNumber, capacity, isOccupied } = req.body;
    
//     const table = await Table.findById(req.params.id);
    
//     if (!table) {
//       return res.status(404).json({ message: 'Table not found' });
//     }
    
//     table.tableNumber = tableNumber || table.tableNumber;
//     table.capacity = capacity || table.capacity;
    
//     // Only update isOccupied if it's explicitly provided
//     if (isOccupied !== undefined) {
//       table.isOccupied = isOccupied;
//     }
    
//     const updatedTable = await table.save();
//     res.json(updatedTable);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // @desc    Delete a table
// // @route   DELETE /api/tables/:id
// // @access  Private/Admin
// router.delete('/:id', protect, admin, async (req, res) => {
//   try {
//     const table = await Table.findById(req.params.id);
    
//     if (!table) {
//       return res.status(404).json({ message: 'Table not found' });
//     }
    
//     await table.remove();
//     res.json({ message: 'Table removed' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;




































// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const Table = require('../models/Table');
// const { protect, admin } = require('../middleware/authMiddleware');

// // GET all tables
// router.get('/', async (req, res) => {
//   try {
//     const tables = await Table.find({});
//     res.json(tables);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // BOOK a table (for an employee)
// router.post('/book/:id', protect, async (req, res) => {
//   try {
//     const table = await Table.findById(req.params.id);

//     if (!table) return res.status(404).json({ message: 'Table not found' });

//     if (table.isOccupied) {
//       return res.status(400).json({ message: 'Table is currently serving another order' });
//     }

//     table.isOccupied = true;
//     table.currentEmployee = req.user._id; // logged in employee
//     await table.save();

//     res.json({ message: `Table ${table.tableNumber} booked successfully`, table });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // FREE a table after order is placed
// router.post('/free/:id', protect, async (req, res) => {
//   try {
//     const table = await Table.findById(req.params.id);

//     if (!table) return res.status(404).json({ message: 'Table not found' });

//     table.isOccupied = false;
//     table.currentEmployee = null;
//     table.currentOrderId = null;

//     await table.save();

//     res.json({ message: `Table ${table.tableNumber} is now free`, table });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Admin CRUD routes remain same (optional)
// router.post('/', protect, admin, async (req, res) => {
//   const { tableNumber, capacity } = req.body;
//   const tableExists = await Table.findOne({ tableNumber });
//   if (tableExists) return res.status(400).json({ message: 'Table number exists' });

//   const table = await Table.create({ tableNumber, capacity });
//   res.status(201).json(table);
// });

// router.put('/:id', protect, admin, async (req, res) => {
//   const table = await Table.findById(req.params.id);
//   if (!table) return res.status(404).json({ message: 'Table not found' });

//   table.tableNumber = req.body.tableNumber || table.tableNumber;
//   table.capacity = req.body.capacity || table.capacity;
//   table.isOccupied = req.body.isOccupied ?? table.isOccupied;

//   const updatedTable = await table.save();
//   res.json(updatedTable);
// });

// router.delete('/:id', protect, admin, async (req, res) => {
//   const table = await Table.findById(req.params.id);
//   if (!table) return res.status(404).json({ message: 'Table not found' });

//   await table.remove();
//   res.json({ message: 'Table removed' });
// });

// module.exports = router;






































const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Table = require('../models/Table');
const { protect, admin } = require('../middleware/authMiddleware');

// GET all tables
router.get('/', protect, async (req, res) => {
  try {
    const tables = await Table.find({ restaurantId: req.user.restaurantId }).populate(
      'currentEmployee',
      'name email'
    );
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// BOOK a table (for an employee)
router.post('/book/:id', protect, async (req, res) => {
  try {
    // Ensure the table belongs to the user's restaurant
    const table = await Table.findOne({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });
    if (!table) return res.status(404).json({ message: 'Table not found' });

    if (table.isOccupied) {
      return res.status(400).json({ message: 'Table is currently serving another order' });
    }

    table.isOccupied = true;
    table.currentEmployee = req.user._id; // logged in employee
    await table.save();

    // Populate employee info for response
    await table.populate('currentEmployee', 'name email');

    // Emit event to all clients
    const io = req.app.get('io');
    io.to(req.user.restaurantId.toString()).emit('tableUpdated', table);

    res.json({ message: `Table ${table.tableNumber} booked successfully`, table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// FREE a table after order is placed
router.post('/free/:id', protect, async (req, res) => {
  try {
    const table = await Table.findOne({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });
    if (!table) return res.status(404).json({ message: 'Table not found' });

    table.isOccupied = false;
    table.currentEmployee = null;
    table.currentOrderId = null;

    await table.save();

    // Emit event to all clients
    const io = req.app.get('io');
    io.to(req.user.restaurantId.toString()).emit('tableUpdated', table);

    res.json({ message: `Table ${table.tableNumber} is now free`, table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin CRUD routes
router.post('/', protect, admin, async (req, res) => {
  const { tableNumber, capacity } = req.body;
  const restaurantId = req.user.restaurantId;

  const tableExists = await Table.findOne({ tableNumber, restaurantId });
  if (tableExists) return res.status(400).json({ message: 'Table number exists' });

  const table = await Table.create({
    tableNumber,
    capacity,
    restaurantId,
  });

  // Emit event to all clients
  const io = req.app.get('io');
  io.to(restaurantId.toString()).emit('tableCreated', table);

  res.status(201).json(table);
});

router.put('/:id', protect, admin, async (req, res) => {
  const table = await Table.findOne({
    _id: req.params.id,
    restaurantId: req.user.restaurantId,
  });
  if (!table) return res.status(404).json({ message: 'Table not found' });

  table.tableNumber = req.body.tableNumber || table.tableNumber;
  table.capacity = req.body.capacity || table.capacity;
  table.isOccupied = req.body.isOccupied ?? table.isOccupied;

  const updatedTable = await table.save();

  // Emit event to all clients
  const io = req.app.get('io');
  io.to(req.user.restaurantId.toString()).emit('tableUpdated', updatedTable);

  res.json(updatedTable);
});

router.delete('/:id', protect, admin, async (req, res) => {
  const table = await Table.findOne({
    _id: req.params.id,
    restaurantId: req.user.restaurantId,
  });
  if (!table) return res.status(404).json({ message: 'Table not found' });

  await table.remove();

  // Emit event to all clients
  const io = req.app.get('io');
  io.to(req.user.restaurantId.toString()).emit('tableDeleted', table._id);

  res.json({ message: 'Table removed' });
});

module.exports = router;
