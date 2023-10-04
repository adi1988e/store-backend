const Product = require("../models/Product");

let controler_name = "product";
let object_name = "Product";
let objects_name = "products";
const cloudinary = require("cloudinary").v2;
let Model = require(`../models/${object_name}`);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

module.exports = {
  getAll: async (req, res) => {
    try {
      /*       const { page = 1, limit = 3} = req.query;

      const count = await Model.count();

      console.log(count);

      const pages = Math.ceil(count / limit);

      console.log(pages);

      const models = await Model.find().skip((page - 1 ) * limit).limit(limit).exec(); */

      const models = await Model.find().exec();
      return res.status(200).json({
        success: true,
        message: `success to find all ${objects_name}`,
        /*         limit,
        count,
        pages, */
        [objects_name]: models,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in get all ${objects_name}`,
        error: error.message,
      });
    }
  },

  // manager functions

  addProductForManager: async (req, res) => {
    try {
      let data;
      let product_image = "";

      const {
        product_name,
        product_description = "",
        product_price,
        company,
        categories,
        featured,
        stock,
        reviews,
        stars,
        discount,
      } = req.body;

      const fix_categories = JSON.parse(categories);

      if (req.file !== undefined) {
        data = await cloudinary.uploader.upload(req.file.path);
        product_image = data.secure_url;
      }

      fix_categories.map((category) => {
        return {
          category: category._id,
          category_name: category.category_name,
        };
      });

      if (req.file !== undefined) {
        data = await cloudinary.uploader.upload(req.file.path);
        product_image = data.secure_url;
      }

      // creating new model using the values from req.body
      const new_model = new Model({
        product_name,
        product_description,
        product_price,
        company,
        product_image,
        categories: fix_categories,
        featured,
        stock,
        reviews,
        stars,
        discount,
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
  getAllProductsForManager: async (req, res) => {
    try {
      /* const { page = 1, limit = 3} = req.query;
      
      //מחזירה לנו את הכמות של המסמכים שיש באותו קולקשיין
      const count = await Model.count();

      console.log(count);

      const pages = Math.ceil(count / limit);

      console.log(pages);

      const models = await Model.find().skip((page - 1 ) * limit).limit(limit).exec(); */

      const models = await Model.find().populate("categories").exec();

      return res.status(200).json({
        success: true,
        message: `success to find all ${objects_name}`,
        /*         limit,
        count,
        pages, */
        [objects_name]: models,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in get all ${objects_name}`,
        error: error.message,
      });
    }
  },
  getByIdForManager: async (req, res) => {
    try {
      const models = await Model.findById(req.params.product_id).exec();

      return res.status(200).json({
        success: true,
        message: `success to find ${controler_name} by id for - manager`,
        product: models,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in find ${controler_name} by id for - manager}`,
        error: error.message,
      });
    }
  },

  deleteProductForManager: async (req, res) => {
    try {
      const id = req.params.product_id;

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

  updateProductForManager: async (req, res) => {
    try {
      const id = req.params.product_id;
      let product = req.body;
      const fix_categories = JSON.parse(req.body.categories);
      product.categories = fix_categories;
      let data;
      const image = await Model.findById(id).product_image;

      if (req.file === undefined) {
        product.product_image = image;
      } else {
        data = await cloudinary.uploader.upload(req.file.path);
        product.product_image = data.secure_url;
      }
      await Model.findByIdAndUpdate(id, product);
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

  getById: async (req, res) => {
    try {
      const models = await Model.findById(req.params.id).exec();

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

      await Model.findByIdAndUpdate(id, req.body, {
        runValidators: true,
        context: "query",
      }).exec();

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
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find({});
      return res.status(200).json({
        success: true,
        message: `success to find all`,
        products: products,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in get all`,
        error: error.message,
      });
    }
  },
  getSingleProduct: async (req, res) => {
    try {
      const models = await Model.findById(req.params.id).exec();

      return res.status(200).json({
        success: true,
        message: `success to find ${controler_name} by id for - customer`,
        product: models,
      });
    } catch (error) {
      return res.status(500).json({
        message: `error in find ${controler_name} by id for - customer}`,
        error: error.message,
      });
    }
  },
};
