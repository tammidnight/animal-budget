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
      res.redirect("/profile");
    })
    .catch((err) => next(err));
});

router.get("/:walletId", checkLogIn, (req, res, next) => {
  const { walletId: _id } = req.params;

  WalletMovement.find({ wallet: _id })
    .populate("wallet")
    .then((response) => {
      let wallet = response.wallet;
      let date = new Date();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      date = month + "/" + year;

      res.render("wallet/wallet.hbs", { response, wallet, date });
    })
    .catch((err) => next(err));
});

router.post("/:walletId", (req, res, next) => {
  const { kind, amount, category, date } = req.body;
  const { walletId: wallet } = req.params;

  WalletMovement.create({ kind, amount, category, date, wallet })
    .then((movement) => {
      if (kind == "" || amount == "" || category == "" || date == "") {
        res.render("wallet/wallet.hbs", {
          error: "Please enter all mandatory fields",
        });
        return;
      }
      return WalletMovement.find({ wallet }).populate("wallet");
    })
    .then((response) => {
      let wallet = response.wallet;
      let date = new Date();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      date = month + "/" + year;

      res.render("wallet/wallet.hbs", { response, wallet, date });
    })
    .catch((err) => next(err));
});

router.get("/:walletId/edit", checkLogIn, (req, res, next) => {
  const { walletId: _id } = req.params;

  WalletMovement.find({ wallet: _id })
    .populate("wallet")
    .then((response) => {
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

module.exports = router;
