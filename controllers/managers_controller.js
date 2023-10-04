let controler_name = "manager";
let object_name = "Manager";
let objects_name = "managers";

let Model = require(`../models/${object_name}`);
const cloudinary = require("cloudinary").v2;

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  // functions for admins
  addManagerForAdmins: async (req, res) => {
    try {
      const {
        manager_name,
        manager_email,
        manager_password,
        manager_phone,
        manager_address,
      } = req.body;

      const new_model = new Model({
        manager_name,
        manager_email,
        manager_password,
        manager_phone: manager_phone || "",
        manager_address: manager_address || "",
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
  updateManagerByIdForAdmin: async (req, res) => {
    try {
      const id = req.params.manager_id;

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
  deleteManagerByIdForAdmin: async (req, res) => {
    try {
      const id = req.params.manager_id;

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
  getAllManagers: async (req, res) => {
    try {
      const models = await Model.find();

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
        .populate(["manager_cart", "manager_orders.order"])
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
    let data;
    let user_image = "";
    const { fullName, user_phone, user_address, avatar, password } = req.body;

    if (req.file !== undefined) {
      data = await cloudinary.uploader.upload(req.file.path);
      user_image = data.secure_url;
    }

    const manager = {
      manager_name: fullName,
      manager_phone: user_phone,
      manager_address: user_address,
      avatar: user_image,
      manager_password: password,
    };

    try {
      const id = req.params.user_id;
      await Model.findByIdAndUpdate(id, manager).exec();
      return res.status(200).json({
        success: true,
        message: `success to update ${controler_name} by id`,
        data: manager,
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
  loginManager: async (req, res) => {
    try {
      const { email, password } = req.body;

      const manager = await Model.findOne({
        manager_email: email,
      });
      if (!manager) {
        throw new Error("bad creditians");
      }

      const equal = await bcrypt.compare(password, manager.manager_password);
      if (!equal) {
        throw new Error("bad creditians");
      }

      let payload = {
        manager: manager._id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      let oldTokens = manager.tokens || [];

      if (oldTokens.length) {
        oldTokens = oldTokens.filter((t) => {
          const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
          if (timeDiff < 1000) {
            return t;
          }
        });
      }

      await Model.findByIdAndUpdate(manager._id, {
        tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
      }).exec();

      return res.status(201).json({
        success: true,
        message: "login seccessfully",
        token,
        manager: {
          _id: manager._id,
          manager_name: manager.manager_name,
          manager_email: manager.manager_email,
          avatar: manager.avatar,
          token,
        },
      });
    } catch (error) {
      return res.status(401).json({
        message: "error in login request",
        error: error.message,
      });
    }
  },
  logoutManager: async (req, res) => {
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
  authManager: async (req, res) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new Error("no token provided");
      }

      const bearer = token.split(" ")[1];
      const decode = jwt.verify(bearer, process.env.JWT_SECRET);
      const manager = await Model.findById(decode.manager).exec();

      if (!manager) {
        throw new Error("access denided");
      }

      const status = manager.tokens.some((t) => t.token == bearer);
      if (!status) {
        throw new Error("no access");
      }

      let payload = {
        manager: manager._id,
      };
      const new_token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 10800,
      });
      const updatedTokens = manager.tokens.filter((t) => t.token !== bearer);
      await Model.findByIdAndUpdate(manager._id, {
        tokens: [...updatedTokens, { token: new_token, signedAt: Date.now() }],
      }).exec();

      return res.status(201).json({
        success: true,
        message: "manager authoraized",
        token: new_token,
        manager: {
          _id: manager._id,
          manager_name: manager.manager_name,
          manager_email: manager.manager_email,
          manager_address: manager.manager_address,
          manager_phone: manager.manager_phone,
          avatar: manager.avatar,
          token: new_token,
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
