const { MongoClient , ObjectId} = require('mongodb');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const DB_URI = process.env.DB_URI;
const DB_NAME = process.env.DB_NAME;

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
            _id: new ObjectId(roadmap._id.$oid),
            userId: new ObjectId(roadmap.userId.$oid),
            checkpoints: roadmap.checkpoints.map(checkpoint => new ObjectId(checkpoint.$oid)),
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
