const express = require('express'); 
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB');

dotenv.config();
const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Hello World');
});

connectDB();
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});