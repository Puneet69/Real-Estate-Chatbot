// MongoDB initialization script for Docker
// This script creates the initial database structure

db = db.getSiblingDB('real_estate_db');

// Create a user for the application
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'real_estate_db'
    }
  ]
});

// Create initial collections
db.createCollection('favorites');
db.createCollection('properties');

// Insert sample data if needed
db.favorites.createIndex({ "user": 1, "propertyId": 1 }, { unique: true });

print('Database initialized successfully!');