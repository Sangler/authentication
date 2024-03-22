const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const user_OAUTH_Schema = new Schema({

    username: String,
    FB_ID:{
        type: String,
        required: false, 
        unique: true 
    },

    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    lastLoginAt: { 
        type: Date, 
        default: null 
    },
    location: String,
    picture: String
    
});

user_OAUTH_Schema.plugin(passportLocalMongoose);

//                                  Collection        Schema
module.exports = mongoose.model('cardUserFacebook', user_OAUTH_Schema);
