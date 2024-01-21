const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const user_OAUTH_Schema = new Schema({
    user_email:{
        type:String, 
        unique:true, 
        required:true
    },
    username: String,
    google_Id: {
        type:String, 
        unique:true, 
        required:true
    },
    location: String,
    picture: String
    
});
user_OAUTH_Schema.plugin(passportLocalMongoose);

//                               Collection        Schema
module.exports = mongoose.model('oauth_user', user_OAUTH_Schema);
