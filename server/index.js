const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/connectDB");
const userRoutes = require("./routes/userRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const quizRoutes = require("./routes/quizRoutes");
const postRoutes = require("./routes/postRoutes");
const attachmentRoutes = require("./routes/attachmentRoutes");
const communityRoutes = require("./routes/communityRoutes");
const projectRoutes = require("./routes/projectRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");
const commentRoutes = require("./routes/commentRoutes");
const achievementRoutes = require('./routes/achievementRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const xpRoutes = require('./routes/xpRoutes');
const publicProfileRoutes = require('./routes/publicProfileRoutes');
const avtarRoutes = require('./routes/avtarRoutes');

const { initializeAchievements, setupEventListeners } = require('./services/achievementService');
const { setupXpEventListeners } = require('./services/xpService');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT;

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.use("/api/user", userRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/post", postRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/comment", commentRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/xp', xpRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/publicprofile', publicProfileRoutes);
app.use('/api/avatar', avtarRoutes);

connectDB();

(async () => {
    try {
      await initializeAchievements();
      setupEventListeners();
      setupXpEventListeners();
    console.log('Achievement and XP systems initialized successfully');
    } catch (error) {
      console.error('Failed to initialize achievement system:', error);
    }
  })();

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});





