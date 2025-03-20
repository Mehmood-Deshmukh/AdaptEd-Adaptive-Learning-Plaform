const express = require('express'); 
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/connectDB');
const userRoutes = require('./routes/userRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const quizRoutes = require('./routes/quizRoutes');
const projectRoutes = require('./routes/projectRoutes');
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
app.use('/api/projects', projectRoutes);


connectDB();
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});