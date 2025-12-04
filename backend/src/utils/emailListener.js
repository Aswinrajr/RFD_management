require('dotenv').config();
const mongoose = require('mongoose');
const emailService = require('../services/emailService');
const proposalController = require('../controllers/proposalController');

console.log('==============================================');
console.log('📧 RFP Email Listener - Starting...');
console.log('==============================================\n');

async function startEmailListener() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${process.env.MONGODB_URI.split('/').pop()}`);

    // Verify email configuration
    console.log('\n📮 Email Configuration:');
    console.log(`   IMAP Host: ${process.env.IMAP_HOST}`);
    console.log(`   IMAP Port: ${process.env.IMAP_PORT}`);
    console.log(`   IMAP User: ${process.env.IMAP_USER}`);
    console.log(`   Status: ${process.env.IMAP_USER && process.env.IMAP_PASSWORD ? '✅ Configured' : '❌ Missing credentials'}`);

    if (!process.env.IMAP_USER || !process.env.IMAP_PASSWORD) {
      console.error('\n❌ Error: Email credentials not configured in .env file');
      console.log('Please set IMAP_USER and IMAP_PASSWORD in your .env file\n');
      process.exit(1);
    }

    console.log('\n🎧 Starting email listener...');
    console.log('Waiting for incoming vendor responses...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Start the email listener with callback
    emailService.startEmailListener(async (emailData) => {
      try {
        console.log('📨 New email received!');
        console.log(`   From: ${emailData.from}`);
        console.log(`   Subject: ${emailData.subject}`);
        console.log(`   Date: ${emailData.date}`);
        console.log('\n🤖 Processing with AI...\n');

        await proposalController.processVendorResponse(emailData);

        console.log('✅ Email processed successfully');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } catch (error) {
        console.error('❌ Error processing email:', error.message);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
    });

    console.log('✅ Email listener is now active');
    console.log('Press Ctrl+C to stop\n');

    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Shutting down email listener...');
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
      console.log('👋 Email listener stopped\n');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Start the listener
startEmailListener();
