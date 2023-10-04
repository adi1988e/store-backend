const router = require("express").Router();

const {
  add,
  getById,
  updateById,
  deleteItemFromCart,
  toggleCartItemAmount,
  clearCart,
} = require("../controllers/carts_controller");

router.post("/clear-cart/:id", clearCart);
router.put("/delete-item", deleteItemFromCart);
router.put("/toggle-item-amount", toggleCartItemAmount);
router.post("/add-item-to-cart", /* auth_customer , */ add);
router.put("/cart/:id", /* auth_customer , */ updateById);
router.get("/cart/:id", /* auth_customer , */ getById);

module.exports = router;
