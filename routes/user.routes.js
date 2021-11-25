const router = require("express").Router();
const User = require("../models/User.model");
const Wallet = require("../models/Wallet.model");
const WalletMovement = require("../models/WalletMovement.model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const checkLogIn = (req, res, next) => {
  if (req.session.myProperty) {
    next();
  } else {
    res.redirect("/");
  }
};

const formateDate = (date) => {
  const result =
    date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
  return result;
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

//GET logout
router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
});

// GET /profile
router.get("/profile", checkLogIn, (req, res, next) => {
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;

  Wallet.find({ user: mongoose.Types.ObjectId(_id) })
    .populate("user")
    .then((response) => {
      if (response.length == 0) {
        res.redirect("/create");
        return;
      }

      let date;
      let user = {};

      if (response[0].user[0]._id == _id) {
        date = response[0].user[0].createdAt;
        user = response[0].user[0];
      } else if (response[0].user[1]._id == _id) {
        date = response[0].user[1].createdAt;
        user = response[0].user[1];
      }

      let formattedDate = formateDate(date);
      let responseOne = {};
      let chartDataOne = [];
      let responseTwo = {};
      let chartDataTwo = [];
      let responseThree = {};
      let chartDataThree = [];

      if (response.length === 1) {
        responseOne = response[0];
        chartDataOne = [
          Number(response[0].balance).toFixed(2),
          Number(response[0].saving).toFixed(2),
        ];
        if (responseOne.user.length > 1) {
          if (responseOne.user[0]._id !== mongoose.Types.ObjectId(_id)) {
            responseOne.sharedUser = responseOne.user[1].username;
          } else if (responseOne.user[1]._id !== mongoose.Types.ObjectId(_id)) {
            responseOne.sharedUser = responseOne.user[0].username;
          }
        }
      } else if (response.length === 2) {
        responseOne = response[0];
        chartDataOne = [
          Number(response[0].balance).toFixed(2),
          Number(response[0].saving).toFixed(2),
        ];
        if (responseOne.user.length > 1) {
          if (responseOne.user[0]._id !== mongoose.Types.ObjectId(_id)) {
            responseOne.sharedUser = responseOne.user[1].username;
          } else if (responseOne.user[1]._id !== mongoose.Types.ObjectId(_id)) {
            responseOne.sharedUser = responseOne.user[0].username;
          }
        }
        responseTwo = response[1];
        chartDataTwo = [
          Number(response[1].balance).toFixed(2),
          Number(response[1].saving).toFixed(2),
        ];
        if (responseTwo.user.length > 1) {
          if (responseTwo.user[0]._id !== mongoose.Types.ObjectId(_id)) {
            responseTwo.sharedUser = responseTwo.user[1].username;
          } else if (responseTwo.user[1]._id !== mongoose.Types.ObjectId(_id)) {
            responseTwo.sharedUser = responseTwo.user[0].username;
          }
        }
      } else if (response.length === 3) {
        responseOne = response[0];
        chartDataOne = [
          Number(response[0].balance).toFixed(2),
          Number(response[0].saving).toFixed(2),
        ];
        if (responseOne.user.length > 1) {
          if (responseOne.user[0]._id !== mongoose.Types.ObjectId(_id)) {
            responseOne.sharedUser = responseOne.user[1].username;
          } else if (responseOne.user[1]._id !== mongoose.Types.ObjectId(_id)) {
            responseOne.sharedUser = responseOne.user[0].username;
          }
        }
        responseTwo = response[1];
        chartDataTwo = [
          Number(response[1].balance).toFixed(2),
          Number(response[1].saving).toFixed(2),
        ];
        if (responseTwo.user.length > 1) {
          if (responseTwo.user[0]._id !== mongoose.Types.ObjectId(_id)) {
            responseTwo.sharedUser = responseTwo.user[1].username;
          } else if (responseTwo.user[1]._id !== mongoose.Types.ObjectId(_id)) {
            responseTwo.sharedUser = responseTwo.user[0].username;
          }
        }
        responseThree = response[2];
        chartDataThree = [
          Number(response[2].balance).toFixed(2),
          Number(response[2].saving).toFixed(2),
        ];
        if (responseThree.user.length > 1) {
          if (responseThree.user[0]._id !== mongoose.Types.ObjectId(_id)) {
            responseThree.sharedUser = responseThree.user[1].username;
          } else if (
            responseThree.user[1]._id !== mongoose.Types.ObjectId(_id)
          ) {
            responseThree.sharedUser = responseThree.user[0].username;
          }
        }
      }

      if (responseOne.user.length > 1) {
        if (responseOne.user[0]._id !== mongoose.Types.ObjectId(_id)) {
          response[0].animalUrl = responseOne.user[0].animalUrl;
        } else if (responseOne.user[1]._id !== mongoose.Types.ObjectId(_id)) {
          response[0].animalUrl = responseOne.user[1].animalUrl;
        }
      } else {
        response[0].animalUrl = responseOne.user[0].animalUrl;
      }

      let chartLabels = ["Balance", "Saving"];

      chartDataOne = JSON.stringify(chartDataOne);
      chartDataTwo = JSON.stringify(chartDataTwo);
      chartDataThree = JSON.stringify(chartDataThree);
      chartLabels = JSON.stringify(chartLabels);

      res.render("user/userProfile.hbs", {
        user,
        response,
        responseOne,
        responseTwo,
        responseThree,
        formattedDate,
        chartDataOne,
        chartDataTwo,
        chartDataThree,
        chartLabels,
      });
    })
    .catch((err) => {
      next(err);
    });
});

