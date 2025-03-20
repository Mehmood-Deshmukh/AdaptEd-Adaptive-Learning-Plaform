const { MongoClient } = require('mongodb');
const fs = require('fs');

const DB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'inspiron25';

const COLLECTION_NAME = 'users';

async function pushUsers() {
  const client = new MongoClient(DB_URI);

  try {
    await client.connect();
    console.log('Connected to DB');

    const database = client.db(DB_NAME);
    const collection = database.collection(COLLECTION_NAME);

    const usersData = fs.readFileSync('../users.json');
    const users = JSON.parse(usersData);

    console.log(users[0].dateJoined.$date);
    const transformedUsers = users.map(user => ({
      ...user,
      _id: user._id.$oid,
      roadmaps: user.roadmaps.map(roadmap => roadmap.$oid),
      quizzes: user.quizzes.map(quiz => quiz.$oid),
      dateJoined: new Date(user.dateJoined?.$date),
    }));

    const result = await collection.insertMany(transformedUsers);
    console.log(`\x1b[32mInserted ${result.insertedCount} users\x1b[0m`);
  } catch (e) {
    console.error('Error inserting users:', e);
  } finally {
    await client.close();
    console.log('Disconnected from DB');
  }
}

pushUsers();
