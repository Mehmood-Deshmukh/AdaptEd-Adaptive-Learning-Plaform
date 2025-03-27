const express = require('express');
const router = express.Router();
const multer = require('multer');

const { uploadAvatar, getAvatar, deleteAvatar, updateAvatar } = require('../controllers/avtarController');
const authenticateUser = require("../middlewares/auth");

const upload = multer();

router.post('/upload', upload.single('avatar'), authenticateUser, uploadAvatar);
router.get('/download/:id', getAvatar);
router.post('/delete', authenticateUser, deleteAvatar);
router.post('/update', upload.single('avatar'), authenticateUser, updateAvatar);

module.exports = router;