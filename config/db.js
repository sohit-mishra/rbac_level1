const mongoose = require('mongoose');
require('dotenv').config();
const URL = process.env.MONGODBURI;

const connectToDatabase = async()=>{
    try {
        await mongoose.connect(URL);
        console.log("Database is Connect Successfully");
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectToDatabase;