const jwt = require("jsonwebtoken");
const Manager = require("../models/Manager");

module.exports = async (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      const manager = await Manager.findById(decode.manager);

      if (!manager) {
        return res
          .status(401)
          .json({ success: false, message: "unauthorized access!" });
      }

      if (manager.permission !== 1 && manager.permission !== 2) {
        return res
          .status(401)
          .json({ success: false, message: "unauthorized access!" });
      }

      req.manager = manager;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ success: false, message: "unauthorized access!" });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "sesson expired try sign in!",
        });
      }

      res.res
        .status(401)
        .json({ success: false, message: "Internal server error!" });
    }
  } else {
    res.status(401).json({ success: false, message: "unauthorized access!" });
  }
};
