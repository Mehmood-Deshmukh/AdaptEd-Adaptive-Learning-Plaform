const express = require("express");
const router = express.Router();
const multer = require("multer");

const authenticateUser = require("../middlewares/auth.js");
const {
	getPosts,
	createPost,
	upvotePost,
	downvotePost,
	deletePost,
} = require("../controllers/postController");
const upload = multer();

router.get("/", getPosts);
router.post(
    "/create",
	upload.array("attachments"),
	authenticateUser,
	createPost
); // maximum of 5 files can be uploaded
router.delete("/delete", authenticateUser, deletePost);
router.post("/upvote", authenticateUser, upvotePost);
router.post("/downvote", authenticateUser, downvotePost);

module.exports = router;
