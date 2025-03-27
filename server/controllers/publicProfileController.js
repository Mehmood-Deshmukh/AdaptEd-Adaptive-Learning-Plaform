const User = require("../models/userModel");
const Roadmap = require("../models/roadmapModel");
const Post = require("../models/postModel");

// please note this is public controller so auth middleware will not be used
// so always access userId from params and not from req.userId

async function fetchPublicProfile(req, res) {
    try {
        const { userId } = req.params;

        // basic details
        const user = await User.findById(userId)
            .select("name _id followers following avg_quiz_score communities lastLoginDate currentStreak maxStreak createdAt level xps")
            .populate("communities", "name _id")
            .populate("followers", "name _id")
            .populate("following", "name _id");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User found",
            data: user,
            sucess: true,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function fetchPublicProfileRoadmaps(req, res) {
    try {
        const { userId } = req.params;
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 4;
        const skip = (page - 1) * limit;

        const user = await User.findById(userId)

        const roadmaps = user.roadmaps.reverse().slice(skip, skip + limit);

        const totalRoadmaps = user.roadmaps.length;
        const totalPages = Math.ceil(totalRoadmaps / limit);

        const roadmapsData = await Roadmap.find({ _id: { $in: roadmaps } })
            .populate({
                path: "checkpoints",
                model: "Checkpoint",
                populate: {
                    path: "resources",
                    model: "Resource"
                }
            });

        if (!roadmapsData) {
            return res.status(404).json({ message: "Roadmaps not found" });
        }

        return res.status(200).json({
            message: "Roadmaps found",
            data: {
                roadmaps: roadmapsData,
                totalRoadmaps,
                totalPages,
                currentPage: page,
            },
            success: true,
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

// i will be using quiz controller route for fetching public quizes
// getUserQuizzes()

async function fetchPublicPosts(req, res) {
    try {
        const { userId } = req.params;

        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "User not found"
            });
        }

        const posts = await Post.find({ author: userId })
            .populate("author", "name _id")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments({ author: userId });
        const totalPages = Math.ceil(totalPosts / limit);

        if (!posts) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "Posts not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                posts,
                totalPosts,
                totalPages,
                currentPage: page,
            },
            message: "Posts found"
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            data: null,
            message: "Internal server error" + e.message
        });
    }
}

module.exports = {
    fetchPublicProfile,
    fetchPublicProfileRoadmaps,
    fetchPublicPosts,
};