// GET /profile/settings
router.get("/profile/settings", checkLogIn, (req, res, next) => {
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;

  Wallet.find({ user: mongoose.Types.ObjectId(_id) })
    .populate("user")
    .then((response) => {
      let user = {};
      if (response[0].user[0]._id == _id) {
        user = response[0].user[0];
      } else if (response[0].user[1]._id == _id) {
        user = response[0].user[1];
      }

      if (user.animalUrl == "/images/bear.png") {
        user.bearChecked = true;
      } else if (user.animalUrl == "/images/cow.png") {
        user.cowChecked = true;
      } else if (user.animalUrl == "/images/crocodile.png") {
        user.crocodileChecked = true;
      } else if (user.animalUrl == "/images/dog.png") {
        user.dogChecked = true;
      } else if (user.animalUrl == "/images/duck.png") {
        user.duckChecked = true;
      } else if (user.animalUrl == "/images/elephant.png") {
        user.elephantChecked = true;
      } else if (user.animalUrl == "/images/monkey.png") {
        user.monkeyChecked = true;
      } else if (user.animalUrl == "/images/narwhale.png") {
        user.narwhaleChecked = true;
      } else if (user.animalUrl == "/images/owl.png") {
        user.owlChecked = true;
      } else if (user.animalUrl == "/images/panda.png") {
        user.pandaChecked = true;
      } else if (user.animalUrl == "/images/parrot.png") {
        user.parrotChecked = true;
      } else if (user.animalUrl == "/images/penguin.png") {
        user.penguinChecked = true;
      } else if (user.animalUrl == "/images/pig.png") {
        user.pigChecked = true;
      } else if (user.animalUrl == "/images/walrus.png") {
        user.walrusChecked = true;
      } else if (user.animalUrl == "/images/whale.png") {
        user.whaleChecked = true;
      } else if (user.animalUrl == "/images/zebra.png") {
        user.zebraChecked = true;
      }

      if (response[0].user.length > 1) {
        if (response[0].user[0]._id !== mongoose.Types.ObjectId(_id)) {
          response[0].animalUrl = response[0].user[0].animalUrl;
        } else if (response[0].user[1]._id !== mongoose.Types.ObjectId(_id)) {
          response[0].animalUrl = response[0].user[1].animalUrl;
        }
      } else {
        response[0].animalUrl = response[0].user[0].animalUrl;
      }

      res.render("user/userSettings.hbs", { user, response });
    })
    .catch((err) => {
      next(err);
    });
});

