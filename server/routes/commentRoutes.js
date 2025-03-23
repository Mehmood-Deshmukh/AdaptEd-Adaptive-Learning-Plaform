const express = require("express");
const router = express.Router();

const {
	getCommentsOnPost,
	getReplies,
	createComment,
} = require("../controllers/commentController");

router.get("/:postId", getCommentsOnPost);
router.get("/replies/:commentId", getReplies);
router.post("/create", createComment);

module.exports = router;