require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require('node-cron');
const axios = require('axios');
const contestRoutes = require("./routes/contestRoutes");
const fetchSolutions = require("./utils/youtubeScraper");
const fetchContests = require("./utils/fetchContests");
const connectDB = require("./config/db");
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Function to fetch contests and store them in the database
const fetchAndStoreContests = async () => {
  try {
    console.log("🔄 Auto-fetching contests...");
    const Contest = require("./models/Contest");
    const contests = await fetchContests();
    for (let contest of contests) {
      await Contest.findOneAndUpdate(
        { title: contest.title, platform: contest.platform },
        { $set: contest },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Successfully stored ${contests.length} contests in database`);
  } catch (error) {
    console.error("❌ Error auto-fetching contests:", error.message);
  }
};

/**
 * Daily job to fetch contests and solutions
 */
const setupCronJobs = () => {
  // Schedule a job to run at 10 PM (22:00) every day
  // Cron format: minute hour day-of-month month day-of-week
  console.log('📅 Setting up daily cron job to run at 10 PM');

  cron.schedule('0 22 * * *', () => {
    console.log("⏰ Running scheduled 10 PM data fetch via cron");
    fetchAndStoreContests();
    fetchSolutions();
  });

  // Add another job to run every 6 hours to ensure data is fresh
  cron.schedule('0 */6 * * *', () => {
    console.log("🔄 Running 6-hourly data refresh via cron");
    fetchAndStoreContests();
  });

  // Anti-sleep job: ping the server every 14 minutes to prevent Render from putting it to sleep
  cron.schedule('*/14 * * * *', async () => {
    try {
      const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
      console.log(`🔔 Pinging health endpoint to prevent sleep: ${serverUrl}/api/health`);
      const response = await axios.get(`${serverUrl}/api/health`);
      console.log(`✅ Health check response: ${response.status}`);
    } catch (error) {
      console.error('❌ Failed to ping health endpoint:', error.message);
    }
  });
};

/**
 * Check if we need to fetch data on startup
 */
const initialDataFetch = async () => {
  try {
    const Contest = require("./models/Contest");
    const count = await Contest.countDocuments();

    if (count === 0) {
      console.log("🆕 No contests in database, fetching initial data...");
      await fetchAndStoreContests();
      await fetchSolutions();
    } else {
      console.log(`📊 Database already contains ${count} contests, skipping initial fetch`);
    }
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
  }
};

/**
 * Configure routes
 */
const setupRoutes = () => {
  // Add a health check endpoint for monitoring services like UptimeRobot
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      message: 'Server is running',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });

  // Routes
  app.use("/api/contests", contestRoutes);

  // Catch-all route for API - return 404 for unknown routes
  app.get('*', (req, res) => {
    // Only handle non-API routes (in case frontend is served separately)
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
    } else {
      // For non-API routes, return 404 (frontend should handle routing)
      res.status(404).json({ error: 'Route not found' });
    }
  });
};

/**
 * Configure and start the server
 */
const startServer = async () => {
  try {
    // Connect to database first
    console.log("🔌 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected successfully");

    // Set up routes
    setupRoutes();

    // Start listening
    const PORT = process.env.PORT || 5000;
    
    // Check if port is available
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);

      // Set up cron jobs after server starts to ensure the health endpoint is available
      setupCronJobs();

      // Check for initial data
      initialDataFetch();
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please free the port or use a different port.`);
        console.error(`💡 Try: lsof -ti:${PORT} | xargs kill -9`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
