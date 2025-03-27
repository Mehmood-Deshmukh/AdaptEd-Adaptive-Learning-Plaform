const User = require("../models/userModel");
const Roadmap = require("../models/roadmapModel");
const Post = require("../models/postModel");
const Community = require("../models/communityModel");

// please note this is public controller so auth middleware will not be used
// so always access userId from params and not from req.userId

async function search(req, res) {
    try {
        const searchQuery = req.query.query || "";
        const entityType = req.query.type || "all"; // 'communities', 'users', or 'all'

        if (!searchQuery.trim()) {
            return res.json({ success: true, data: [] });
        }

        let searchResults = [];

        const searchRegex = new RegExp(searchQuery, "i");

        switch (entityType) {
            case 'communities':
                searchResults = await Community.find(
                    { name: searchRegex },
                    { _id: 1, name: 1, membersCount: 1, type: "community" }
                )
                    .limit(3)
                    .lean();
                break;

            case 'users':
                searchResults = await User.find(
                    { name: searchRegex },
                    { _id: 1, name: 1, followers: 1, following: 1, type: "user" }
                )
                    .limit(4)
                    .lean();
                break;

            case 'all':
            default:
                const [communities, users] = await Promise.all([
                    Community.find(
                        { name: searchRegex },
                        { _id: 1, name: 1, membersCount: 1, type: "community" }
                    )
                        .limit(5)
                        .lean(),
                    User.find(
                        { name: searchRegex },
                        { _id: 1, name: 1, type: "user", followers: 1, following: 1 }
                    )
                        .limit(5)
                        .lean()
                ]);

                searchResults = [...communities, ...users];
                break;
        }

        res.json({
            success: true,
            message: "Entities fetched successfully",
            data: searchResults
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({
            success: false,
            error: "Server error during search",
            details: error.message
        });
    }
}

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
            .populate("community", "name _id")
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
    search,
};