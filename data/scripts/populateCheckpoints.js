const { MongoClient } = require('mongodb');
const fs = require('fs');

const DB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'inspiron25';
const COLLECTION_NAME = 'checkpoints';

async function pushCheckpoints() {
    const client = new MongoClient(DB_URI);
    try {
        await client.connect();
        console.log('Connected to DB');

        const database = client.db(DB_NAME);
        const collection = database.collection(COLLECTION_NAME);

        const checkpointsData = fs.readFileSync('../checkpoints.json');
        const checkpoints = JSON.parse(checkpointsData);

        const transformedCheckpoints = checkpoints.map(checkpoint => ({
            ...checkpoint,
            _id: checkpoint._id.$oid,
            resources: checkpoint.resources.map(resource => resource.$oid),
            completedAt: checkpoint.completedAt ? new Date(checkpoint.completedAt.$date) : null
        }));

        const result = await collection.insertMany(transformedCheckpoints);
        console.log(`\x1b[32mInserted ${result.insertedCount} checkpoints\x1b[0m`);
    } catch (e) {
        console.error('Error inserting checkpoints:', e);
    } finally {
        await client.close();
        console.log('Disconnected from DB');
    }
}

pushCheckpoints();