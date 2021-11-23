const { Schema, model } = require("mongoose");
require("./User.model");

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
  monthlyIncome: {
    type: Schema.Types.Decimal128,
  },
  monthlySpending: {
    type: Schema.Types.Decimal128,
  },
  balance: {
    type: Schema.Types.Decimal128,
  },
  saving: {
    type: Schema.Types.Decimal128,
  },
  shared: Boolean,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Wallet = model("Wallet", walletSchema);

module.exports = Wallet;
