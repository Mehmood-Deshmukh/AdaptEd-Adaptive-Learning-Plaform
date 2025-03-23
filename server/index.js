const express = require('express'); 
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/connectDB');
const userRoutes = require('./routes/userRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const quizRoutes = require('./routes/quizRoutes');
const postRoutes = require('./routes/postRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const communityRoutes = require("./routes/communityRoutes");
const projectRoutes = require('./routes/projectRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/user', userRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/post', postRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/admin', adminRoutes);

connectDB();
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});