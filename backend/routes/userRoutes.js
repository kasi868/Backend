const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Restaurant = require('../models/Restaurant'); // Import Restaurant model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect, admin, superadmin } = require('../middleware/authMiddleware'); // Import admin middleware

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, restaurantName } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // For a new admin signing up, we create their restaurant at the same time.
    if (!restaurantName) {
      return res.status(400).json({ message: 'Restaurant name is required for new admin registration.' });
    }

    const subscriptionExpiresAt = new Date();
    subscriptionExpiresAt.setMonth(subscriptionExpiresAt.getMonth() + 1); // Default 1-month trial

    const newRestaurant = await Restaurant.create({
      name: restaurantName,
      subscriptionExpiresAt,
    });

    // Create user
    const user = await User.create({
      name,
      email,
      password, // The pre-save hook in the User model will hash this
      role: 'admin', // New registrations are admins of their new restaurant
      restaurantId: newRestaurant._id,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).populate('restaurantId');

    if (user) {
      // Check if user account is active
      if (!user.isActive) {
        return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
      }

      // For admins and employees, check their restaurant's status before allowing login
      if (user.role === 'admin' || user.role === 'employee') {
        const restaurant = user.restaurantId;
        if (!restaurant || !restaurant.isActive) {
          return res.status(403).json({ message: 'Restaurant is inactive. Please contact your administrator.' });
        }
        if (restaurant.subscriptionExpiresAt && new Date() > new Date(restaurant.subscriptionExpiresAt)) {
          return res.status(403).json({ message: 'Restaurant subscription has expired.' });
        }
      }
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });

  }
});

// @route   POST /api/users/create-admin
// @desc    Superadmin creates a new admin user
// @access  Private/Superadmin
router.post('/create-admin', protect, superadmin, async (req, res) => {
  try {
    const { name, email, password, restaurantId } = req.body; // restaurantId can be provided by global superadmin

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields: name, email, and password' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // The restaurantId is sent from the form on the CreateAdminScreen
    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required for new admin' });
    }

    // Create user with 'admin' role
    const user = await User.create({
      name,
      email,
      password, // The pre-save hook in the User model will hash this
      role: 'admin', // Explicitly set role to 'admin'
      restaurantId: restaurantId, // Assign the restaurantId from the request body
    });

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, restaurantId: user.restaurantId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/create-employee
// @desc    Admin creates a new employee for their restaurant
// @access  Private/Admin

// ✅ Create an employee (Admin only)
router.post('/create-employee', protect, admin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the employee already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Get the restaurant of the logged-in admin
    const restaurantId = req.user.restaurantId;
    if (!restaurantId) {
      return res.status(400).json({ message: 'Admin not associated with any restaurant' });
    }

    // Hash the password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create the employee
    const newEmployee = await User.create({
      name,
      email,
      password,
      role: 'employee',
      restaurantId,
      isActive: true,
    });

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        restaurantId: newEmployee.restaurantId,
      },
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// router.post('/create-employee', protect, admin, async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'Please provide name, email, and password.' });
//     }

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'An employee with this email already exists.' });
//     }

//     // The new employee belongs to the logged-in admin's restaurant
//     const restaurantId = req.user.restaurantId;

//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: 'employee',
//       restaurantId: restaurantId,
//     });

//     res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// @route   POST /api/users/create-superadmin
// @desc    Superadmin creates another superadmin user
// @access  Private/Superadmin
router.post('/create-superadmin', protect, superadmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields: name, email, and password' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Create user with 'superadmin' role. Superadmins are global and don't have a restaurantId.
    const user = await User.create({
      name,
      email,
      password, // The pre-save hook in the User model will hash this
      role: 'superadmin',
      isActive: true,
    });

    // Do not return a token for the newly created user, just confirmation.
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/toggle-active
// @desc    Superadmin toggles a user's active status
// @access  Private/Superadmin
router.put('/:id/toggle-active', protect, superadmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body; // Expecting { isActive: true/false }

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToUpdate._id.toString() === req.user._id.toString() && isActive === false) {
      return res.status(400).json({ message: 'Superadmin cannot deactivate their own account.' });
    }

    userToUpdate.isActive = isActive;
    await userToUpdate.save();

    res.json({ _id: userToUpdate._id, name: userToUpdate.name, email: userToUpdate.email, role: userToUpdate.role, isActive: userToUpdate.isActive });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'abc123', {
    expiresIn: '30d',
  });
};

module.exports = router;