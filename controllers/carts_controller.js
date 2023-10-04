let controler_name = "cart";
let object_name = "Cart";
let objects_name = "carts";

let Model = require(`../models/${object_name}`);
const User = require("../models/User");
const Customer = require("../models/Customer");

module.exports = {
  add: async (req, res) => {
    const { product, amount, cartId, user } = req.body;

    try {
      if (cartId === "") {
        const new_model = new Model({
          user: user._id,
          products: [{ product: product._id, amount: amount }],
          totalQuantity: amount,
          totalAmount: product.product_price * amount,
        });

        if (user._id) {
          const customer = await Customer.findByIdAndUpdate(user._id, {
            cart: new_model._id,
          });
        }
        await new_model.populate("products.product");

        await new_model.save();
        return res.status(200).json({
          success: true,
          message: `success to update the ${controler_name}`,
          data: {
            products: new_model.products,
            totalQuantity: new_model.totalQuantity,
            cartId: new_model._id,
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  getById: async (req, res) => {
    try {
      const models = await Model.findById(req.params.id)
        .populate("products.product")
        .exec();

      return res.status(200).json({
        success: true,
        message: `success to find ${controler_name} by id`,
        data: models,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in find ${controler_name} by id}`,
        error: error.message,
      });
    }
  },

  updateById: async (req, res) => {
    const {
      product: { product_price, _id },
      amount,
      user,
      cartId,
    } = req.body;
    try {
      const id = req.params.id;
      if (user._id) {
        const customer = await User.findByIdAndUpdate(user._id, {
          cart: id,
        });
      }

      const cart = await Model.findById(id);
      await cart.populate("products.product");
      await cart.addToCart({ amount, _id, product_price });

      return res.status(200).json({
        success: true,
        message: "success to add item to cart",
        data: {
          products: cart.products,
          totalQuantity: cart.totalQuantity,
          totalAmount: cart.totalAmount,
          cartId: cart._id,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in update ${controler_name} by id`,
        error: error.message,
      });
    }
  },
  clearCart: async (req, res) => {
    const id = req.params.id;
    try {
      await Model.findByIdAndUpdate(id, {
        products: [],
        totalQuantity: 0,
        totalAmount: 0,
      }).exec();

      return res.status(200).json({
        success: true,
        message: "success to clear the cart",
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in update ${controler_name} by id`,
        error: error.message,
      });
    }
  },

  deleteItemFromCart: async (req, res) => {
    const { productId, cartId } = req.body;
    try {
      const cart = await Model.findById(cartId).populate("products.product");
      cart.deleteItemFromCart(productId);
      return res.status(200).json({
        success: true,
        message: `Success to delete product`,
        data: cart,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in delete product`,
        error: error.message,
      });
    }
  },
  toggleCartItemAmount: async (req, res) => {
    const [productId, value, cartId] = req.body;
    try {
      const cart = await Model.findById(cartId).populate("products.product");
      cart.toggleCartItemAmount([productId, value]);

      return res.status(200).json({
        success: true,
        message: `Success to toggle product`,
        data: cart,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in toggle product`,
        error: error.message,
      });
    }
  },
};
