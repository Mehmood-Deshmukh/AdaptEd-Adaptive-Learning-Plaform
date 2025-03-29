const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");

const DB_URI = "mongodb+srv://yashbhosale0709:jm3ZDQTVpQG4YfMe@cluster0.olque.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0s/";
const DB_NAME = "prod";

const COLLECTION_NAME = "users";

async function pushUsers() {
	const client = new MongoClient(DB_URI);

	try {
		await client.connect();
		console.log("Connected to DB");

		const database = client.db(DB_NAME);
		const collection = database.collection(COLLECTION_NAME);

		const usersData = fs.readFileSync("../users.json");
		const users = JSON.parse(usersData);

		console.log(users[0].dateJoined.$date);
		const transformedUsers = users.map((user) => ({
			...user,
			_id: new ObjectId(user._id.$oid),
			roadmaps: user.roadmaps.map((roadmap) => new ObjectId(roadmap.$oid)),
			quizzes: user.quizzes.map((quiz) => new ObjectId(quiz.$oid)),
			dateJoined: new Date(user.dateJoined?.$date),
		}));

		const result = await collection.insertMany(transformedUsers);
		console.log(`\x1b[32mInserted ${result.insertedCount} users\x1b[0m`);
	} catch (e) {
		console.error("Error inserting users:", e);
	} finally {
		await client.close();
		console.log("Disconnected from DB");
	}
}

async function fixUsers() {
	const client = new MongoClient(DB_URI);
	try {
		await client.connect();
		console.log("Connected to DB");

		const database = client.db(DB_NAME);
		const collection = database.collection(COLLECTION_NAME);

		const users = await collection.find().toArray();

		for (const user of users) {
			if (typeof user._id === "string") {
				const updatedUser = {
					roadmaps: user.roadmaps.map((roadmap) =>
						new ObjectId(roadmap)
					),
					quizzes: user.quizzes.map((quiz) =>
						new ObjectId(quiz)
					),
				};

				await collection.updateOne(
					{ _id: new ObjectId(user._id) }, 
					{ $set: updatedUser }
				);

				console.log(`\x1b[32mUpdated user ${user.name}\x1b[0m`);
			}
		}
	} catch (e) {
		console.error("Error fixing users:", e);
	} finally {
		await client.close();
		console.log("Disconnected from DB");
	}
}

pushUsers();
// fixUsers();
