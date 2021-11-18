const { Schema, model } = require("mongoose");

const waleltMovementSchema = new Schema({
  kind: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
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
});

const WalletMovement = model("WalletMovement", waleltMovementSchema);

module.exports = WalletMovement;
