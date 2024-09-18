const express = require("express");
const app = express();
const path = require('path'); // Require the path module
const mongoose = require('mongoose');
const session  = require('express-session');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

const passport = require('passport');

//const LocalStrategy = require('passport-local');
//const User = require('./models/index.js'); //mongoose schema
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const GgUserOAUTH = require('./models/oauthGoogle.js'); //Google mongoose schema
const FBUserOAUTH = require('./models/oauthFacebook.js'); //Facebook mongoose schema

const router = require('./routers/user.js');
const testRouter = require("./routers/loged_in_users.js");
const PORT = 7070


const keys = require('./utils/process-env.js');

//Or using dotenv package to store keys_id and secret keys
require('dotenv').config()
console.log(process.env) 


//Mongoose connection & set-up
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/carddb')
.then(data=>{
  console.log('Attach schema')
})
.catch(err =>{
  console.log(err)
});
//Set up connection using mongoose
const db = mongoose.connection;
db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('Connected to MongoDB'));


app.engine('ejs', ejsMate)
// Set the view engine to EJS
app.set('view engine', 'ejs');
// Set the views directory to your "template" directory
app.set('views', path.join(__dirname, 'template'));

// Sessions
const sessionConfig = {
  secret: keys.sessions.secret, //process.env.cookie_Sessions
  resave: false,
  saveUninitialized: false,
  cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60* 60,// * 24 * 7,
      maxAge: 1000 * 60 * 60//* 60 * 24 * 7
  }
}
app.use(session(sessionConfig));

//Use packages
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
//set static directory (CSS apply)
app.use(express.static('static')); //middleware will listen for any requests

//using passport
app.use(passport.initialize());
app.use(passport.session());


passport.use(new GoogleStrategy({
  clientID: keys.google.clientID, //process.env.googleClientID
  clientSecret: keys.google.clientSecret,//process.env.googleClientSecret
  callbackURL: '/login/google/redirect',
  scope: ['email','profile']
}, async function verify(accessToken, refreshToken, profile, done){
  try {
    console.log(`Email: ${profile.emails}`);
    const existingUser = await GgUserOAUTH.findOne({ google_Id: profile.id });

    if (existingUser) {
        done(null, existingUser);
        
    } else {
        const new_oauth_user = new GgUserOAUTH({

            user_email: profile.emails[0].value.toString(),
            username: profile.displayName,
            google_Id: profile.id,
            picture: profile.photos[0].value,
            location: profile._json.locale
        });
        await new_oauth_user.save();
        done(null, new_oauth_user);
    }
} catch (error) {
    console.error('Google OAuth Error:', error);

    // Handle the error by passing it to the done callback
    done(error);
}
}));



passport.use(new FacebookStrategy({
  clientID: keys.facebook.App_ID, //process.env.facebookAppID
  clientSecret: keys.facebook.App_secret, ///process.env.facebookAppSecret
  callbackURL: '/login/facebook/callback', // The redirect URL after successful authentication
  profileFields: ['id', 'emails', 'displayName', 'photos', 'locale'] // Specify the fields you need
}, async (accessToken, refreshToken, profile, done) => {
  try {
          // Check if the user exists in your database
    const existingUser = await FBUserOAUTH.findOne({ facebook_Id: profile.id });

    if (existingUser) {
      // User already exists, update the last login date and return the user
      existingUser.lastLoginAt = new Date();
      await existingUser.save();
      done(null, existingUser);
    } else {
      // Create a new user if not exists
      const new_oauth_user = new FBUserOAUTH({
        username: profile.displayName,
        FB_ID: profile.id,
        picture: profile.photos ? profile.photos[0].value : null,
        location: profile._json.locale,
        createdAt: new Date(),
        lastLoginAt: new Date() // Set last login date for a new user
      });

      await new_oauth_user.save();
      done(null, new_oauth_user); // Return the new user
    }

  } catch (error) {
      console.error('Facebook OAuth Error:', error);
      done(error); // Pass the error to done
  }
}));



passport.serializeUser((user, done) => {
  //this comes from req.session.passport.user (ObjectID in mongodb)
  done(null, user.id);
});

passport.deserializeUser( async(id, done) => {
  try {
    const userGoogle = await GgUserOAUTH.findById(id);
    const userFacebook = await FBUserOAUTH.findById(id);
  //check if valid object (req.session.passport.user)

    if (userGoogle) {
      done(null, userGoogle);
    } else if (userFacebook) {
      done(null, userFacebook);
    } else {
      done(new Error('User not found in either schema'));
    }
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error);
  }
});

//Middlewares
//Running router requests 
app.use('/', router);
app.use('/test/', testRouter);

//Catch all not found pages
app.get("*", (req,res) => {
  res.status(404).render("error.ejs") 
});
/*

*/
const server = http.createServer((req,res)=>{
  res.end("connected!")

});
// server.listen(PORT)

//RUN THE SERVER
app.listen(PORT, () => {
  
  console.log(`http://localhost:${PORT}`)
});
