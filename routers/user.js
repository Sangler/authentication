const express = require("express");
const passport = require('passport');
const User = require('../models/index.js'); // mongo schema
const bcrypt = require('bcrypt'); 

//HTTP POST requests
// Route handler for POST /register
const router = express.Router();
const catchAsync = require('../utils/catchAsync.js');
const flash = require('connect-flash');

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
  if (facebook oauth...) {
    return next();
  }
  if...
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

router.get('/google', passport.authenticate('google',{
    scope:['profile']
}));

router.get('/google/redirect', passport.authenticate('google'), (req,res)=>{
    res.redirect("/home")
});

router.get('/home', isValidUser, (req,res)=>{
    res.render('home.ejs')
  });
  router.get('/', isValidUser, (req,res)=>{
    res.render('works.ejs')
  });
  
//WHAT GO AFTER /SECRET/"anything!" WILL receive the same results
router.get('/ ', isValidUser, (req,res) => {
    res.send("<h1>WELCOME USER </h1>")
  });


module.exports = router;
