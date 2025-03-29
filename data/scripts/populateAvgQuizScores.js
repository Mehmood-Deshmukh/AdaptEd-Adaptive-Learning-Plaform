const { MongoClient } = require("mongodb");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const DB_URI = process.env.DB_URI;
const DB_NAME = process.env.DB_NAME;

const COLLECTION_NAME = "users";

async function populateAvgQuizScores() {
  const client = new MongoClient(DB_URI);

  try {
    await client.connect();
    console.log("Connected to DB");

    const usersCollection = client.db(DB_NAME).collection(COLLECTION_NAME);
    const users = await usersCollection.find().toArray();

    const updatedUsers = users.map((user) => {
      user.avg_quiz_score = Math.random() * 10;
      return user;
    });

    console.log(updatedUsers[0]);

    for (const user of updatedUsers) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { avg_quiz_score: user.avg_quiz_score } }
      );
    }
  } catch (e) {
    console.error("Error inserting users:", e);
  } finally {
    await client.close();
    console.log("Disconnected from DB");
  }
}

populateAvgQuizScores();
