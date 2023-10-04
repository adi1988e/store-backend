const Product = require("../models/Product");

let controler_name = "customer";
let object_name = "Customer";
let objects_name = "customers";

let Model = require(`../models/${object_name}`);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  addCustomer: async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        phone,
        city,
        street,
        building,
        appartment,
      } = req.body;

      const address = {
        city,
        street,
        building,
        appartment,
      };
      const new_model = new Model({
        name,
        email,
        password,
        phone: phone || "",
        address: address || "",
      });
      await new_model.save();

      return res.status(200).json({
        success: true,
        message: `success to add new ${controler_name}`,
        user: new_model,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in add ${controler_name}`,
        error: error.message,
      });
    }
  },

  getAllCustomers: async (req, res) => {
    try {
      const models = await Model.find()
        .populate(["cart.productId", "orders.order"])
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
        .populate("orders.order")
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

  updateCustomerById: async (req, res) => {
    try {
      const id = req.params.customer_id;
      const customer = await Model.findByIdAndUpdate(
        id,
        req.body.data.data
      ).exec();

      return res.status(200).json({
        success: true,
        message: `success to update ${controler_name} by id`,
        customer: customer,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in update ${controler_name} by id`,
        error: error.message,
      });
    }
  },

  deleteCustomerByIdForManager: async (req, res) => {
    try {
      const id = req.params.customer_id;

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
  loginCustomer: async (req, res) => {
    try {
      const { identifier, password } = req.body;
      const user = await Model.findOne({ email: identifier });
      if (!user) {
        throw new Error("bad creditians");
      }
      const equal = await bcrypt.compare(password, user.password);
      if (!equal) {
        throw new Error("bad creditians");
      }

      let payload = {
        user: user._id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 1000,
      });

      let oldTokens = user.tokens || [];

      if (oldTokens.length) {
        oldTokens = oldTokens.filter((t) => {
          const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
          if (timeDiff < 1000) {
            return t;
          }
        });
      }

      await Model.findByIdAndUpdate(user._id, {
        tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
      }).exec();

      return res.status(201).json({
        success: true,
        message: "user login seccessfully",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          cart: user.cart,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "error in login request",
        error: error.message,
      });
    }
  },

  logoutCustomer: async (req, res) => {
    if (req.headers && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
          return res
            .status(401)
            .json({ success: false, message: "Authorization fail!" });
        }

        const tokens = req.manager.tokens;

        const newTokens = tokens.filter((t) => t.token !== token);

        await Model.findByIdAndUpdate(req.manager._id, {
          tokens: newTokens,
        }).exec();

        res.clearCookie("token");

        return res.status(200).json({
          success: true,
          message: "success to logout manager",
        });
      } catch (error) {
        return res.status(500).json({
          message: "error in logout request",
          error: error.message,
        });
      }
    }
  },

  authCustomer: async (req, res) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new Error("no token provided");
      }

      const bearer = token.split(" ")[1];
      const decode = jwt.verify(bearer, process.env.JWT_SECRET);
      const user = await Model.findById(decode.user)
        .populate("orders.order")
        .exec();

      if (!user) {
        throw new Error("access denided");
      }

      const status = user.tokens.some((t) => t.token == bearer);
      if (!status) {
        throw new Error("no access");
      }

      let payload = {
        user: user._id,
      };
      const new_token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 10800,
      });
      const updatedTokens = user.tokens.filter((t) => t.token !== bearer);
      await Model.findByIdAndUpdate(user._id, {
        tokens: [...updatedTokens, { token: new_token, signedAt: Date.now() }],
      }).exec();

      return res.status(201).json({
        success: true,
        message: "user authoraized",
        token: new_token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          orders: user.orders,
        },
      });
    } catch (error) {
      return res.status(401).json({
        message: "unauthoraized",
        error: error.message,
      });
    }
  },
};
