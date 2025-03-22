const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/auth");

const {
	getCommunities,
	createCommunity,
	getCommunity,
	searchCommunities
} = require("../controllers/communityController");

router.get("/", authenticateUser, getCommunities);
router.get("/search", authenticateUser, searchCommunities);
router.get("/:id", authenticateUser, getCommunity);
router.post("/create", authenticateUser, createCommunity);

module.exports = router;
