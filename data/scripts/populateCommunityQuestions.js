const { MongoClient } = require('mongodb');
const fs = require('fs');

const DB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'inspiron25';
const COLLECTION_NAME = 'questionsFromCommunity';

async function pushResources() {
  const client = new MongoClient(DB_URI);
  try {
    await client.connect();
    console.log('Connected to DB');
    
    const database = client.db(DB_NAME);
    const collection = database.collection(COLLECTION_NAME);

    collection.deleteMany({});
    console.log('Deleted all documents from collection');
    
    
    const questionsData = fs.readFileSync('../inspiron25.questions.json');
    const questions = JSON.parse(questionsData);

    const transformedQuestions = questions.map(question => ({
      ...question,
      _id: question._id.$oid,
    }));

    const result = await collection.insertMany(transformedQuestions);
    console.log(`\x1b[32mInserted ${result.insertedCount} Questions\x1b[0m`);

    
  } catch (e) {
    console.error('Error inserting resources:', e);
  } finally {
    await client.close();
    console.log('Disconnected from DB');
  }
}

pushResources();