const { Schema, model } = require("mongoose");
require("./WalletMovement.model");

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
  movements: {
    type: Schema.Types.ObjectId,
    ref: "WalletMovement",
  },
  shared: Boolean,
});

const Wallet = model("Wallet", walletSchema);

module.exports = Wallet;
