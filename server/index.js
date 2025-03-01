const express = require('express'); 
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB');
const userRoutes = require('./routes/userRoutes');
dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/user', userRoutes);

connectDB();
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});