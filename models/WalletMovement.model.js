const { Schema, model, Types } = require("mongoose");
require("./Wallet.model");

const walletMovementSchema = new Schema({
  kind: {
    type: String,
    required: true,
  },
  amount: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  wallet: {
    type: Schema.Types.ObjectId,
    ref: "Wallet",
  },
});

const WalletMovement = model("WalletMovement", walletMovementSchema);

module.exports = WalletMovement;
