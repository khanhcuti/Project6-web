"use strict";


const mongoose = require('mongoose');
const { Schema, model } = mongoose;


const userSchema = new Schema({
    first_name: String,  
    last_name: String,   
    location: String,    
    description: String, 
    occupation: String,  
    login_name: String,  
    password: String     
});


const User = model('User', userSchema);


module.exports = User;
