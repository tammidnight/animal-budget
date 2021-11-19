const router = require("express").Router();
const User = require("../models/User.model");
const Wallet = require("../models/Wallet.model");
const WalletMovement = require("../models/WalletMovement.model");
const bcrypt = require("bcryptjs");

const checkLogIn = (req, res, next) => {
  if (req.session.myProperty) {
    next();
  } else {
    res.redirect("/");
  }
};

//POST LOGIN
router.post("/login", (req, res, next) => {
  const { username, password } = req.body;
  User.find({ username })
    .then((usernameResponse) => {
      if (usernameResponse.length) {
        //bcrypt decryption
        let userObj = usernameResponse[0];

        // check if password matches
        let isMatching = bcrypt.compareSync(password, userObj.password);
        if (isMatching) {
          req.session.myProperty = userObj;

          res.redirect("/profile");
        } else {
          res.render("index.hbs", { error: "Password not matching" });
          return;
        }
      } else {
        res.render("index.hbs", { error: "User name does not exist" });
        return;
      }
    })
    .catch((err) => {
      next(err);
    });
});

//POST SIGNUP
router.post("/signup", (req, res, next) => {
  const { username, password, email, animalUrl } = req.body;
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

  User.create({ username, email, password: hash, animalUrl })
    .then((response) => {
      req.session.myProperty = response;
      res.redirect("/create");
    })
    .catch((err) => {
      if (err.code == 11000) {
        res.render("index.hbs", {
          error: "Username is taken, please choose another one",
        });
      }
      next(err);
    });
});

//POST logout
router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
});

// GET /profile
router.get("/profile", checkLogIn, (req, res, next) => {
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;
  User.findById({ _id })
    //populate Wallet with User missing
    .then((response) => {
      let wallet = response.wallet;
      res.render("user/userProfile.hbs", { myUserInfo, wallet });
    })
    .catch((err) => {
      next(err);
    });
});

// GET /profile/settings
router.get("/profile/settings", checkLogIn, (req, res, next) => {
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;
  User.findById({ _id })
    .then((response) => {
      res.render("user/userSettings.hbs", { response });
    })
    .catch((err) => {
      next(err);
    });
});

// POST /profile/settings
router.post("/profile/settings", (req, res, next) => {
  const { username, lastName, firstName, email, password, newPassword } =
    req.body;
  let myUserInfo = req.session.myProperty;
  let profileName = myUserInfo.username;
  User.find({ username: profileName })
    .then((usernameResponse) => {
      if (usernameResponse.length) {
        //bcrypt decryption
        let userObj = usernameResponse[0];
        let _id = usernameResponse._id;

        // check if password matches
        let isMatching = bcrypt.compareSync(password, userObj.password);
        if (isMatching) {
          User.findByIdAndUpdate(
            { _id },
            { username, lastName, firstName, email, password: newPassword }
          ).then((response) => {
            req.session.myProperty = response;
            res.redirect("/profile");
          });
        } else {
          res.render("userSettings.hbs", { error: "Password not matching" });
          return;
        }
      }
    })
    .catch((err) => {
      if (err.code == 11000) {
        res.render("userSettings.hbs", {
          error: "Username is taken, please choose another one",
        });
      }
      next(err);
    });
});

// POST /profile/delete
router.post("/profile/delete", (req, res, next) => {
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;
  User.findByIdAndRemove({ _id })
    .then(() => {
      return Wallet.deleteMany({ user: _id });
    })
    .then(() => {
      req.session.destroy();
      res.redirect("/");
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
