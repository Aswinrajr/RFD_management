require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');

const sampleVendors = [
  {
    name: 'Tech Solutions Ltd',
    email: 'contact@techsolutions.com',
    company: 'Tech Solutions Ltd',
    phone: '+1-555-0101',
    specialization: 'IT Equipment & Software',
    address: '123 Tech Street, San Francisco, CA 94102',
    status: 'active'
  },
  {
    name: 'Office Supplies Co',
    email: 'sales@officesupplies.com',
    company: 'Office Supplies Co',
    phone: '+1-555-0202',
    specialization: 'Office Furniture & Supplies',
    address: '456 Business Ave, New York, NY 10001',
    status: 'active'
  },
  {
    name: 'Global Hardware Inc',
    email: 'info@globalhardware.com',
    company: 'Global Hardware Inc',
    phone: '+1-555-0303',
    specialization: 'Computer Hardware',
    address: '789 Enterprise Blvd, Austin, TX 78701',
    status: 'active'
  },
  {
    name: 'Industrial Equipment Pro',
    email: 'orders@industrialequip.com',
    company: 'Industrial Equipment Pro',
    phone: '+1-555-0404',
    specialization: 'Industrial & Manufacturing Equipment',
    address: '321 Factory Lane, Detroit, MI 48201',
    status: 'active'
  },
  {
    name: 'Smart Tech Distributors',
    email: 'vendors@smarttech.com',
    company: 'Smart Tech Distributors',
    phone: '+1-555-0505',
    specialization: 'Electronics & Smart Devices',
    address: '555 Innovation Dr, Seattle, WA 98101',
    status: 'active'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing vendors (optional - comment out if you want to keep existing data)
    // await Vendor.deleteMany({});
    // console.log('Cleared existing vendors');

    // Insert sample vendors
    const vendors = await Vendor.insertMany(sampleVendors);
    console.log(`✅ Successfully seeded ${vendors.length} vendors`);

    // Display seeded vendors
    console.log('\n📋 Seeded Vendors:');
    vendors.forEach((vendor, index) => {
      console.log(`\n${index + 1}. ${vendor.name}`);
      console.log(`   Company: ${vendor.company}`);
      console.log(`   Email: ${vendor.email}`);
      console.log(`   Phone: ${vendor.phone}`);
      console.log(`   Specialization: ${vendor.specialization}`);
    });

    console.log('\n✨ Database seeding completed successfully!');
    console.log('You can now use these vendors to test the RFP system.\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
