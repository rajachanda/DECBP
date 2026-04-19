const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MOCK_POSTS_COUNT = 1000;
const DB_MONGO_URL = process.env.DB_MONGO_URL;
if (!DB_MONGO_URL) throw new Error("Missing DB_MONGO_URL in .env");

const platforms = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok'];

async function run() {
  console.log(`Starting post generation process...`);

  let client;
  try {
    console.log(`Connecting to MongoDB...`);
    client = new MongoClient(DB_MONGO_URL);
    await client.connect();
    console.log(`Connected successfully!`);

    const db = client.db('social_dashboard');
    const usersCollection = db.collection('users');
    const postsCollection = db.collection('posts');

    // Fetch existing users
    console.log(`Fetching existing users...`);
    const users = await usersCollection.find({}).toArray();
    if (users.length === 0) {
      console.log(`No users found in the database. Please run generate_users.js first.`);
      return;
    }
    console.log(`Found ${users.length} users.`);

    // Generate posts for these users
    console.log(`Generating ${MOCK_POSTS_COUNT} mock posts for existing users...`);
    
    const sampleComments = [
      "This is a game changer! ??",
      "I completely agree with this.",
      "Thanks for sharing, really helpful.",
      "Just tried this out and it works perfectly.",
      "Wow, the UI looks amazing ??",
      "Can you share more details on how you did this?",
      "Absolutely love the analytics integration.",
      "Great job team!",
      "Not sure I agree, but interesting perspective.",
      "Been waiting for a feature like this!",
      "So clean and fast. Excellent work.",
      "Is this open source?",
      "Next.js and MongoDB is the best combo.",
      "This exactly solves a problem I had yesterday.",
      "Let's go!! Such an awesome update."
    ];

    const posts = [];
    for (let i = 1; i <= MOCK_POSTS_COUNT; i++) {
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const likes = Math.floor(Math.random() * 5000);
        const shares = Math.floor(Math.random() * 500);
        const numComments = Math.floor(Math.random() * 50);
        const comments = [];
        for(let j = 0; j < numComments; j++){
           // Pick a random comment from our list
           comments.push(sampleComments[Math.floor(Math.random() * sampleComments.length)]);
        }

        const hashtags = ['#social', '#media', '#dashboard', '#growth', '#tech', '#react', '#analytics'].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1);
        
        // Pick a random user from the database
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        posts.push({
          postId: `post-${String(i).padStart(3, '0')}`,
          userId: randomUser.id,
          userName: randomUser.name, // Use actual proper name from DB
          platform,
          content: `Just deployed our new React dashboard with real-time analytics for ${platform}. #${i}`,
          hashtags,
          likes,
          shares,
          comments,
          // Random date over the last year
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 31536000000))
        });
    }

    // Clear existing posts
    await postsCollection.deleteMany({});
    
    // Insert new
    const result = await postsCollection.insertMany(posts);
    console.log(`Migrated ${result.insertedCount} posts into MongoDB 'social_dashboard.posts' collection.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

run();
