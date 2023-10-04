const controler_name = "order";
const object_name = "Order";
const objects_name = "orders";

const Model = require(`../models/${object_name}`);
const Cart = require("../models/Cart");
const User = require("../models/User");
const Customer = require("../models/Customer");

module.exports = {
  // managers functions

  getAllOrdersForManagers: async (req, res) => {
    try {
      const models = await Model.find().exec();

      return res.status(200).json({
        success: true,
        message: `success to find all ${objects_name} - for managers`,
        [objects_name]: models,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in get all ${objects_name} - for -managers`,
        error: error.message,
      });
    }
  },

  updateStatusForManagers: async (req, res) => {
    try {
      const id = req.params.id;

      await Model.findByIdAndUpdate(id, { status: req.body.status }).exec();

      return res.status(200).json({
        success: true,
        message: `success to update ${controler_name} status by id - for managers`,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in update ${controler_name} status by id - for managers`,
        error: error.message,
      });
    }
  },

  getOrderByIdForManagers: async (req, res) => {
    try {
      const models = await Model.findById(req.params.id)
        .populate([/* 'user', */ "products.product"])
        .exec();

      return res.status(200).json({
        success: true,
        message: `success to find ${controler_name} by id - for managers`,
        [controler_name]: models,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in find ${controler_name} by id} - for managers`,
        error: error.message,
      });
    }
  },
  deleteOrderByIdForManagers: async (req, res) => {
    try {
      const id = req.params.id;

      await Model.findByIdAndDelete(id).exec();

      return res.status(200).json({
        success: true,
        message: `success to delete ${controler_name} by id - for managers`,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in delete ${controler_name} by id - for managers`,
        error: error.message,
      });
    }
  },

  //___________________

  // guests functions

  addNewOrderForGuest: async (req, res) => {
    try {
      // gettind values from the body request
      const { payment_details, products, customer_details } = req.body;

      // creating new model using the values from req.body
      const new_model = new Model({
        payment_details,
        products,
        customer_details,
      });
      await new_model.save();

      return res.status(200).json({
        success: true,
        message: `success to add new ${controler_name} - for guest`,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in add ${controler_name} - for guest`,
        error: error.message,
      });
    }
  },

  //___________________

  createOrder: async (req, res) => {
    try {
      const { cartId, user, total_price, payment_details, products, payload } =
        req.body;
      const cart = await Cart.findById(cartId)
        .populate(["user", "products.product"])
        .exec();
      const customer = await Customer.findById(user._id);

      const items = [];
      cart.products.forEach((product) => {
        items.push({
          product: product.product._id,
          RTP: product.product.product_price,
          quantity: product.amount,
        });
      });

      const new_model = new Model({
        user: customer,
        customer_details: {
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          customer_address: {
            city: customer.address.city,
            street: customer.address.street,
            building: customer.address.building,
          },
        },

        total_price: cart.totalAmount,
        payment_details: {
          terminal_number: payload.paymentIntent.client_secret,
          transaction_number: payload.paymentIntent.created,
          transaction_date: Date.now(),
          last_digits: 4242,
        },
        products: items,
      });

      await new_model.save();

      await Customer.findByIdAndUpdate(user._id, {
        orders: new_model._id,
      });

      return res.status(200).json({
        success: true,
        message: `success to add new ${controler_name}`,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in add ${controler_name}`,
        error: error.message,
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const models = await Model.find()
        .populate(["user", "products.product"])
        .exec();

      return res.status(200).json({
        success: true,
        message: `success to find all ${objects_name}`,
        [objects_name]: models,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in get all ${objects_name}`,
        error: error.message,
      });
    }
  },

  getById: async (req, res) => {
    try {
      const models = await Model.findById(req.params.id)
        .populate(["user", "products.product"])
        .exec();

      return res.status(200).json({
        success: true,
        message: `success to find ${controler_name} by id`,
        [objects_name]: models,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in find ${controler_name} by id}`,
        error: error.message,
      });
    }
  },

  updateById: async (req, res) => {
    try {
      const id = req.params.id;

      await Model.findByIdAndUpdate(id, req.body).exec();

      return res.status(200).json({
        success: true,
        message: `success to update ${controler_name} by id`,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in update ${controler_name} by id`,
        error: error.message,
      });
    }
  },

  deleteById: async (req, res) => {
    try {
      const id = req.params.id;

      await Model.findByIdAndDelete(id).exec();

      return res.status(200).json({
        success: true,
        message: `success to delete ${controler_name} by id`,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in delete ${controler_name} by id`,
        error: error.message,
      });
    }
  },
  getAfterDate: async (req, res) => {
    const { date } = req.params;
    try {
      const models = await Model.find()
        .populate(["user", "products.product"])
        .exec();
      models.filter((model) => model.created_at >= date);

      return res.status(200).json({
        success: true,
        message: `success to find ${controler_name} by id`,
        [objects_name]: models,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in find ${controler_name} by id}`,
        error: error.message,
      });
    }
  },
  getStaysTodayActivity: async (req, res) => {
    const timeElapsed = Date.now();
    let today = new Date(timeElapsed).toDateString().slice(4);
    try {
      const models = await Model.find()
        .populate(["user", "products.product"])
        .exec();
      const filterOrders = models.filter(
        (model) => model.created_at.toDateString().slice(4) === today
      );

      return res.status(200).json({
        success: true,
        message: `success to find ${controler_name} by id`,
        [objects_name]: filterOrders,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in find ${controler_name} by id}`,
        error: error.message,
      });
    }
  },
};
