const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const productSchema = new Schema({
    
    title: {
        type:String,
        require:true,
        unique:true
    },
    
    price: {
        type: Number,
        require:true,
        default: Date.now,
    },
    description:{
      type:String,
      //require:true,
    }
    
    imgURL: {
      type:String,
      //require:true,
    }
});

productSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('product', productSchema);