const router = require("express").Router();
const User = require("../models/User.model");
const Wallet = require("../models/Wallet.model");
const WalletMovement = require("../models/WalletMovement.model");
const bcrypt = require("bcryptjs");


//POST LOGIN
router.post('/login', (req, res, next) =>{
    const {username, password} = req.body
    User.find({username})
    .then((usernameResponse) => {
        if (usernameResponse.length) {
            //bcrypt decryption 
            let userObj =usernameResponse[0]

            // check if password matches
            let isMatching = bcrypt.compareSync(password, userObj.password);
            if (isMatching) {
                req.session.myProperty = userObj

                res.redirect('/profile')
            }
            else {
              res.render('index.hbs', {error: 'Password not matching'})
              return;
            }
        }
        else {
          res.render('index.hbs', {error: 'User name does not exist'})
          return;
        }
    })
    .catch((err) => {
      next(err)
    })
})


//POST SIGNUP
router.post('/signup', (req, res, next) =>{
    const {username, password} = req.body
    if (username == "" || email == "" || password == "" || animalUrl == "") {
        // throw error
        res.render("index.hbs", { error: "Please enter all fields" });
        return;
      }
      // Validate if password is strong
      let passRegEx = new RegExp(
        "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
      );
      if (!passRegEx.test(password)) {
        res.render("index.hbs", {
          error:
            "Please enter minimum eight characters, at least one uppercase character, one lowercase character, one special character and one number for your password.",
        });
        return;
      }
      let emailRegEx =
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
      if (!emailRegEx.test(email)) {
        res.render("index.hbs", {
          error: "Please enter a valid email.",
        });
        return;
      } 

      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(password, salt);

       UserModel.create({username, email, password: hash})
      .then(() => {
          res.redirect('/create')
      })
      .catch((err) => {
        next(err)
      })


})

//POST logout
router.post('/logout', (req, res, next) =>{
    req.session.destroy()
    res.redirect('/')
})

// GET /profile
router.get('/profile', (req, res, next) => {
    res.render('user/userProfile.hbs')
    // MISSSING MISSING COOKIE USER ID SO WE CAN PASS IT AS AN INPUT TO THE RENDER. 
})

// GET /profile/settings
router.get('/profile/settings', (req, res, next) => {
    res.render('user/userSettings.hbs')
    // MISSSING MISSISN COOKIE USER ID SO WE CAN PASS IT AS AN INPUT TO THE RENDER. 

})

// POST /profile/settings
router.post('/profile/settings', (req, res, next) =>{
    const {username, lastName, firstName, email, password, newPassword} = req.body

    res.redirect // WE HAVE TO CHECK TO CHECK IF THE PASSWORD IS ON THE DATABASE IN ORDER TO CHANGE IT
})

// POST /profile/delete
router.post('/profile/delete', (req, res, next) =>{

})
//find by ID 

module.exports = router;