// POST /profile/settings
router.post("/profile/settings", (req, res, next) => {
  const {
    username,
    lastName,
    firstName,
    email,
    password,
    newPassword,
    animalUrl,
  } = req.body;
  let myUserInfo = req.session.myProperty;
  let profileName = myUserInfo.username;
  let _id = myUserInfo._id;

  if (password == "") {
    Wallet.find({ user: mongoose.Types.ObjectId(_id) })
      .populate("user")
      .then((response) => {
        let user = {};
        if (response[0].user[0]._id == _id) {
          user = response[0].user[0];
        } else if (response[0].user[1]._id == _id) {
          user = response[0].user[1];
        }

        if (user.animalUrl == "/images/bear.png") {
          user.bearChecked = true;
        } else if (user.animalUrl == "/images/cow.png") {
          user.cowChecked = true;
        } else if (user.animalUrl == "/images/crocodile.png") {
          user.crocodileChecked = true;
        } else if (user.animalUrl == "/images/dog.png") {
          user.dogChecked = true;
        } else if (user.animalUrl == "/images/duck.png") {
          user.duckChecked = true;
        } else if (user.animalUrl == "/images/elephant.png") {
          user.elephantChecked = true;
        } else if (user.animalUrl == "/images/monkey.png") {
          user.monkeyChecked = true;
        } else if (user.animalUrl == "/images/narwhale.png") {
          user.narwhaleChecked = true;
        } else if (user.animalUrl == "/images/owl.png") {
          user.owlChecked = true;
        } else if (user.animalUrl == "/images/panda.png") {
          user.pandaChecked = true;
        } else if (user.animalUrl == "/images/parrot.png") {
          user.parrotChecked = true;
        } else if (user.animalUrl == "/images/penguin.png") {
          user.penguinChecked = true;
        } else if (user.animalUrl == "/images/pig.png") {
          user.pigChecked = true;
        } else if (user.animalUrl == "/images/walrus.png") {
          user.walrusChecked = true;
        } else if (user.animalUrl == "/images/whale.png") {
          user.whaleChecked = true;
        } else if (user.animalUrl == "/images/zebra.png") {
          user.zebraChecked = true;
        }

        if (response[0].user.length > 1) {
          if (response[0].user[0]._id !== mongoose.Types.ObjectId(_id)) {
            response[0].animalUrl = response[0].user[0].animalUrl;
          } else if (response[0].user[1]._id !== mongoose.Types.ObjectId(_id)) {
            response[0].animalUrl = response[0].user[1].animalUrl;
          }
        } else {
          response[0].animalUrl = responseOne.user[0].animalUrl;
        }

        res.render("user/userSettings.hbs", {
          user,
          response,
          error: "Please enter your Password.",
        });
        return;
      });
  }

  User.find({ username: profileName })
    .then((usernameResponse) => {
      if (usernameResponse.length) {
        //bcrypt decryption
        let userObj = usernameResponse[0];
        // check if password matches
        let isMatching = bcrypt.compareSync(password, userObj.password);
        if (isMatching) {
          User.findByIdAndUpdate(
            { _id },
            {
              username,
              lastName,
              firstName,
              email,
              password: newPassword,
              animalUrl,
            }
          ).then((response) => {
            req.session.myProperty = response;
            res.redirect("/profile");
          });
        } else {
          return Wallet.find({ user: mongoose.Types.ObjectId(_id) })
            .populate("user")
            .then((response) => {
              let user = {};
              if (response[0].user[0]._id == _id) {
                user = response[0].user[0];
              } else if (response[0].user[1]._id == _id) {
                user = response[0].user[1];
              }

              if (user.animalUrl == "/images/bear.png") {
                user.bearChecked = true;
              } else if (user.animalUrl == "/images/cow.png") {
                user.cowChecked = true;
              } else if (user.animalUrl == "/images/crocodile.png") {
                user.crocodileChecked = true;
              } else if (user.animalUrl == "/images/dog.png") {
                user.dogChecked = true;
              } else if (user.animalUrl == "/images/duck.png") {
                user.duckChecked = true;
              } else if (user.animalUrl == "/images/elephant.png") {
                user.elephantChecked = true;
              } else if (user.animalUrl == "/images/monkey.png") {
                user.monkeyChecked = true;
              } else if (user.animalUrl == "/images/narwhale.png") {
                user.narwhaleChecked = true;
              } else if (user.animalUrl == "/images/owl.png") {
                user.owlChecked = true;
              } else if (user.animalUrl == "/images/panda.png") {
                user.pandaChecked = true;
              } else if (user.animalUrl == "/images/parrot.png") {
                user.parrotChecked = true;
              } else if (user.animalUrl == "/images/penguin.png") {
                user.penguinChecked = true;
              } else if (user.animalUrl == "/images/pig.png") {
                user.pigChecked = true;
              } else if (user.animalUrl == "/images/walrus.png") {
                user.walrusChecked = true;
              } else if (user.animalUrl == "/images/whale.png") {
                user.whaleChecked = true;
              } else if (user.animalUrl == "/images/zebra.png") {
                user.zebraChecked = true;
              }

              if (response[0].user.length > 1) {
                if (response[0].user[0]._id !== mongoose.Types.ObjectId(_id)) {
                  response[0].animalUrl = response[0].user[0].animalUrl;
                } else if (
                  response[0].user[1]._id !== mongoose.Types.ObjectId(_id)
                ) {
                  response[0].animalUrl = response[0].user[1].animalUrl;
                }
              } else {
                response[0].animalUrl = responseOne.user[0].animalUrl;
              }

              res.render("user/userSettings.hbs", {
                user,
                response,
                error: "Password not matching",
              });
              return;
            });
        }
      }
    })
    .catch((err) => {
      if (err.code == 11000) {
        res.render("user/userSettings.hbs", {
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
      return Wallet.find({ user: mongoose.Types.ObjectId(_id) });
    })
    .then((response) => {
      let wallet = [];

      response.forEach((elem) => {
        wallet.push(elem._id);
      });

      return WalletMovement.deleteMany({ wallet: { $in: wallet } });
    })
    .then(() => {
      return Wallet.deleteMany({ user: mongoose.Types.ObjectId(_id) });
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
