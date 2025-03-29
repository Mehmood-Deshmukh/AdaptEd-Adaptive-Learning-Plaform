const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const resourcesSchema = require('./resourceModel');
const questionsSchema = require('./questionModel');
const {MongoClient} = require('mongodb');
const userModel = require('./userModel');
const axios = require('axios'); // Need to install this package
const dotenv = require('dotenv');
dotenv.config();
const DB_URI = process.env.DB_URI;
const DB_NAME = process.env.DB_NAME;

const requestSchema = new Schema({
  type: {
    type: String,
    enum: ['Resource', 'Quiz'],  
    required: true
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payload: {
    type: Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  feedback: {
    type: String,
    default: ''
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  confidenceReason: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true  
});


requestSchema.statics.createRequest = async function(requestData) {
  const request = await this.create(requestData);
  
  // After creating the request, generate and update the confidence score
  try {
    const confidenceData = await generateConfidenceScore(request);
    if (confidenceData && confidenceData.score !== undefined) {
      request.confidenceScore = confidenceData.score;
      request.confidenceReason = confidenceData.reason || '';
      await request.save();
    }
  } catch (error) {
    console.error('Error generating confidence score:', error);
    // Continue even if confidence score generation fails
  }
  
  return request;
};


requestSchema.statics.fetchAllRequests = async function() {
  return await this.find({}).populate('requestedBy').sort({ createdAt: -1 });
};


requestSchema.statics.fetchUserRequests = async function(userId) {
  return await this.find({ requestedBy: userId }).sort({ createdAt: -1 });
};


requestSchema.statics.approveRequest = async function(requestId) {
  const request = await this.findById(requestId);
  
  if (!request) {
    throw new Error('Request not found');
  }
  
  const client = new MongoClient(DB_URI);
  await client.connect();

  const database = client.db(DB_NAME);
  
  if (request.type === 'Resource') {
    const resource  = await resourcesSchema.createResource(request.payload);
    const collection = database.collection('resourcesFromCommunity');
    const result = await collection.insertOne(resource);
    console.log(`\x1b[32mInserted ${result.insertedCount} resources\x1b[0m`);
  } else if (request.type === 'Quiz') {
    await questionsSchema.createQuestion(request.payload);
    const collection = database.collection('questionsFromCommunity'); 
    const result = await collection.insertOne(request.payload);
    console.log(`\x1b[32mInserted ${result.insertedCount} questions\x1b[0m`);
  }

  const updatedRequest = await this.findByIdAndUpdate
  (requestId, { status: 'approved', updatedAt: Date.now() }, { new: true });
  await client.close();

  const user = await userModel.findById(request.requestedBy);
  user.contributions.push(updatedRequest._id);
  await user.save();
  return updatedRequest;
};


requestSchema.statics.rejectRequest = async function(requestId, feedback) {
  return await this.findByIdAndUpdate(requestId, 
    { status: 'rejected', feedback, updatedAt: Date.now() }, 
    { new: true }
  );
};

// Function to generate confidence score using Flask backend
async function generateConfidenceScore(request) {
  try {
    const FLASK_BACKEND_URL = process.env.FLASK_BASE_URL;
    
    const response = await axios.post(`${FLASK_BACKEND_URL}/api/generate-confidence-score`, {
      requestType: request.type,
      payload: request.payload,
      userId: request.requestedBy
    });
    
    if (response.data && response.data.success) {
      return {
        score: response.data.confidenceScore,
        reason: response.data.confidenceReason
      };
    }
    throw new Error('Invalid response from AI service');
  } catch (error) {
    console.error('Error calling Flask backend for confidence score:', error);
    throw error;
  }
}

module.exports = mongoose.model('Request', requestSchema);