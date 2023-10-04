const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

module.exports = async (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decode.admin);

      if (!admin) {
        return res.json({ success: false, message: "unauthorized access!" });
      }

      if (admin.permission !== 2) {
        return res.json({ success: false, message: "unauthorized access!" });
      }

      req.admin = admin;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.json({ success: false, message: "unauthorized access!" });
      }
      if (error.name === "TokenExpiredError") {
        return res.json({
          success: false,
          message: "sesson expired try sign in!",
        });
      }

      res.res.json({ success: false, message: "Internal server error!" });
    }
  } else {
    res.json({ success: false, message: "unauthorized access!" });
  }
};
