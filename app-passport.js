const express = require("express");
const app = express();
const path = require('path'); // Require the path module
const mongoose = require('mongoose');
const session  = require('express-session');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const flash = require('connect-flash');

//const crypto = require('crypto');
const passport = require('passport');

//const LocalStrategy = require('passport-local');
//const User = require('./models/index.js'); //mongoose schema
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const UserOAUTH = require('./models/oauth.js'); //mongoose schema

const router = require('./routers/user.js');
const PORT = 3000;
const keys = require('./utils/process-env.js');
const oauth = require("./models/oauth.js");

//Mongoose connection & Must have
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/testdb')
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
  secret: keys.sessions.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60,// * 24 * 7,
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
  clientID: keys.google.clientID,
  clientSecret: keys.google.clientSecret,
  callbackURL: '/google/redirect',
  scope: ['email','profile']
}, async function verify(accessToken, refreshToken, profile, done){
  try {
    console.log(`Email: ${profile.emails[0].value}`);
    const existingUser = await UserOAUTH.findOne({ google_Id: profile.id });

    if (existingUser) {
        done(null, existingUser);
        
    } else {
        const new_oauth_user = new UserOAUTH({
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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser( (id, done) => {
  UserOAUTH.findById(id).then((user)=>{done(null, id);})
});

//middleware

//Running router requests 
app.use('/', router);

//Catch all not found pages
app.get("*", (req,res) => {
  res.status(404).render("error.ejs") 
});

//RUN THE SERVER
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
});