const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const dotenv = require("dotenv")

dotenv.config();

const DB_URI = process.env.DB_URI;
const DB_NAME = process.env.DB_NAME;

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
            _id: new ObjectId(checkpoint._id.$oid),
            resources: checkpoint.resources.map(resource => new ObjectId(resource.$oid)),
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
