const router = require("express").Router();
const User = require("../models/User.model");
const Wallet = require("../models/Wallet.model");
const WalletMovement = require("../models/WalletMovement.model");
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

const formateDateForInput = (date) => {
  const result =
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1) +
    "-" +
    ("0" + date.getDate()).slice(-2);
  return result;
};

const formateAmount = (amount) => {
  const result = Number(amount).toFixed(2);
  return result;
};

const getBalance = (movement) => {
  let balance = 0;

  movement.forEach((elem) => {
    if (elem.category == "Income") {
      balance = balance + Number(elem.amount);
    } else if (elem.category == "Spending") {
      balance = balance - Number(elem.amount);
    } else if (elem.category == "Saving") {
      balance = balance - Number(elem.amount);
    }
  });

  return Number(balance).toFixed(2);
};

const getSaving = (movement) => {
  let saving = 0;

  movement.forEach((elem) => {
    if (elem.kind == "Saving") {
      saving = saving + Number(elem.amount);
    } else if (elem.kind == "Saving Spending") {
      saving = saving - Number(elem.amount);
    }
  });

  return Number(saving).toFixed(2);
};

router.get("/create", checkLogIn, (req, res, next) => {
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;

  Wallet.find({ user: mongoose.Types.ObjectId(_id) })
    .populate("user")
    .then((response) => {
      if (response.length > 0) {
        if (response[0].length == 0) {
          if (response[0].user.length > 1) {
            if (response[0].user[0]._id !== mongoose.Types.ObjectId(_id)) {
              response[0].animalUrl = response[0].user[0].animalUrl;
            } else if (
              response[0].user[1]._id !== mongoose.Types.ObjectId(_id)
            ) {
              response[0].animalUrl = response[0].user[1].animalUrl;
            }
            response[0].animalUrl = response[0].user[0].animalUrl;
            res.render("wallet/createWallet.hbs", { response });
            return;
          }
        }
        if (response[0].user.length > 1) {
          if (response[0].user[0]._id !== mongoose.Types.ObjectId(_id)) {
            response[0].animalUrl = response[0].user[0].animalUrl;
          } else if (response[0].user[1]._id !== mongoose.Types.ObjectId(_id)) {
            response[0].animalUrl = response[0].user[1].animalUrl;
          }
          response[0].animalUrl = response[0].user[0].animalUrl;
        }
        res.render("wallet/createWallet.hbs", { response });
      } else {
        return User.find({ username: myUserInfo.username }).then((response) => {
          res.render("wallet/createWallet.hbs", { response });
        });
      }
    })
    .catch((err) => next(err));
});

router.post("/create", async (req, res, next) => {
  const {
    walletName,
    currency,
    startingDate,
    savingPlan,
    monthlyIncome,
    monthlySpending,
    shared,
    sharedWalletUser,
  } = req.body;

  let user = req.session.myProperty._id;
  user = mongoose.Types.ObjectId(user);
  let sharedUserId = [user];

  try {
    if (sharedWalletUser) {
      let sharedUser = await User.find({ username: sharedWalletUser });
      if (sharedUser.length === 0) {
        res.render("wallet/createWallet.hbs", {
          error: "Please enter a valid username.",
        });
        return;
      }
      sharedUserId = [user, sharedUser[0]._id];
    }
    let response = await Wallet.find({ user }).populate("user");
    if (response.length > 0) {
      if (response[0].user.length > 1) {
        if (response[0].user[0]._id !== mongoose.Types.ObjectId(user)) {
          response[0].animalUrl = response[0].user[0].animalUrl;
        } else if (response[0].user[1]._id !== mongoose.Types.ObjectId(user)) {
          response[0].animalUrl = response[0].user[1].animalUrl;
        }
        response[0].animalUrl = response[0].user[0].animalUrl;
      }
    }
    if (
      walletName == "" ||
      currency == "" ||
      startingDate == "" ||
      savingPlan == "" ||
      monthlyIncome == "" ||
      monthlySpending == ""
    ) {
      res.render("wallet/createWallet.hbs", {
        response,
        error: "Please enter all mandatory fields",
      });
      return;
    }
    if (shared === true && sharedWalletUser == "") {
      res.render("wallet/createWallet", {
        response,
        error:
          "Please enter the username of the second User for the shared wallet.",
      });
      return;
    }
    if (response.length == 3) {
      res.render("wallet/createWallet", {
        response,
        error:
          "Unfortunately you can only have three Wallets at a time. Please delete one Wallet before creating a new one.",
      });
      return;
    }

    let wallet = await Wallet.create({
      walletName,
      currency,
      startingDate,
      savingPlan,
      monthlyIncome,
      monthlySpending,
      shared,
      user: sharedUserId,
    });

    const monthlyIncomeAmount = wallet.monthlyIncome;
    const monthlySpendingAmount = wallet.monthlySpending;
    const monthlyIncomeDate = wallet.startingDate;
    const monthlySpendingDate = wallet.startingDate;
    const walletId = wallet._id;

    await WalletMovement.create({
      kind: "Monthly Income",
      amount: monthlyIncomeAmount,
      category: "Income",
      date: monthlyIncomeDate,
      wallet: walletId,
    });
    await WalletMovement.create({
      kind: "Monthly Spending",
      amount: monthlySpendingAmount,
      category: "Spending",
      date: monthlySpendingDate,
      wallet: walletId,
    });

    res.redirect("/profile");
  } catch (err) {
    next(err);
  }
});

