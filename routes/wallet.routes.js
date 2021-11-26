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
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const result = day + "/" + month + "/" + date.getFullYear();
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
    response[0].animalUrl = req.session.myProperty.animalUrl;

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
    let newWallet = [];

    if (navWallet.length == 1) {
      newWallet = navWallet;
    } else if (navWallet.length == 2) {
      if (navWallet[0]._id == walletId) {
        newWallet = navWallet[0];
      } else if (navWallet[1]._id == walletId) {
        newWallet = navWallet[1];
      }
    } else if (navWallet.length == 3) {
      if (navWallet[0]._id == walletId) {
        newWallet = navWallet[0];
      } else if (navWallet[1]._id == walletId) {
        newWallet = navWallet[1];
      } else if (navWallet[2]._id == walletId) {
        newWallet = navWallet[2];
      }
    }

    let monthly = await WalletMovement.find({
      $or: [
        { wallet: walletId, kind: "Monthly Income" },
        { wallet: walletId, kind: "Monthly Spending" },
        { wallet: walletId, category: "Saving" },
      ],
    });
    let today = new Date();
    let currentMonth = today.getMonth() + 1;
    let currentYear = today.getFullYear();
    let savingArr = [];
    let savingForReminder = 0;
    let movementIncomeArr = [];
    let movementSpendingArr = [];
    let movementArr = [];
    navWallet[0].animalUrl = myUserInfo.animalUrl;

    monthly.forEach((elem) => {
      let month = elem.date.getMonth() + 1;
      if (elem.category == "Saving" && month == currentMonth) {
        savingArr.push(elem);
      }

      if (elem.kind == "Monthly Income") {
        movementIncomeArr.push(elem);
      }

      if (elem.kind == "Monthly Spending") {
        movementSpendingArr.push(elem);
      }
    });

    movementIncomeArr.sort((a, b) => {
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

    movementSpendingArr.sort((a, b) => {
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

    let incomeMonth = movementIncomeArr[0].date.getMonth() + 1;
    let spendingMonth = movementSpendingArr[0].date.getMonth() + 1;

    if (incomeMonth !== currentMonth) {
      let counter = currentMonth - incomeMonth;
      for (counter; counter > 0, counter--; ) {
        let newMonth = currentMonth - counter;
        let date = currentYear + "-" + newMonth + "-" + "01";
        let newMovement = {
          kind: movementIncomeArr[0].kind,
          date,
          amount: movementIncomeArr[0].amount,
          category: movementIncomeArr[0].category,
          wallet: walletId,
        };
        movementArr.push(newMovement);
      }
    }

    if (spendingMonth !== currentMonth) {
      let counter = currentMonth - spendingMonth;
      for (counter; counter > 0, counter--; ) {
        let newMonth = currentMonth - counter;
        let date = currentYear + "-" + newMonth + "-" + "01";
        let newMovement = {
          kind: movementSpendingArr[0].kind,
          date,
          amount: movementSpendingArr[0].amount,
          category: movementSpendingArr[0].category,
          wallet: walletId,
        };
        movementArr.push(newMovement);
      }
    }
    savingForReminder = getSaving(savingArr);

    await WalletMovement.insertMany(movementArr);

    let response = await WalletMovement.find({ wallet: walletId }).populate(
      "wallet"
    );

    let username = "";
    if (response.length == 0) {
      let newDate = new Date();
      let month = newDate.getMonth() + 1;
      let year = newDate.getFullYear();
      newDate = month + "/" + year;

      if (newWallet.user.length > 1) {
        if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
          username = newWallet.user[1].username;
        } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
          username = newWallet.user[0].username;
        }

        res.render("wallet/wallet.hbs", {
          navWallet,
          newWallet,
          newDate,
          username,
        });
      }
      res.render("wallet/wallet.hbs", { newWallet, newDate, navWallet });
    }

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
    let reminder = [];

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

    console.log(newWallet);
    if (newWallet.savingPlan == "Gold") {
      let percent = newWallet.monthlyIncome * 0.6;
      let monthlySaving = newWallet.monthlyIncome - percent;
      let missingSaving = monthlySaving - savingForReminder;
      missingSaving = Number(missingSaving).toFixed(2);
      if (monthlySaving > savingForReminder) {
        reminder.message = `Don't forget to save ${missingSaving} ${newWallet.currency} this month`;
      } else {
        reminder.message = "Good job, you're doing good with your saving plan.";
      }
    } else if (newWallet.savingPlan == "Silver") {
      let percent = newWallet.monthlyIncome * 0.8;
      let monthlySaving = newWallet.monthlyIncome - percent;
      let missingSaving = monthlySaving - savingForReminder;
      missingSaving = Number(missingSaving).toFixed(2);
      if (monthlySaving > savingForReminder) {
        reminder.message = `Don't forget to save ${missingSaving} ${newWallet.currency} this month`;
      } else {
        reminder.message = "Good job, you're doing good with your saving plan.";
      }
    } else if (newWallet.savingPlan == "Bronze") {
      let percent = newWallet.monthlyIncome * 0.9;
      let monthlySaving = newWallet.monthlyIncome - percent;
      let missingSaving = monthlySaving - savingForReminder;
      missingSaving = Number(missingSaving).toFixed(2);
      if (monthlySaving > savingForReminder) {
        reminder.message = `Don't forget to save ${missingSaving} ${newWallet.currency} this month`;
      } else {
        reminder.message = "Good job, you're doing good with your saving plan.";
      }
    }

    if (newWallet.user.length > 1) {
      if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
        username = newWallet.user[1].username;
      } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
        username = newWallet.user[0].username;
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
        reminder,
      });
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
      reminder,
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
  const { walletId } = req.params;
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;

  if (kind == "" || amount == "" || category == "" || date == "") {
    try {
      let response = await WalletMovement.find({ wallet: walletId }).populate(
        "wallet"
      );
      if (response.length == 0) {
        return Wallet.find({ user: mongoose.Types.ObjectId(_id) })
          .populate("user")
          .then((wallet) => {
            let newWallet = wallet;
            let newDate = new Date();
            let month = newDate.getMonth() + 1;
            let year = newDate.getFullYear();
            newDate = month + "/" + year;
            let navWallet = wallet;
            navWallet[0].animalUrl = myUserInfo.animalUrl;

            if (newWallet.user.length > 1) {
              let username = "";
              if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
                username = newWallet.user[1].username;
              } else if (
                newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)
              ) {
                username = newWallet.user[0].username;
              }

              res.render("wallet/wallet.hbs", {
                navWallet,
                newWallet,
                newDate,
                username,
                error: "Please enter all mandatory fields",
              });
            }
            res.render("wallet/wallet.hbs", {
              newWallet,
              navWallet,
              newDate,
              navWallet,
              error: "Please enter all mandatory fields",
            });
          });
      }
      let wallets = await Wallet.find({
        user: mongoose.Types.ObjectId(_id),
      }).populate("user");
      let newWallet = wallets[0];
      let navWallet = wallets;
      navWallet[0].animalUrl = myUserInfo.animalUrl;
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
          username = newWallet.user[1].username;
        } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
          username = newWallet.user[0].username;
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
          error: "Please enter all mandatory fields",
        });
      }

      res.render("wallet/wallet.hbs", {
        response,
        newWallet,
        navWallet,
        newDate,
        balance,
        saving,
        chartData,
        chartLabels,
        chartLabelsTwo,
        chartDataTwo,
        error: "Please enter all mandatory fields",
      });
    } catch (err) {
      next(err);
    }
    return;
  }

  try {
    let navWallet = await Wallet.find({
      user: mongoose.Types.ObjectId(_id),
    }).populate("user");

    let newWallet = [];

    if (navWallet.length == 1) {
      newWallet = navWallet;
    } else if (navWallet.length == 2) {
      if (navWallet[0]._id == walletId) {
        newWallet = navWallet[0];
      } else if (navWallet[1]._id == walletId) {
        newWallet = navWallet[1];
      }
    } else if (navWallet.length == 3) {
      if (navWallet[0]._id == walletId) {
        newWallet = navWallet[0];
      } else if (navWallet[1]._id == walletId) {
        newWallet = navWallet[1];
      } else if (navWallet[2]._id == walletId) {
        newWallet = navWallet[2];
      }
    }

    newWallet = newWallet[0];

    let monthly = await WalletMovement.find({
      wallet: walletId,
      category: "Saving",
    });

    let today = new Date();
    let currentMonth = today.getMonth() + 1;
    let savingArr = [];
    let savingForReminder = 0;

    monthly.forEach((elem) => {
      let month = elem.date.getMonth() + 1;
      if (elem.category == "Saving" && month == currentMonth) {
        savingArr.push(elem);
      }
    });
    savingForReminder = getSaving(savingArr);
    navWallet[0].animalUrl = myUserInfo.animalUrl;

    await WalletMovement.create({
      kind,
      amount,
      category,
      date,
      wallet: walletId,
    });

    let response = await WalletMovement.find({ wallet: walletId }).populate(
      "wallet"
    );

    let username = "";
    if (response.length == 0) {
      return Wallet.findById({ _id: walletId })
        .populate("user")
        .then(() => {
          let newDate = new Date();
          let month = newDate.getMonth() + 1;
          let year = newDate.getFullYear();
          newDate = month + "/" + year;
          navWallet[0].animalUrl = myUserInfo.animalUrl;

          if (newWallet.user.length > 1) {
            if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
              username = newWallet.user[1].username;
            } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
              username = newWallet.user[0].username;
            }

            res.render("wallet/wallet.hbs", {
              navWallet,
              newWallet,
              newDate,
              username,
            });
          }
          res.render("wallet/wallet.hbs", { newWallet, newDate, navWallet });
        });
    }

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
    let reminder = [];

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

    if (newWallet.savingPlan == "Gold") {
      let percent = newWallet.monthlyIncome * 0.6;
      let monthlySaving = newWallet.monthlyIncome - percent;
      let missingSaving = monthlySaving - savingForReminder;
      missingSaving = Number(missingSaving).toFixed(2);
      if (monthlySaving > savingForReminder) {
        reminder.message = `Don't forget to save ${missingSaving} ${newWallet.currency} this month`;
      } else {
        reminder.message = "Good job, you're doing good with your saving plan.";
      }
    } else if (newWallet.savingPlan == "Silver") {
      let percent = newWallet.monthlyIncome * 0.8;
      let monthlySaving = newWallet.monthlyIncome - percent;
      let missingSaving = monthlySaving - savingForReminder;
      missingSaving = Number(missingSaving).toFixed(2);
      if (monthlySaving > savingForReminder) {
        reminder.message = `Don't forget to save ${missingSaving} ${newWallet.currency} this month`;
      } else {
        reminder.message = "Good job, you're doing good with your saving plan.";
      }
    } else if (newWallet.savingPlan == "Bronze") {
      let percent = newWallet.monthlyIncome * 0.9;
      let monthlySaving = newWallet.monthlyIncome - percent;
      let missingSaving = monthlySaving - savingForReminder;
      missingSaving = Number(missingSaving).toFixed(2);
      if (monthlySaving > savingForReminder) {
        reminder.message = `Don't forget to save ${missingSaving} ${newWallet.currency} this month`;
      } else {
        reminder.message = "Good job, you're doing good with your saving plan.";
      }
    }

    if (newWallet.user.length > 1) {
      if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
        username = newWallet.user[1].username;
      } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
        username = newWallet.user[0].username;
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
        reminder,
      });
    }

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
      username,
      reminder,
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
    response.formattedAmountMonthlyIncome = formateAmount(
      response.monthlyIncome
    );
    response.formattedAmountMonthlySpending = formateAmount(
      response.monthlySpending
    );

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

    wallet[0].animalUrl = myUserInfo.animalUrl;

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
    response.formattedAmountMonthlyIncome = formateAmount(
      response.monthlyIncome
    );
    response.formattedAmountMonthlySpending = formateAmount(
      response.monthlySpending
    );

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

    wallet[0].animalUrl = myUserInfo.animalUrl;

    if (
      walletName == "" ||
      currency == "" ||
      startingDate == "" ||
      savingPlan == "" ||
      monthlyIncome == "" ||
      monthlySpending == ""
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

    await Wallet.findByIdAndUpdate(
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
    );
    res.redirect(`/${walletId}`);
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

  try {
    let navWallet = await Wallet.find({
      user: mongoose.Types.ObjectId(_id),
    }).populate("user");
    let newWallet = [];

    if (navWallet.length == 1) {
      newWallet = navWallet;
    } else if (navWallet.length == 2) {
      if (navWallet[0]._id == walletId) {
        newWallet = navWallet[0];
      } else if (navWallet[1]._id == walletId) {
        newWallet = navWallet[1];
      }
    } else if (navWallet.length == 3) {
      if (navWallet[0]._id == walletId) {
        newWallet = navWallet[0];
      } else if (navWallet[1]._id == walletId) {
        newWallet = navWallet[1];
      } else if (navWallet[2]._id == walletId) {
        newWallet = navWallet[2];
      }
    }

    newWallet = newWallet[0];

    navWallet[0].animalUrl = myUserInfo.animalUrl;

    let response = await WalletMovement.find({ wallet: walletId }).populate(
      "wallet"
    );
    let username = "";
    if (response.length == 0) {
      let newDate = new Date();
      let month = newDate.getMonth() + 1;
      let year = newDate.getFullYear();
      newDate = month + "/" + year;

      if (newWallet.user.length > 1) {
        if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
          username = newWallet.user[1].username;
        } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
          username = newWallet.user[0].username;
        }

        res.render("wallet/walletFilter.hbs", {
          navWallet,
          newWallet,
          newDate,
          username,
        });
      }
      res.render("wallet/walletFilter.hbs", { newWallet, newDate, navWallet });
    }

    let newDate = new Date();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    newDate = month + "/" + year;
    let balance = Number(getBalance(response)).toFixed(2);
    let saving = getSaving(response);

    response.forEach((elem) => {
      elem.formattedDate = formateDate(elem.date);
      elem.formattedAmount = formateAmount(elem.amount);
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

    if (newWallet.user.length > 1) {
      if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
        username = newWallet.user[1].username;
      } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
        username = newWallet.user[0].username;
      }

      res.render("wallet/walletFilter.hbs", {
        response,
        navWallet,
        newWallet,
        newDate,
        balance,
        saving,
        username,
      });
    }

    res.render("wallet/walletFilter.hbs", {
      response,
      navWallet,
      newWallet,
      newDate,
      balance,
      saving,
      username,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/:walletId/filter", async (req, res, next) => {
  const {
    income,
    spending,
    saving,
    savingSpending,
    transportation,
    food,
    pet,
    leisure,
    present,
    other,
    startingDate,
    endingDate,
    startingAmount,
    endingAmount,
  } = req.body;
  const { walletId } = req.params;
  let myUserInfo = req.session.myProperty;
  let _id = myUserInfo._id;

  let savingF = "";
  let incomeF = "";
  let spendingF = "";
  let transportationF = "";
  let foodF = "";
  let petF = "";
  let leisureF = "";
  let presentF = "";
  let otherF = "";
  let savingSpendingF = "";
  let startingDateF = "1900-01-01";
  let endingDateF = new Date();
  let startingAmountF = 0;
  let endingAmountF = 10000000000000000000000;

  if (saving) {
    savingF = "Saving";
  }
  if (income) {
    incomeF = "Income";
  }
  if (spending) {
    spendingF = "Spending";
  }
  if (transportation) {
    transportationF = "Transportation";
  }
  if (food) {
    foodF = "Food";
  }
  if (pet) {
    petF = "Pet";
  }
  if (leisure) {
    leisureF = "Leisure";
  }
  if (present) {
    presentF = "Present";
  }
  if (other) {
    otherF = "Other";
  }
  if (savingSpending) {
    savingSpendingF = "Saving Spending";
  }
  if (startingAmount) {
    startingAmountF = startingAmount;
  }
  if (endingAmount) {
    endingAmountF = endingAmount;
  }
  if (startingDate) {
    startingDateF = startingDate;
  }
  if (endingDate) {
    endingDateF = endingDate;
  }

  try {
    let response = [];
    response = await WalletMovement.find({
      $and: [
        {
          $or: [
            { category: savingF },
            { category: incomeF },
            { category: spendingF },
            { category: transportationF },
            { category: foodF },
            { category: petF },
            { category: leisureF },
            { category: presentF },
            { category: otherF },
            { kind: savingSpendingF },
          ],
        },
        { date: { $gte: startingDateF, $lte: endingDateF } },
        {
          amount: { $gte: startingAmountF, $lte: endingAmountF },
        },
        { wallet: walletId },
      ],
    }).populate("wallet");

    let navWallet = await Wallet.find({
      user: mongoose.Types.ObjectId(_id),
    }).populate("user");
    let newWallet = [];

    if (navWallet.length == 1) {
      newWallet = navWallet;
    } else if (navWallet.length == 2) {
      if (navWallet[0]._id == walletId) {
        newWallet = navWallet[0];
      } else if (navWallet[1]._id == walletId) {
        newWallet = navWallet[1];
      }
    } else if (navWallet.length == 3) {
      if (navWallet[0]._id == walletId) {
        newWallet = navWallet[0];
      } else if (navWallet[1]._id == walletId) {
        newWallet = navWallet[1];
      } else if (navWallet[2]._id == walletId) {
        newWallet = navWallet[2];
      }
    }

    newWallet = newWallet[0];

    navWallet[0].animalUrl = myUserInfo.animalUrl;

    let username = "";
    if (response.length == 0) {
      let newDate = new Date();
      let month = newDate.getMonth() + 1;
      let year = newDate.getFullYear();
      newDate = month + "/" + year;

      if (newWallet.user.length > 1) {
        if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
          username = newWallet.user[1].username;
        } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
          username = newWallet.user[0].username;
        }

        res.render("wallet/walletFilter.hbs", {
          navWallet,
          newWallet,
          newDate,
          username,
        });
      }
      res.render("wallet/walletFilter.hbs", { newWallet, newDate, navWallet });
    }

    let newDate = new Date();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    newDate = month + "/" + year;
    let balance = Number(getBalance(response)).toFixed(2);
    let saving = getSaving(response);

    response.forEach((elem) => {
      elem.formattedDate = formateDate(elem.date);
      elem.formattedAmount = formateAmount(elem.amount);
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

    if (newWallet.user.length > 1) {
      if (newWallet.user[0]._id !== mongoose.Types.ObjectId(_id)) {
        username = newWallet.user[1].username;
      } else if (newWallet.user[1]._id !== mongoose.Types.ObjectId(_id)) {
        username = newWallet.user[0].username;
      }

      res.render("wallet/walletFilter.hbs", {
        response,
        navWallet,
        newWallet,
        newDate,
        balance,
        saving,
        username,
      });
    }

    res.render("wallet/walletFilter.hbs", {
      response,
      navWallet,
      newWallet,
      newDate,
      balance,
      saving,
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
