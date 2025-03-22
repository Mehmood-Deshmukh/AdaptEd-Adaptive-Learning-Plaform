const User = require('../models/userModel');
const Quiz = require('../models/quizModel');
const Resource = require('../models/resourceModel');
const Request = require('../models/requestModel');

const postRequest = async(req,res) => {
    try{
        const userId = req.params.userId;
        const {type, payload} = req.body;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        console.log(type, payload, userId);

        const request = new Request({
            type,
            requestBy: userId,
            payload,
        });

        await request.save();
        res.status(200).json({message : "request send successfully", request : request})

    }
    catch(e){
        res.status(500).json({message : e.message});
    }
}

const getAllRequest = async(req,res) => {
    try{
        const requests = await Request.find({ status: "pending" }).populate('requestBy', 'email').sort({ postedOn: 1 });
        res.status(200).json(requests);
    }
    catch(e){
        res.status(500).json({message : e.message});
    }
}

const giveFeedback = async(req,res) => {
    try{
        const userId = req.params.userId;
        const request = await Request.findOne({ requestBy: userId });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const {feedback, status } = req.body;
        request.feedback = feedback
        request.status = status

        //if status == 'approved' add to db 

        await request.save();
        res.status(200).json({message : "feedback given successfully", request})

    }
    catch(e){
        res.status(500).json({message : e.message});
    }
}

const getFeedback = async(req,res) => {
    try{
        const userId = req.params.userId;
        const request = await Request.findOne({ requestBy: userId });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json({message : "feedback displayed successfully", request})

    }
    catch(e){
        res.status(500).json({message : e.message});
    }
}

module.exports = {
    postRequest,
    getAllRequest,
    giveFeedback,
    getFeedback
}