router.get("/:walletId", checkLogIn, async (req, res, next) => {
  const { walletId } = req.params;
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;

  try {
    let navWallet = await Wallet.find({
      user: mongoose.Types.ObjectId(_id),
    }).populate("user");
    let response = await WalletMovement.find({ wallet: walletId }).populate(
      "wallet"
    );
    if (response.length == 0) {
      return Wallet.findById({ _id: walletId })
        .populate("user")
        .then((wallet) => {
          let newWallet = wallet;
          let newDate = new Date();
          let month = newDate.getMonth() + 1;
          let year = newDate.getFullYear();
          newDate = month + "/" + year;

          if (newWallet.user.length > 1) {
            let username = "";
            if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
              username = newWallet.user[1];
              navWallet[0].animalUrl = navWallet[0].user[0].animalUrl;
            } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
              username = newWallet.user[0];
              navWallet[0].animalUrl = navWallet[0].user[1].animalUrl;
            }

            res.render("wallet/wallet.hbs", {
              navWallet,
              newWallet,
              newDate,
              username,
            });
          }
          navWallet[0].animalUrl = navWallet[0].user[0].animalUrl;
          res.render("wallet/wallet.hbs", { newWallet, newDate, navWallet });
        });
    }
    let newWallet = response[0].wallet;
    let newDate = new Date();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    newDate = month + "/" + year;
    let balance = Number(getBalance(response)).toFixed(2);
    let saving = getSaving(response);
    let chartLabels = [
      "Transportation",
      "Food",
      "Pet",
      "Leisure",
      "Present",
      "Other",
    ];
    let chartData = [];
    let transportation = 0;
    let food = 0;
    let pet = 0;
    let leisure = 0;
    let present = 0;
    let other = 0;
    let chartLabelsTwo = ["Balance", "Saving"];
    let chartDataTwo = [balance, saving];

    response.forEach((elem) => {
      elem.formattedDate = formateDate(elem.date);
      elem.formattedAmount = formateAmount(elem.amount);

      if (elem.kind == "Spending") {
        if (elem.category == "Transportation") {
          transportation += Number(elem.formattedAmount);
        } else if (elem.category == "Food") {
          food += Number(elem.formattedAmount);
        } else if (elem.category == "Pet") {
          pet += Number(elem.formattedAmount);
        } else if (elem.category == "Leisure") {
          leisure += Number(elem.formattedAmount);
        } else if (elem.category == "Present") {
          present += Number(elem.formattedAmount);
        } else if (elem.category == "Other") {
          other += Number(elem.formattedAmount);
        }
      }
    });

    response.sort((a, b) => {
      let keyA = a.formattedDate;
      let keyB = b.formattedDate;
      if (keyA < keyB) {
        return 1;
      }
      if (keyA > keyB) {
        return -1;
      }
      return 0;
    });

    chartData.push(transportation, food, pet, leisure, present, other);
    chartLabels = JSON.stringify(chartLabels);
    chartData = JSON.stringify(chartData);
    chartLabelsTwo = JSON.stringify(chartLabelsTwo);
    chartDataTwo = JSON.stringify(chartDataTwo);

    if (newWallet.user.length > 1) {
      let username = "";
      if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
        username = newWallet.user[1];
        navWallet[0].animalUrl = navWallet[0].user[0].animalUrl;
      } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
        username = newWallet.user[0];
        navWallet[0].animalUrl = navWallet[0].user[1].animalUrl;
      }

      res.render("wallet/wallet.hbs", {
        response,
        navWallet,
        newWallet,
        newDate,
        balance,
        saving,
        chartLabels,
        chartData,
        chartLabelsTwo,
        chartDataTwo,
        username,
      });
    }

    navWallet[0].animalUrl = navWallet[0].user[0].animalUrl;

    res.render("wallet/wallet.hbs", {
      response,
      navWallet,
      newWallet,
      newDate,
      balance,
      saving,
      chartLabels,
      chartData,
      chartLabelsTwo,
      chartDataTwo,
    });

    await Wallet.findByIdAndUpdate(
      { _id: response[0].wallet._id },
      { balance, saving }
    );
    return;
  } catch (err) {
    next(err);
  }
});

