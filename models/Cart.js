const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cart_schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 1,
        max: 20,
      },
    },
  ],
  totalQuantity: {
    type: Number,
  },
  totalAmount: {
    type: Number,
  },
});

cart_schema.methods.addToCart = function (cartItem) {
  const { amount, _id, product_price } = cartItem;
  const cartProductIndex = this.products.findIndex((cp) => {
    return cp.product._id.toString() === _id.toString();
  });
  let newQuantity = amount;
  const updatedCartItems = [...this.products];

  if (cartProductIndex >= 0) {
    newQuantity = this.products[cartProductIndex].amount + amount;
    updatedCartItems[cartProductIndex].amount = newQuantity;
  } else {
    updatedCartItems.push({
      product: _id,
      amount: newQuantity,
    });
  }
  const updatedCart = updatedCartItems;
  this.products = updatedCart;
  this.totalQuantity += amount;
  this.totalAmount += product_price * amount;
  return this.save();
};

cart_schema.methods.deleteItemFromCart = function (cartItem) {
  const updateCart = this.products.filter((cp) => {
    return cp.product._id.toString() !== cartItem;
  });
  this.products = updateCart;

  const quantity = 0;
  const amount = 0;
  const total_quantity = this.products.reduce(
    (accumulator, currentValue) => accumulator + currentValue.amount,
    quantity
  );
  const total_amount = this.products.reduce(
    (accumulator, currentValue) =>
      accumulator + currentValue.amount * currentValue.product.product_price,
    amount
  );
  this.totalQuantity = total_quantity;
  this.totalAmount = total_amount;
  return this.save();
};
cart_schema.methods.toggleCartItemAmount = function (cartItem) {
  const [productId, value] = cartItem;
  const cartProductIndex = this.products.findIndex((product) => {
    return product.product._id.toString() === productId;
  });
  if (value === "inc") {
    this.products[cartProductIndex].amount += 1;

    if (
      this.products[cartProductIndex].amount >=
      this.products[cartProductIndex].product.stock
    ) {
      this.products[cartProductIndex].amount =
        this.products[cartProductIndex].product.stock;
    }
  }
  if (value === "dec") {
    this.products[cartProductIndex].amount -= 1;
    if (this.products[cartProductIndex].amount < 1) {
      this.products[cartProductIndex].amount = 1;
    }
  }

  const quantity = 0;
  const amount = 0;
  const total_quantity = this.products.reduce(
    (accumulator, currentValue) => accumulator + currentValue.amount,
    quantity
  );
  const total_amount = this.products.reduce(
    (accumulator, currentValue) =>
      accumulator + currentValue.amount * currentValue.product.product_price,
    amount
  );
  this.totalQuantity = total_quantity;
  this.totalAmount = total_amount;
  return this.save();
};

module.exports = mongoose.model("carts", cart_schema);
