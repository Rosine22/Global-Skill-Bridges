const mongoose = require('mongoose');
require('dotenv').config();

async function testLocalMongoConnection() {
  try {
    console.log('🔍 Testing Local MongoDB Connection...');
    console.log('📍 Connection URI:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Successfully connected to local MongoDB!');
    console.log('📊 Database name:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    console.log('📈 Connection state:', mongoose.connection.readyState);
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
      message: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('ConnectionTest', TestSchema);
    
    const testDoc = new TestModel({
      message: 'Local MongoDB connection test successful!'
    });
    
    await testDoc.save();
    console.log('💾 Test document created successfully!');
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🧹 Test document cleaned up');
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. Check if MongoDB service is started: net start MongoDB');
    console.log('3. Verify MongoDB is listening on port 27017');
    console.log('4. Try connecting with MongoDB Compass first');
  }
}

testLocalMongoConnection();