const { Schema, model } = require("mongoose");

const walletSchema = new Schema({
  walletName: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    equired: true,
  },
  startingDate: {
    type: Date,
    required: true,
  },
  savingPlan: {
    type: String,
    required: true,
  },
  monthlyIncome: Number,
  monthlySpending: Number,
  shared: Boolean,
});

const Wallet = model("Wallet", walletSchema);

module.exports = Wallet;
