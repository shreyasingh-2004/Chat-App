const mongoose = require('mongoose');
console.log('Mongoose models:', Object.keys(mongoose.models));

// Check if User model is already defined
if (mongoose.models.User) {
  console.log('⚠️ User model already exists! This can cause issues');
  console.log('Model schema paths:', Object.keys(mongoose.models.User.schema.paths));
}