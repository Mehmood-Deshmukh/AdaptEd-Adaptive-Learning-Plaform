const express = require("express");
const router = express.Router();
const multer = require("multer");

const authenticateUser = require("../middlewares/auth.js");
const { createPost } = require("../controllers/postController");
const upload = multer();

router.post("/create", upload.array("attachments"), authenticateUser, createPost); // maximum of 5 files can be uploaded

module.exports = router;