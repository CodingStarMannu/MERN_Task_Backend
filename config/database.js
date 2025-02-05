require('dotenv').config();
const mongoose = require('mongoose');


const DB =process.env.MONGODB_URI;


mongoose.connect(DB);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error in connecting to MongoDB'));

db.once('open', function () {
	console.log('Connected to Database :: Mongodb');
});

module.exports = mongoose;