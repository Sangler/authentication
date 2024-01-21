const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    email: {
      type:String,
      require:true,
      unique:true
    },
    username:{
      type:String,
      unique:true
    },
    password:{
      require:true,
      type:String
    }
});

module.exports = mongoose.model('testuser', userSchema);
 
/*
    verification: {
        code: {
          type: String,
          required: true,
        },
        expiresAt: {
          type: Date,
          default: Date.now,
          expires: 600, // Set documents to expire after 600 seconds (10 minutes)
        },
      },
    phone:{
        type:Number,
        maxlength:10
    },
    membership:{
        type:Boolean,
        default:false
    },
    validator:{
        type:Boolean,
        default:false
    },

    subscription:{
      type:String,
      enum:[3,6,12,'Forever'],
      default:false
    }

    time: [
        {
          length: {
            type: Number,
            min:1,
            required: true,
          },
          unit_time: {
            type: String,
            required: true,
            default: function () {
              return this.length === 1 ? 'month' : 'months';
            },
          },
        },
      ],
*/