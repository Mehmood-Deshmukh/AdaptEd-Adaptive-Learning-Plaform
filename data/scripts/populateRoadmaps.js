const { MongoClient } = require('mongodb');
const fs = require('fs');

// const DB_URI = 'mongodb://localhost:27017';
// const DB_NAME = 'inspiron25';

const DB_URI = 'mongodb+srv://yashbhosale0709:jm3ZDQTVpQG4YfMe@cluster0.olque.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0s';
const DB_NAME = 'test';

const COLLECTION_NAME = 'roadmaps';

async function pushRoadmaps() {
    const client = new MongoClient(DB_URI);
    try {
        await client.connect();
        console.log('Connected to DB');

        const database = client.db(DB_NAME);
        const collection = database.collection(COLLECTION_NAME);

        const roadmapsData = fs.readFileSync('../roadmaps.json');
        const roadmaps = JSON.parse(roadmapsData);

        const transformedRoadmaps = roadmaps.map(roadmap => ({
            ...roadmap,
            _id: roadmap._id.$oid,
            userId: roadmap.userId.$oid,
            checkpoints: roadmap.checkpoints.map(checkpoint => checkpoint.$oid),
            createdAt: new Date(roadmap.createdAt.$date),
            updatedAt: new Date(roadmap.updatedAt.$date)
        }));

        const result = await collection.insertMany(transformedRoadmaps);
        console.log(`\x1b[32mInserted ${result.insertedCount} roadmaps\x1b[0m`);
    } catch (e) {
        console.error('Error inserting roadmaps:', e);
    } finally {
        await client.close();
        console.log('Disconnected from DB');
    }
}

pushRoadmaps();
