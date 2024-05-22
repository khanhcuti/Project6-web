"use strict";



var mongoose = require('mongoose');


var commentSchema = new mongoose.Schema({
    comment: String,     
    date_time: {type: Date, default: Date.now}, 
    user_id: mongoose.Schema.Types.ObjectId,   
    
});


var photoSchema = new mongoose.Schema({
    file_name: String, 
    date_time: {type: Date, default: Date.now}, 
    user_id: mongoose.Schema.Types.ObjectId, 
    comments: [commentSchema] 
});



var Photo = mongoose.model('Photo', photoSchema);


module.exports = Photo;
