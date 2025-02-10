require('dotenv').config();
const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');
const PORT = process.env.PORT;

app.use(express.json(), cors());

app.get('/Search', async (req, res) => {
    try {
        
        return res.status(200).json();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
                
app.listen(PORT || 3000, () => {
    console.log(`Server is running on port 3000`);
});