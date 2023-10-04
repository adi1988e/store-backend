const router = require("express").Router();

// auth
const auth_manager = require("../middlewares/auth_manager");
const upload = require("../middlewares/upload");
const {
  getAllProductsForManager,
  addProductForManager,
  deleteProductForManager,
  getByIdForManager,
  updateProductForManager,
  getAllProducts,
  getSingleProduct,
} = require("../controllers/products_controller");

// managers requests
router.get("/managers/all" /* , auth_manager */, getAllProductsForManager);
router.get(
  "/managers/by_id/:product_id" /* , auth_manager */,
  getByIdForManager
);
router.post(
  "/managers/add",
  upload.single("product_image"),
  /* auth_manager , */ addProductForManager
);
router.put(
  "/managers/update/:product_id",
  upload.single("product_image"),
  /* auth_manager , */ updateProductForManager
);
router.delete(
  "/managers/delete/:product_id",
  /* auth_manager , */ deleteProductForManager
);

// _customer requests________________

router.get("/products", getAllProducts);
router.get("/products/:id", getSingleProduct);

module.exports = router;
