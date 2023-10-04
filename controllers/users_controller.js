let controler_name = "user";
let object_name = "User";
let objects_name = "users";

let Model = require(`../models/${object_name}`);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  add: async (req, res) => {
    try {
      const { user_name, user_email, user_password, user_phone, user_address } =
        req.body;

      const new_model = new Model({
        user_name,
        user_email,
        user_password,
        user_phone: user_phone || "",
        user_address: user_address || "",
      });

      await new_model.save();

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
      const models = await Model.find().populate(["cart"]).exec();

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
        .populate(["user_cart", "user_orders.order"])
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
  signUp: async (req, res) => {
    try {
      const { name, email, password, phone, address } = req.body;

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
        message: `success to signup`,
        user: new_model,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in add ${controler_name}`,
        error: error.message,
      });
    }
  },
  login: async (req, res) => {
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
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "error in login request",
        error: error.message,
      });
    }
  },

  logout: async (req, res) => {
    if (req.headers && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
          return res
            .status(401)
            .json({ success: false, message: "Authorization fail!" });
        }

        const tokens = req.user.tokens;
        const newTokens = tokens.filter((t) => t.token !== token);
        await Model.findByIdAndUpdate(req.user._id, {
          tokens: newTokens,
        }).exec();

        res.clearCookie("token");

        return res.status(200).json({
          success: true,
          message: "success to logout user",
        });
      } catch (error) {
        return res.status(500).json({
          message: "error in logout request",
          error: error.message,
        });
      }
    }
  },

  authToken: async (req, res) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new Error("no token provided");
      }

      const bearer = token.split(" ")[1];
      const decode = jwt.verify(bearer, process.env.JWT_SECRET);
      const user = await Model.findById(decode.user).exec();
      if (!user || user.roles !== 3) {
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
        },
      });
    } catch (error) {
      return res.status(401).json({
        message: "unauthoraized",
        error: error.message,
      });
    }
  },

  getCustomerByIdForManager: async (req, res) => {
    try {
      const models = await Model.findById(req.params.user_id); /* .populate([
        "user_cart",
        "user_orders.order",
      ]).exec() */

      return res.status(200).json({
        success: true,
        message: `success to find ${controler_name} by id - for manager`,
        [controler_name]: models,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in find ${controler_name} by id - for manager`,
        error: error.message,
      });
    }
  },

  // managers requests
  getAllCustomersForManager: async (req, res) => {
    try {
      /*       const models = await Model.find().populate([
        "user_cart",
        "user_orders.order",
      ]).exec(); */

      const models = await Model.find().exec();

      return res.status(200).json({
        success: true,
        message: `success to find all ${objects_name} - for manager`,
        [objects_name]: models,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in get all ${objects_name}  - for manager`,
        error: error.message,
      });
    }
  },
  deleteUserByIdForManager: async (req, res) => {
    try {
      const id = req.params.user_id;

      await Model.findByIdAndDelete(id).exec();

      return res.status(200).json({
        success: true,
        message: `success to delete ${controler_name} by id -  - for managers`,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in delete ${controler_name} by id - for managers`,
        error: error.message,
      });
    }
  },
  addUserForManager: async (req, res) => {
    try {
      const { name, email, password, phone, address } = req.body;

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
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in add ${controler_name}`,
        error: error.message,
      });
    }
  },

  updateUserByIdForManager: async (req, res) => {
    try {
      const id = req.params.user_id;

      await Model.findByIdAndUpdate(id, req.body.data).exec();

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

  getCartItems: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await Model.findById(id).populate("cart.productId");
      const products = user.cart;
      const total_amount = products.reduce(
        (accumulator, currentValue) =>
          accumulator +
          currentValue.amount * currentValue.productId.product_price,
        0
      );
      return res.status(200).json({
        success: true,
        message: `Success to get the cart`,
        data: { products, total_amount: total_amount },
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in get the cart`,
        error: error.message,
      });
    }
  },
};
