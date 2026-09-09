require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { initAutoReleaseJob } = require('./jobs/releaseJob');
const { seedDatabase } = require('./utils/seedData');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Automatically initializing rich demo dataset...');
      await seedDatabase();
    } else {
      console.log(`Database already populated with ${userCount} users.`);
    }

    // Initialize 24-hour Auto-Release cron job
    initAutoReleaseJob();

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🌾 FarmPay Server running at http://localhost:${PORT}`);
      console.log(`💳 Razorpay Escrow & Payment API: READY`);
      console.log(`⏱️ Auto-Release Deadline Engine: ACTIVE`);
      console.log(`🚀 DEMO_MODE: ${process.env.DEMO_MODE || 'true'}`);
      console.log(`=======================================================`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = () => {
      console.log('Stopping server gracefully...');
      server.close(() => {
        console.log('Server terminated cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('Failed to boot FarmPay server:', error.message);
    process.exit(1);
  }
};

startServer();