router.post("/:walletId", async (req, res, next) => {
  const { kind, amount, category, date } = req.body;
  const { walletId: wallet } = req.params;
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;

  if (kind == "" || amount == "" || category == "" || date == "") {
    WalletMovement.find({ wallet })
      .populate("wallet")
      .then((response) => {
        if (response.length == 0) {
          return Wallet.findById({ _id: walletId })
            .populate("user")
            .then((wallet) => {
              let newWallet = wallet;
              let newDate = new Date();
              let month = newDate.getMonth() + 1;
              let year = newDate.getFullYear();
              newDate = month + "/" + year;

              if (newWallet.user.length > 1) {
                let username = "";
                if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
                  username = newWallet.user[1];
                  navWallet[0].animalUrl = navWallet[0].user[0].animalUrl;
                } else if (
                  newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)
                ) {
                  username = newWallet.user[0];
                  navWallet[0].animalUrl = navWallet[0].user[1].animalUrl;
                }
                res.render("wallet/wallet.hbs", {
                  navWallet,
                  newWallet,
                  newDate,
                  username,
                });
              }
              navWallet[0].animalUrl = navWallet[0].user[0].animalUrl;
              res.render("wallet/wallet.hbs", {
                newWallet,
                newDate,
                navWallet,
              });
            });
        }
        let newWallet = response[0].wallet;
        let newDate = new Date();
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        newDate = month + "/" + year;
        let balance = Number(getBalance(response)).toFixed(2);
        let saving = getSaving(response);
        let chartLabels = [
          "Transportation",
          "Food",
          "Pet",
          "Leisure",
          "Present",
          "Other",
        ];
        let chartData = [];
        let transportation = 0;
        let food = 0;
        let pet = 0;
        let leisure = 0;
        let present = 0;
        let other = 0;
        let chartLabelsTwo = ["Balance", "Saving"];
        let chartDataTwo = [balance, saving];

        response.forEach((elem) => {
          elem.formattedDate = formateDate(elem.date);
          elem.formattedAmount = formateAmount(elem.amount);

          if (elem.kind == "Spending") {
            if (elem.category == "Transportation") {
              transportation += Number(elem.formattedAmount);
            } else if (elem.category == "Food") {
              food += Number(elem.formattedAmount);
            } else if (elem.category == "Pet") {
              pet += Number(elem.formattedAmount);
            } else if (elem.category == "Leisure") {
              leisure += Number(elem.formattedAmount);
            } else if (elem.category == "Present") {
              present += Number(elem.formattedAmount);
            } else if (elem.category == "Other") {
              other += Number(elem.formattedAmount);
            }
          }
        });

        response.sort((a, b) => {
          let keyA = a.date;
          let keyB = b.date;
          if (keyA < keyB) {
            return 1;
          }
          if (keyA > keyB) {
            return -1;
          }
          return 0;
        });

        chartData.push(transportation, food, pet, leisure, present, other);
        chartLabels = JSON.stringify(chartLabels);
        chartData = JSON.stringify(chartData);
        chartLabelsTwo = JSON.stringify(chartLabelsTwo);
        chartDataTwo = JSON.stringify(chartDataTwo);

        if (newWallet.user.length > 1) {
          let username = "";
          if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
            username = newWallet.user[1];
            navWallet[0].animalUrl = navWallet[0].user[0].animalUrl;
          } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
            username = newWallet.user[0];
            navWallet[0].animalUrl = navWallet[0].user[1].animalUrl;
          }
          res.render("wallet/wallet.hbs", {
            response,
            navWallet,
            newWallet,
            newDate,
            balance,
            saving,
            chartLabels,
            chartData,
            chartLabelsTwo,
            chartDataTwo,
            username,
          });
        }
        navWallet[0].animalUrl = navWallet[0].user[0].animalUrl;
        res.render("wallet/wallet.hbs", {
          response,
          newWallet,
          newDate,
          balance,
          saving,
          chartData,
          chartLabels,
          chartLabelsTwo,
          chartDataTwo,
          error: "Please enter all mandatory fields",
        });
      })
      .catch((err) => next(err));
    return;
  }

  try {
    let navWallet = await Wallet.find({
      user: mongoose.Types.ObjectId(_id),
    }).populate("user");
    await WalletMovement.create({ kind, amount, category, date, wallet });

    let response = await WalletMovement.find({ wallet }).populate("wallet");
    if (response.length == 0) {
      return Wallet.findById({ _id: walletId })
        .populate("user")
        .then((wallet) => {
          let newWallet = wallet;
          let newDate = new Date();
          let month = newDate.getMonth() + 1;
          let year = newDate.getFullYear();
          newDate = month + "/" + year;

          if (newWallet.user.length > 1) {
            let username = "";
            if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
              username = newWallet.user[1];
              navWallet[0].animalUrl = navWallet[0].user[0].animalUrl;
            } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
              username = newWallet.user[0];
              navWallet[0].animalUrl = navWallet[0].user[1].animalUrl;
            }

            res.render("wallet/wallet.hbs", {
              navWallet,
              newWallet,
              newDate,
              username,
            });
          }
          navWallet[0].animalUrl = navWallet[0].user[0].animalUrl;
          res.render("wallet/wallet.hbs", { newWallet, newDate, navWallet });
        });
    }
    let newWallet = response[0].wallet;
    let newDate = new Date();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    newDate = month + "/" + year;
    let balance = getBalance(response);
    let saving = getSaving(response);
    let chartLabels = [
      "Transportation",
      "Food",
      "Pet",
      "Leisure",
      "Present",
      "Other",
    ];
    let chartData = [];
    let transportation = 0;
    let food = 0;
    let pet = 0;
    let leisure = 0;
    let present = 0;
    let other = 0;
    let chartLabelsTwo = ["Balance", "Saving"];
    let chartDataTwo = [balance, saving];

    response.forEach((elem) => {
      elem.formattedDate = formateDate(elem.date);
      elem.formattedAmount = formateAmount(elem.amount);

      if (elem.kind == "Spending") {
        if (elem.category == "Transportation") {
          transportation += Number(elem.formattedAmount);
        } else if (elem.category == "Food") {
          food += Number(elem.formattedAmount);
        } else if (elem.category == "Pet") {
          pet += Number(elem.formattedAmount);
        } else if (elem.category == "Leisure") {
          leisure += Number(elem.formattedAmount);
        } else if (elem.category == "Present") {
          present += Number(elem.formattedAmount);
        } else if (elem.category == "Other") {
          other += Number(elem.formattedAmount);
        }
      }
    });

    response.sort((a, b) => {
      let keyA = a.formattedDate;
      let keyB = b.formattedDate;
      if (keyA < keyB) {
        return 1;
      }
      if (keyA > keyB) {
        return -1;
      }
      return 0;
    });

    chartData.push(transportation, food, pet, leisure, present, other);
    chartLabels = JSON.stringify(chartLabels);
    chartData = JSON.stringify(chartData);
    chartLabelsTwo = JSON.stringify(chartLabelsTwo);
    chartDataTwo = JSON.stringify(chartDataTwo);

    if (newWallet.user.length > 1) {
      let username = "";
      if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
        username = newWallet.user[1];
        navWallet[0].animalUrl = navWallet[0].user[0].animalUrl;
      } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
        username = newWallet.user[0];
        navWallet[0].animalUrl = navWallet[0].user[1].animalUrl;
      }
      res.render("wallet/wallet.hbs", {
        response,
        navWallet,
        newWallet,
        newDate,
        balance,
        saving,
        chartLabels,
        chartData,
        chartLabelsTwo,
        chartDataTwo,
        username,
      });
    }

    navWallet[0].animalUrl = navWallet[0].user[0].animalUrl;

    res.render("wallet/wallet.hbs", {
      response,
      navWallet,
      newWallet,
      newDate,
      balance,
      saving,
      chartData,
      chartLabels,
      chartLabelsTwo,
      chartDataTwo,
    });

    await Wallet.findByIdAndUpdate(
      { _id: response[0].wallet._id },
      { balance, saving }
    );
    return;
  } catch (err) {
    next(err);
  }
});

