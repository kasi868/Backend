const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const User = require("./models/User"); // Corrected path

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    rl.question("Enter Super Admin Name: ", (name) => {
      rl.question("Enter Super Admin Email: ", (email) => {
        rl.question("Enter Super Admin Password: ", async (password) => {
          if (!name || !email || !password) {
            console.error("All fields are required.");
            rl.close();
            process.exit(1);
          }

          const userExists = await User.findOne({ email });
          if (userExists) {
            console.error("A user with this email already exists.");
            rl.close();
            process.exit(1);
          }

          const user = new User({
            name,
            email,
            password, // Password will be hashed by the pre-save hook in User.js
            role: "superadmin",
            isActive: true,
          });

          await user.save();
          console.log("✅ Super Admin created successfully!");
          rl.close();
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createSuperAdmin();