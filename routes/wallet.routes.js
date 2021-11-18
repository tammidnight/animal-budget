const router = require("express").Router();
const User = require("../models/User.model");
const Wallet = require("../models/Wallet.model");
const WalletMovement = require("../models/WalletMovement.model");

router.get("/create", (req, res, next) => {
  res.render("wallet/createWallet.hbs");
});

router.post("/create", (req, res, next) => {
  let {
    walletName,
    currency,
    startingDate,
    savingPlan,
    monthlyIncome,
    monthlySpending,
    shared,
  } = req.body;

  Wallet.create({
    walletName,
    currency,
    startingDate,
    savingPlan,
    monthlyIncome,
    monthlySpending,
    shared,
  })
    .then((response) => {
      if (
        walletName == "" ||
        currency == "" ||
        startingDate == "" ||
        savingPlan == ""
      ) {
        res.render("createWallet.hbs", {
          error: "Please enter all mandatory fields",
        });
        return;
      }
      res.redirect("/profile", { response });
    })
    .catch((err) => next(err));
});

router.get("/:walletId", (req, res, next) => {
  let { walletId } = req.params;
  res.render("wallet/wallet.hbs", { walletId });
});

router.post("/:walletId", (req, res, next) => {
  let { kind, amount, category, date } = req.body;
  let { walletId } = req.params;
  WalletMovement.create({ kind, amount, category, date })
    .then((response) => {
      res.render("wallet/wallet.hbs", { response });
      // need to update Wallet with new WalletMovement
    })
    .catch((err) => next(err));
});

module.exports = router;
