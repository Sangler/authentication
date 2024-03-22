const express = require("express");
const passport = require('passport');
const User = require('../models/index.js'); // mongo schema
const bcrypt = require('bcrypt'); 

const GgUserOAUTH = require('../models/oauthGoogle.js'); //Google mongoose schema
const FBUserOAUTH = require('../models/oauthFacebook.js'); //Facebook mongoose schema
//HTTP POST requests
// Route handler for POST /register
const router = express.Router();
const catchAsync = require('../utils/catchAsync.js');

//HTTP POST requests
// Route handler for POST /register
router.post('/register', catchAsync(async (req, res) => {
    const {email, password, username, userpwd} = req.body;
    //Hashing password
    const IsUserName = await User.findOne({username}); // Check if username existed? -> return value or null
    if (IsUserName!==null){
      res.send(`<h1 style="color: linear-gradient(168deg, #ffffff 55%, #c8ff00 0);">User name already created!<h1>
                <div> 
                <a href="/register"><button>BACK</button></a> 
                <br>
                <a href="/login">Back to Sign In</a>
                </div>
              `);
    } else {  
      const hashpwd = await bcrypt.hash(password, 12);
      const user = new User({
        password:hashpwd,
        username :username,
        email:email
      });
      if (password === userpwd ){
        try{    
          await user.save();
          res.redirect('/login');
        } catch (err){
          console.err(err);
        }
      } else{
        res.send(`<h1 style="color: linear-gradient(168deg, #ffffff 55%, #c8ff00 0);">Re-enter the correct Password!<h1>
                  <div> 
                  <a href="/register"><button>BACK</button></a> 
                  <br>
                  <a href="/login">Back to Sign In</a>
                  </div>
                `);
      }
    }
  
  }));
  
router.post('/login', async (req,res)=>{
    const {username, password} = req.body;
    const userLogIn = await User.findOne({username});  
    if (userLogIn===null){
      return res.send(`<h1>Incorrect password or username, try again!<h1> 
      <div class="forget-pass"> 
      <a href="#">Forgot password?
      </a> <br><a href="/login"> Back to Sign In</a>
      </div>`);
    } else{
      const IsvalidPass = await bcrypt.compare(password, userLogIn.password) //return Bool
      if (IsvalidPass===true){
        req.session.user_id=userLogIn._id;
        //console.log(`Welcome back! user`);
        return res.redirect('/home');
      } else{
        res.send(`
        <h1>Incorrect password or username, try again!<h1> 
        <div class="forget-pass"> <a href="#">
        Forgot password?</a> <br><a href="/login"> Back to Log-In</a>
        </div>`);
      }
    }
  });

router.post('/logout', async (req,res)=>{
  if (req.session.passport && req.session.passport.user) {
    req.session.destroy();
    return res.redirect('/login')
  };
  if (req.session.user_id) {
    req.session.user_id=null
    return res.redirect('/login')
  };
  res.redirect('/login');
})

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
router.get('/register',(req,res)=>{ 
  res.render('register.ejs');
});

router.get('/login', (req,res)=>{
    res.render('login.ejs');
});

//Google authenticate page
router.get('/login/google', passport.authenticate('google',{
    scope:['email','profile']
}));
router.get('/login/google/redirect', passport.authenticate('google'), (req,res)=>{
    res.redirect('/home');
});


//Facebook authenticate page
router.get('/login/facebook', passport.authenticate('facebook'));
router.get('/login/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });

  
router.get('/home', isValidUser, async (req,res)=>{
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
    res.render('home.ejs', { username });
    } catch (error) {
    console.error('Error fetching user in the database:', error);
    res.render('error', { message: 'Internal server error' });
    }
});

router.get('/', isValidUser, (req,res)=>{
    res.render('home.ejs')
  });
  
//WHAT GO AFTER /SECRET/"anything!" WILL receive the same results
router.get('/SECRET/:ABC', isValidUser, (req,res) => {
    res.send("<h1>WELCOME USER </h1>")
  });

  

module.exports = router;
