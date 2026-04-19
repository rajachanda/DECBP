const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MOCK_USERS_COUNT = 200;
const DB_MONGO_URL = process.env.DB_MONGO_URL;
if (!DB_MONGO_URL) throw new Error("Missing DB_MONGO_URL in .env");

const roles = ['admin', 'editor', 'viewer'];
const statuses = ['active', 'invited', 'suspended'];
const names = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUsers(count) {
  const users = [];
  for (let i = 1; i <= count; i++) {
    const firstName = getRandomItem(names);
    users.push({
      id: `u${i}`,
      name: `${firstName} ${i}`,
      email: `${firstName.toLowerCase()}${i}@example.com`,
      role: getRandomItem(roles),
      status: getRandomItem(statuses),
      // Adding some analytics multipliers/base metrics for the dashboard
      baseFollowers: Math.floor(Math.random() * 100000) + 1000,
      engagementRate: (Math.random() * 10).toFixed(2),
      avgViewsPerPost: Math.floor(Math.random() * 50000) + 500,
      totalPosts: Math.floor(Math.random() * 1000) + 10,
      avgCommentsPerPost: Math.floor(Math.random() * 500) + 5,
      avgLikesPerPost: Math.floor(Math.random() * 5000) + 50,
      highestViews: Math.floor(Math.random() * 500000) + 10000,
      highestLikes: Math.floor(Math.random() * 50000) + 1000,
      highestComments: Math.floor(Math.random() * 5000) + 100,
    });
  }
  return users;
}

async function run() {
  console.log(`Generating ${MOCK_USERS_COUNT} mock users...`);
  const users = generateUsers(MOCK_USERS_COUNT);

  // Write to CSV
  const csvHeaders = ['id', 'name', 'email', 'role', 'status', 'baseFollowers', 'engagementRate', 'avgViewsPerPost', 'totalPosts', 'avgCommentsPerPost', 'avgLikesPerPost', 'highestViews', 'highestLikes', 'highestComments'];
  const csvContent = [
    csvHeaders.join(','),
    ...users.map(u => csvHeaders.map(header => u[header]).join(','))
  ].join('\n');
  
  const csvPath = path.resolve(__dirname, '../users_data.csv');
  fs.writeFileSync(csvPath, csvContent);
  console.log(`Created CSV file at ${csvPath}`);

  // Migrate to MongoDB
  let client;
  try {
    console.log(`Connecting to MongoDB...`);
    client = new MongoClient(DB_MONGO_URL);
    await client.connect();
    console.log(`Connected successfully!`);

    const db = client.db('social_dashboard');
    const collection = db.collection('users');

    // Clear existing to avoid massive dupes when re-running
    await collection.deleteMany({});
    
    // Insert new
    const result = await collection.insertMany(users);
    console.log(`Migrated ${result.insertedCount} users into MongoDB 'social_dashboard.users' collection.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

run();