router.get("/:walletId/edit", checkLogIn, async (req, res, next) => {
  const { walletId } = req.params;
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;

  try {
    let response = await Wallet.find({ _id: walletId }).populate("user");
    response = response[0];
    response.formattedDateForInput = formateDateForInput(response.startingDate);

    if (response.currency == "Euro") {
      response.euroIsChecked = true;
    } else if (response.currency == "Dollar") {
      response.dollarIsChecked = true;
    } else if (response.currency == "Pound") {
      response.poundIsChecked = true;
    } else if (response.currency == "Yen") {
      response.yenIsChecked = true;
    }

    if (response.shared == true) {
      response.yesIsChecked = true;
    } else if (response.shared == false) {
      response.noIsChecked = true;
    }

    if (response.savingPlan == "Gold") {
      response.goldIsChecked = true;
    } else if (response.savingPlan == "Silver") {
      response.silverIsChecked = true;
    } else if (response.savingPlan == "Bronze") {
      response.bronzeIsChecked = true;
    }

    let sharedUser = {};

    if (response.user[0]._id !== mongoose.Types.ObjectId(_id)) {
      sharedUser = response.user[1];
    } else if (response.user[1]._id !== mongoose.Types.ObjectId(_id)) {
      sharedUser = response.user[0];
    }

    let wallet = await Wallet.find({
      user: mongoose.Types.ObjectId(_id),
    }).populate("user");

    if (wallet[0].length == 0) {
      if (wallet[0].user.length > 1) {
        if (wallet[0].user[0]._id !== mongoose.Types.ObjectId(_id)) {
          wallet[0].animalUrl = wallet[0].user[0].animalUrl;
        } else if (wallet[0].user[1]._id !== mongoose.Types.ObjectId(_id)) {
          wallet[0].animalUrl = wallet[0].user[1].animalUrl;
        }
        wallet[0].animalUrl = wallet[0].user[0].animalUrl;
        res.render("wallet/editWallet.hbs", { response });
        return;
      }
    }
    if (wallet[0].user.length > 1) {
      if (wallet[0].user[0]._id !== mongoose.Types.ObjectId(_id)) {
        wallet[0].animalUrl = wallet[0].user[0].animalUrl;
      } else if (wallet[0].user[1]._id !== mongoose.Types.ObjectId(_id)) {
        wallet[0].animalUrl = wallet[0].user[1].animalUrl;
      }
      wallet[0].animalUrl = wallet[0].user[0].animalUrl;
    }

    res.render("wallet/editWallet.hbs", {
      response,
      wallet,
      sharedUser,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/:walletId/edit", async (req, res, next) => {
  const {
    walletName,
    currency,
    startingDate,
    savingPlan,
    monthlyIncome,
    monthlySpending,
    shared,
    sharedWalletUser,
  } = req.body;

  const { walletId } = req.params;
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;
  let user = [_id];

  try {
    let response = await Wallet.find({ _id: walletId });
    response = response[0];
    response.formattedDateForInput = formateDateForInput(response.startingDate);

    if (response.currency == "Euro") {
      response.euroIsChecked = true;
    } else if (response.currency == "Dollar") {
      response.dollarIsChecked = true;
    } else if (response.currency == "Pound") {
      response.poundIsChecked = true;
    } else if (response.currency == "Yen") {
      response.yenIsChecked = true;
    }

    if (response.shared == true) {
      response.yesIsChecked = true;
    } else if (response.shared == false) {
      response.noIsChecked = true;
    }

    if (response.savingPlan == "Gold") {
      response.goldIsChecked = true;
    } else if (response.savingPlan == "Silver") {
      response.silverIsChecked = true;
    } else if (response.savingPlan == "Bronze") {
      response.bronzeIsChecked = true;
    }

    let wallet = await Wallet.find({
      user: mongoose.Types.ObjectId(_id),
    }).populate("user");

    if (wallet[0].user.length > 1) {
      if (wallet[0].user[0]._id !== mongoose.Types.ObjectId(_id)) {
        wallet[0].animalUrl = wallet[0].user[0].animalUrl;
      } else if (wallet[0].user[1]._id !== mongoose.Types.ObjectId(_id)) {
        wallet[0].animalUrl = wallet[0].user[1].animalUrl;
      }
      wallet[0].animalUrl = wallet[0].user[0].animalUrl;
    }
    if (
      walletName == "" ||
      currency == "" ||
      startingDate == "" ||
      savingPlan == ""
    ) {
      res.render("wallet/editWallet.hbs", {
        wallet,
        response,
        error: "Please enter all mandatory fields",
      });
      return;
    }
    if (shared === true && sharedWalletUser == "") {
      res.render("wallet/editWallet.hbs", {
        response,
        error:
          "Please enter the username of the second User for the shared wallet.",
      });
      return;
    }

    if (sharedWalletUser) {
      let sharedUser = await User.find({ username: sharedWalletUser });
      if (sharedUser.length === 0) {
        res.render("wallet/editWallet.hbs", {
          response,
          error: "Please enter a valid username.",
        });
        return;
      }
      let sharedUserId = sharedUser[0]._id;
      user = [_id, sharedUserId];
    }
    if (monthlyIncome == "" && monthlySpending == "") {
      return Wallet.findByIdAndUpdate(
        { _id: walletId },
        {
          walletName,
          currency,
          startingDate,
          savingPlan,
          shared,
          user,
        }
      ).then(() => {
        res.redirect(`/${walletId}`);
      });
    } else if (monthlyIncome == "") {
      return Wallet.findByIdAndUpdate(
        { _id: walletId },
        {
          walletName,
          currency,
          startingDate,
          savingPlan,
          monthlySpending,
          shared,
          user,
        }
      ).then(() => {
        res.redirect(`/${walletId}`);
      });
    } else if (monthlySpending == "") {
      return Wallet.findByIdAndUpdate(
        { _id: walletId },
        {
          walletName,
          currency,
          startingDate,
          savingPlan,
          monthlyIncome,
          shared,
          user,
        }
      ).then(() => {
        res.redirect(`/${walletId}`);
      });
    } else {
      return Wallet.findByIdAndUpdate(
        { _id: walletId },
        {
          walletName,
          currency,
          startingDate,
          savingPlan,
          monthlyIncome,
          monthlySpending,
          shared,
          user,
        }
      ).then(() => {
        res.redirect(`/${walletId}`);
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/:walletId/delete", (req, res, next) => {
  const { walletId: _id } = req.params;

  Wallet.findByIdAndRemove({ _id })
    .then(() => {
      return WalletMovement.deleteMany({ wallet: _id });
    })
    .then(() => {
      res.redirect("/profile");
    })
    .catch((err) => next(err));
});

router.get("/:walletId/filter", checkLogIn, async (req, res, next) => {
  const { walletId } = req.params;
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;
  let username = "";

  try {
    let navWallet = await Wallet.find({ user: _id }).populate("user");
    let response = await WalletMovement.find({ wallet: walletId }).populate(
      "wallet"
    );
    let wallet = await Wallet.findById({ _id: walletId }).populate("user");

    if (response.length == 0) {
      if (wallet.user.length > 1) {
        if (wallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
          username = wallet.user[1];
          navWallet[0].user = wallet.user[0].animalUrl;
        } else if (wallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
          username = wallet.user[0];
          navWallet[0].user = wallet.user[1].animalUrl;
        }
      }
      navWallet[0].user = wallet.user[0].animalUrl;

      res.render("wallet/walletFilter.hbs", {
        error: "No movements available.",
        wallet,
        username,
        navWallet,
      });
      return;
    }

    if (wallet.user.length > 1) {
      if (wallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
        username = wallet.user[1];
        navWallet[0].animalUrl = wallet.user[0].animalUrl;
      } else if (wallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
        username = wallet.user[0];
        navWallet[0].animalUrl = wallet.user[1].animalUrl;
      }
    }

    navWallet[0].user = wallet.user[0].animalUrl;

    res.render("wallet/walletFilter.hbs", {
      response,
      wallet,
      navWallet,
      username,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/movement/:movementId", (req, res, next) => {
  const { movementId: _id } = req.params;
  const { kind, amount, category, date } = req.body;

  WalletMovement.findByIdAndUpdate({ _id }, { kind, amount, category, date })
    .then((response) => {
      let walletId = response.wallet;
      res.redirect(`/${walletId}`);
    })
    .catch((err) => next(err));
});

router.post("/movement/:movementId/delete", async (req, res, next) => {
  const { movementId: _id } = req.params;
  try {
    let response = await WalletMovement.findById({ _id });
    const walletId = response.wallet;
    await WalletMovement.findByIdAndRemove({ _id: response._id });
    res.redirect(`/${walletId}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
