const dotenv = require('dotenv');
dotenv.config(); // This loads the environment variables from .env file

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http'); // Add HTTP server
const { Server } = require('socket.io'); // Add Socket.IO
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const tableRoutes = require('./routes/tableRoutes');
const orderRoutes = require('./routes/orderRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes'); // Import restaurant routes
const paymentRoutes = require('./routes/paymentRoutes');
const inventoryRoutes = require("./routes/inventory");

// Connect to MongoDB
connectDB();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // or your frontend URL
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in routes
app.set('io', io);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Have client join a room based on their restaurant
  socket.on('joinRestaurantRoom', (restaurantId) => {
    if (restaurantId) {
      socket.join(restaurantId);
      console.log(`Client ${socket.id} joined room ${restaurantId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes); // Use restaurant routes
app.use('/api/payment', paymentRoutes);
app.use("/api/inventory", inventoryRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Listen using the HTTP server instead of app
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
