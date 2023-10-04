const router = require("express").Router();
const auth_manager = require("../middlewares/auth_manager");

const {
  getAllCategoriesForManagers,
  getCategoryByIdForManagers,
  addNewCategoryForManagers,
  deleteCategoryByIdForManagers,
  updateCategoryByIdForManagers,
} = require("../controllers/categories_controller");

router.get("/managers/all", getAllCategoriesForManagers);
router.get("/managers/get-by-id/:id", getCategoryByIdForManagers);
router.post("/managers/add-category", addNewCategoryForManagers);
router.delete("/managers/delete-category/:id", deleteCategoryByIdForManagers);
router.put("/managers/update-category/:id", updateCategoryByIdForManagers);

// __________________

module.exports = router;
