let controler_name = "admin";
let object_name = "Admin";
let objects_name = "admins";

let Model = require(`../models/${object_name}`);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  addAdminForAdmins: async (req, res) => {
    try {
      const {
        admin_name,
        admin_email,
        admin_password,
        admin_phone,
        admin_address,
      } = req.body;
      const new_model = new Model({
        admin_name,
        admin_email,
        admin_password,
        admin_phone: admin_phone || "",
        admin_address: admin_address || "",
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
      const models = await Model.find()
        .populate(["admin_cart", "admin_orders.order"])
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
        .populate(["admin_cart", "admin_orders.order"])
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
  login: async (req, res) => {
    try {
      const { admin_email, admin_password } = req.body;

      const admin = await Model.findOne({ admin_email });

      if (!admin) {
        throw new Error("bad creditians");
      }

      const equal = await bcrypt.compare(admin_password, admin.admin_password);

      if (!equal) {
        throw new Error("bad creditians");
      }

      let payload = {
        admin: admin._id,
      };

      const token = jwt.sign(payload, "humusim", {
        expiresIn: 1000,
      });

      let oldTokens = admin.tokens || [];

      if (oldTokens.length) {
        oldTokens = oldTokens.filter((t) => {
          const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
          if (timeDiff < 1000) {
            return t;
          }
        });
      }

      await Model.findByIdAndUpdate(admin._id, {
        tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
      }).exec();

      return res.status(201).json({
        success: true,
        message: "admin login seccessfully",
        token,
        admin: {
          _id: admin._id,
          admin_name: admin.admin_name,
          admin_email: admin.admin_email,
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

        const tokens = req.admin.tokens;

        const newTokens = tokens.filter((t) => t.token !== token);

        await Model.findByIdAndUpdate(req.admin._id, {
          tokens: newTokens,
        }).exec();

        res.clearCookie("token");

        return res.status(200).json({
          success: true,
          message: "success to logout admin",
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

      const admin = await Model.findById(decode.admin).exec();

      if (!admin) {
        throw new Error("admin not exists");
      }

      return res.status(201).json({
        success: true,
        message: "admin authoraized",
        token,
        admin: {
          _id: admin._id,
          admin_name: admin.admin_name,
          admin_email: admin.admin_email,
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
