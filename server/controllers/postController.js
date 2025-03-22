const Post = require("../models/postModel")
const Community = require("../models/communityModel")

// update post route pending

async function getPosts(req,res) {
	try{
		const communityId = req.query.communityId;

		// fetch 10 posts at a time
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		let posts = [];
		const community = await Community.findById(communityId);

		// we can do something better here, may be better filtering
		// or sorting based on some criteria
		// or may be some search functionality
		if(community) {
			const postsArray = community.posts;
			posts = await Post.find({ _id: { $in: postsArray } }).sort({ createdAt: -1 }).skip(skip).limit(limit);
			res.status(200).json({
				success: true,
				message: "Posts fetched successfully!",
				data: posts
			});
		}else{
			posts = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
		}

		res.status(200).json({
			success: true,
			message: "Posts fetched successfully!",
			data: posts
		});
	}catch(error){
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Error getting posts: " + error.message,
			data: null
		});
	}
}

async function createPost(req, res) {
	try {
		const { title, description, author, tags, communityId } =  req.body;
		// const attachments = [];
		// attachments.push(req.file);
		let attachments = req.files;
		const community = await Community.findById(communityId);

		if(!community) {
			throw new Error("Community Not found!");
		}

		if(!attachments) {
			attachments = [];
		}

		const post = await Post.createPost(title, description, author, tags, attachments);
		community.posts.push(post._id);
		await community.save();

		res.status(201).json({
			success: true,
			message: "Post created succcessfully!",
			data: post
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Error creating post: " + error.message,
			data: null
		});
	}
}

async function deletePost(req, res) {
	try {
		const { postId } = req.body;
		const post = await Post.findById(postId);
		if(!post) {
			throw new Error("Post not found!");
		}

		if (req.userId !== post.author) {
			throw new Error("You are not authorized to delete this post!");
		}

		await post.remove();
		res.status(200).json({
			success: true,
			message: "Post deleted successfully!",
			data: null
		});
	}
	catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Error deleting post: " + error.message,
			data: null
		});
	}
}
		

async function upvotePost(req, res) {
	try {
		const { postId, userId } = req.body;
		const post = await Post.findById(postId);
		if(!post) {
			throw new Error("Post not found!");
		}

		if(post.upvotes.includes(userId)) {
			throw new Error("User already upvoted this post!");
		}
		post.upvotes.push(userId);

		if(post.downvotes.includes(userId)) {
			post.downvotes = post.downvotes.filter(id => id !== userId);
		}
		await post.save();

		res.status(200).json({
			success: true,
			message: "Post upvoted successfully!",
			data: post
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Error upvoting post: " + error.message,
			data: null
		});
	}
}

async function downvotePost(req, res) {
	try {
		const { postId, userId } = req.body;
		const post = await Post.findById(postId);
		if(!post) {
			throw new Error("Post not found!");
		}

		if(post.downvotes.includes(userId)) {
			throw new Error("User already downvoted this post!");
		}
		post.downvotes.push(userId);

		if(post.upvotes.includes(userId)) {
			post.upvotes = post.upvotes.filter(id => id !== userId);
		}
		await post.save();

		res.status(200).json({
			success: true,
			message: "Post downvoted successfully!",
			data: post
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Error downvoting post: " + error.message,
			data: null
		});
	}
}

module.exports = {
	getPosts,
	createPost,
	upvotePost,
	downvotePost,
	deletePost
}
