const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const user_schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    match: /^([0]\d{1,3}[-])?\d{7,10}$/,
  },

  address: {
    city: {
      type: String,
      trim: true,
    },
    street: {
      type: String,
      trim: true,
    },

    building: {
      type: String,
      trim: true,
    },

    appartment: {
      type: String,
      trim: true,
    },
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Carts",
  },

  orders: [
    {
      order: {
        type: mongoose.Types.ObjectId,
        ref: "Orders",
      },
    },
  ],
  roles: {
    type: Number,
    default: 3,
  },

  tokens: [{ type: Object }],
});

user_schema.pre("save", async function (next) {
  const hash = await bcrypt.hash(this.password, 15);
  this.password = hash;
  next();
});

module.exports = mongoose.model("User", user_schema);
