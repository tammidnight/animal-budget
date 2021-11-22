const router = require("express").Router();
const User = require("../models/User.model");
const Wallet = require("../models/Wallet.model");
const WalletMovement = require("../models/WalletMovement.model");

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
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  return result;
};

const formateAmount = (amount) => {
  const result = Number(amount).toFixed(2);
  return result;
};

const getBalance = (movement) => {
  let balance = 0;

  movement.forEach((elem) => {
    if (elem.kind == "Income") {
      balance = balance + Number(elem.amount);
    } else if (elem.kind == "Spending") {
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
  res.render("wallet/createWallet.hbs");
});

router.post("/create", (req, res, next) => {
  const {
    walletName,
    currency,
    startingDate,
    savingPlan,
    monthlyIncome,
    monthlySpending,
    shared,
  } = req.body;

  let user = req.session.myProperty._id;

  if (
    walletName == "" ||
    currency == "" ||
    startingDate == "" ||
    savingPlan == ""
  ) {
    res.render("wallet/createWallet.hbs", {
      error: "Please enter all mandatory fields",
    });
    return;
  }

  Wallet.create({
    walletName,
    currency,
    startingDate,
    savingPlan,
    monthlyIncome,
    monthlySpending,
    shared,
    user,
  })
    .then(() => {
      res.redirect("/profile");
    })
    .catch((err) => next(err));
});

router.get("/:walletId", checkLogIn, (req, res, next) => {
  const { walletId: _id } = req.params;

  WalletMovement.find({ wallet: _id })
    .populate("wallet")
    .then((response) => {
      if (response.length == 0) {
        return Wallet.findById({ _id }).then((wallet) => {
          let date = new Date();
          let month = date.getMonth() + 1;
          let year = date.getFullYear();
          date = month + "/" + year;
          res.render("wallet/wallet.hbs", { wallet, date });
        });
      }
      let wallet = response[0].wallet;
      let date = new Date();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      date = month + "/" + year;
      let monthlyBalance =
        Number(wallet.monthlyIncome).toFixed(2) -
        Number(wallet.monthlySpending).toFixed(2);
      let balance = Number(getBalance(response)).toFixed(2) + monthlyBalance;
      balance = Number(balance).toFixed(2);
      let saving = getSaving(response);

      response.forEach((elem) => {
        elem.formattedDate = formateDate(elem.date);
        elem.formattedAmount = formateAmount(elem.amount);
      });

      response.sort((a, b) => {
        let keyA = a.formattedDate;
        let keyB = b.formattedDate;
        if (keyA < keyB) {
          return -1;
        }
        if (keyA > keyB) {
          return 1;
        }
        return 0;
      });
      res.render("wallet/wallet.hbs", {
        response,
        wallet,
        date,
        balance,
        saving,
      });
    })
    .catch(() => next());
});

router.post("/:walletId", (req, res, next) => {
  const { kind, amount, category, date } = req.body;
  const { walletId: wallet } = req.params;

  if (kind == "" || amount == "" || category == "" || date == "") {
    WalletMovement.find({ wallet })
      .populate("wallet")
      .then((response) => {
        let wallet = response[0].wallet;
        let date = new Date();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        date = month + "/" + year;
        let monthlyBalance =
          Number(wallet.monthlyIncome).toFixed(2) -
          Number(wallet.monthlySpending).toFixed(2);
        let balance = Number(getBalance(response)).toFixed(2) + monthlyBalance;
        balance = Number(balance).toFixed(2);
        let saving = getSaving(response);

        response.forEach((elem) => {
          elem.formattedDate = formateDate(elem.date);
          elem.formattedAmount = formateAmount(elem.amount);
        });

        response.sort((a, b) => {
          let keyA = a.date;
          let keyB = b.date;
          if (keyA < keyB) {
            return -1;
          }
          if (keyA > keyB) {
            return 1;
          }
          return 0;
        });

        res.render("wallet/wallet.hbs", {
          response,
          wallet,
          date,
          balance,
          saving,
          error: "Please enter all mandatory fields",
        });
      })
      .catch((err) => next(err));
    return;
  }

  WalletMovement.create({ kind, amount, category, date, wallet })
    .then(() => {
      return WalletMovement.find({ wallet }).populate("wallet");
    })
    .then((response) => {
      let wallet = response[0].wallet;
      let date = new Date();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      date = month + "/" + year;
      let balance = getBalance(response);
      let saving = getSaving(response);

      response.forEach((elem) => {
        elem.formattedDate = formateDate(elem.date);
        elem.formattedAmount = formateAmount(elem.amount);
      });

      response.sort((a, b) => {
        let keyA = a.date;
        let keyB = b.date;
        if (keyA < keyB) {
          return -1;
        }
        if (keyA > keyB) {
          return 1;
        }
        return 0;
      });

      res.render("wallet/wallet.hbs", {
        response,
        wallet,
        date,
        balance,
        saving,
      });
    })
    .catch((err) => next(err));
});

router.get("/:walletId/edit", checkLogIn, (req, res, next) => {
  const { walletId: _id } = req.params;

  Wallet.find({ _id })
    .then((response) => {
      response = response[0];
      response.formattedDateForInput = formateDateForInput(
        response.startingDate
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

      res.render("wallet/editWallet.hbs", { response });
    })
    .catch((err) => next(err));
});

router.post("/:walletId/edit", (req, res, next) => {
  const {
    walletName,
    currency,
    startingDate,
    savingPlan,
    monthlyIncome,
    monthlySpending,
    shared,
  } = req.body;

  const { walletId: _id } = req.params;

  if (
    walletName == "" ||
    currency == "" ||
    startingDate == "" ||
    savingPlan == ""
  ) {
    res.render("wallet/createWallet.hbs", {
      error: "Please enter all mandatory fields",
    });
    return;
  }

  Wallet.findByIdAndUpdate(
    { _id },
    {
      walletName,
      currency,
      startingDate,
      savingPlan,
      monthlyIncome,
      monthlySpending,
      shared,
    }
  )
    .then((response) => {
      if (
        walletName == "" ||
        currency == "" ||
        startingDate == "" ||
        savingPlan == ""
      ) {
        res.render("wallet/editWallet.hbs", {
          error: "Please enter all mandatory fields",
        });
        return;
      }
      res.redirect(`/${_id}`);
    })
    .catch((err) => next(err));
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

router.get("/:walletId/history", checkLogIn, (req, res, next) => {
  const { walletId: _id } = req.params;

  WalletMovement.find({ wallet: _id })
    .populate("wallet")
    .then((response) => {
      res.render("wallet/walletHistory.hbs", { response });
    })
    .catch((err) => next(err));
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
