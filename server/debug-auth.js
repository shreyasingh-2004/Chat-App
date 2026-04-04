const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Test 1: Check environment
console.log('=== TEST 1: Environment Check ===');
console.log('Node version:', process.version);
console.log('MongoDB URI:', process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp');
console.log('');

// Test 2: Check Mongoose version
console.log('=== TEST 2: Mongoose Version ===');
console.log('Mongoose version:', require('mongoose/package.json').version);
console.log('');

// Test 3: Test basic bcrypt functionality
console.log('=== TEST 3: Bcrypt Functionality ===');
try {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('test123', salt);
  const compare = bcrypt.compareSync('test123', hash);
  console.log('Bcrypt working:', compare ? '✅ Yes' : '❌ No');
} catch (err) {
  console.error('Bcrypt error:', err);
}
console.log('');

// Test 4: Test User Model with different patterns
async function testUserModel() {
  console.log('=== TEST 4: User Model Patterns ===');
  
  // Pattern 1: Callback style
  const schema1 = new mongoose.Schema({ name: String, password: String });
  schema1.pre('save', function(next) {
    if (!this.isModified('password')) return next();
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return next(err);
      bcrypt.hash(this.password, salt, (err, hash) => {
        if (err) return next(err);
        this.password = hash;
        next();
      });
    });
  });
  console.log('Pattern 1 (callback):', schema1.pre('save') ? '✅ Valid' : '❌ Invalid');
  
  // Pattern 2: Async/await without next
  const schema2 = new mongoose.Schema({ name: String, password: String });
  schema2.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });
  console.log('Pattern 2 (async/await):', schema2.pre('save') ? '✅ Valid' : '❌ Invalid');
  
  // Pattern 3: Promise style
  const schema3 = new mongoose.Schema({ name: String, password: String });
  schema3.pre('save', function() {
    if (!this.isModified('password')) return;
    return bcrypt.genSalt(10)
      .then(salt => bcrypt.hash(this.password, salt))
      .then(hash => { this.password = hash; });
  });
  console.log('Pattern 3 (promise):', schema3.pre('save') ? '✅ Valid' : '❌ Invalid');
  
  console.log('');
}

// Test 5: Actual database test
async function testDatabaseOperation() {
  console.log('=== TEST 5: Database Operation ===');
  
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp_test');
    console.log('✅ Database connected');
    
    // Clear test collection
    await mongoose.connection.db.dropCollection('users').catch(() => {});
    
    // Define and create model
    const testSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String
    });
    
    // Use callback pattern (most reliable)
    testSchema.pre('save', function(next) {
      const user = this;
      if (!user.isModified('password')) return next();
      
      bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) return next(err);
          user.password = hash;
          next();
        });
      });
    });
    
    const TestUser = mongoose.model('TestUser', testSchema);
    
    // Create test user
    const user = new TestUser({
      name: 'Test',
      email: 'test@test.com',
      password: '123456'
    });
    
    await user.save();
    console.log('✅ User saved successfully');
    console.log('Password stored:', user.password);
    console.log('Is hashed:', user.password.startsWith('$2a$') ? '✅ Yes' : '❌ No');
    
    // Clean up
    await mongoose.connection.db.dropCollection('users');
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Test 6: Check for Event Listeners Conflict
function testEventListeners() {
  console.log('\n=== TEST 6: Event Listeners ===');
  const listeners = process.listeners('uncaughtException');
  console.log('Uncaught exception listeners:', listeners.length);
  
  process.on('unhandledRejection', (reason) => {
    console.log('Unhandled rejection:', reason);
  });
}

// Run all tests
async function runAllTests() {
  await testUserModel();
  await testDatabaseOperation();
  testEventListeners();
}

runAllTests();