const { MongoClient } = require('mongodb');
const fs = require('fs');

const DB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'inspiron25';
const COLLECTION_NAME = 'resourcesFromCommunity';

async function pushResources() {
  const client = new MongoClient(DB_URI);
  try {
    await client.connect();
    console.log('Connected to DB');
    
    const database = client.db(DB_NAME);
    const collection = database.collection(COLLECTION_NAME);

    collection.deleteMany({});
    console.log('Deleted all documents from collection');
    
    
    const resourcesData = fs.readFileSync('../updated-resources.json');
    const updatedResource = JSON.parse(resourcesData);

    const resources = [];
    let count = 0;

    for (const category in updatedResource) {
      
      updatedResource[category].forEach(resource => {
        
        const formattedResource = {
          name: resource.title,
          url: resource.url,
          type: resource.type,
          tags: resource.tags,
          difficulty: resource.difficulty,
          topics: resource.topics,
          description: resource.description
        };
        resources.push(formattedResource);
        count++;
      });
    }
    
    console.log(`Found ${count} resources to insert`);
    

    const result = await collection.insertMany(resources);
    console.log(`\x1b[32mInserted ${result.insertedCount} resources\x1b[0m`);

    
  } catch (e) {
    console.error('Error inserting resources:', e);
  } finally {
    await client.close();
    console.log('Disconnected from DB');
  }
}

pushResources();