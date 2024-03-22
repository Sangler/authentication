const express = require("express");
const passport = require('passport');
const User = require('../models/index.js'); // mongo schema

const GgUserOAUTH = require('../models/oauthGoogle.js'); //Google mongoose schema
const FBUserOAUTH = require('../models/oauthFacebook.js'); //Facebook mongoose schema
// Route handler for POST /register
const testRouter = express.Router();

//HTTP POST requests
// Route handler for POST /register


const isValidUser = (req, res, next)=>{
  // console.log(req.session);
  // console.log(req.session.passport);

  // Check if the user is authenticated using Google OAuth
  if (req.session.passport && req.session.passport.user) {
    return next();
  }  
  // Check if the user is authenticated using raw authentication
  if (req.session.user_id) {
    return next();
  }
  // Check if the user is authenticated using Other methods...
  /*
  if (other auth...) {
    return next();
  }...
  */

  res.redirect('/login')

};

//HTTP GET requests here!
testRouter.get('/test',isValidUser, async(req,res)=>{ 
  try {
    const user_google = await GgUserOAUTH.findById(req.session.passport.user);
    const user_fb = await FBUserOAUTH.findById(req.session.passport.user);

    let username = null;

    if (user_google) {
        // User exists in the Google database, get the username
        username = user_google.username;
    } else if (user_fb) {
        // User exists in the Facebook database, get the username
        username = user_fb.username;
    }

    // Render the profile page and pass the username to the template
    res.render('test.ejs', { username });
    } catch (error) {
    console.error('Error fetching user in the database:', error);
    res.render('error', { message: 'Internal server error' });
    }
});


//WHAT GO AFTER /SECRET/"anything!" WILL receive the same results
testRouter.get('/test/:ID', isValidUser, (req,res) => {
    res.send("<h1>WELCOME USER </h1>")
  });


module.exports = testRouter;