const router = require("express").Router();
const upload = require("../middlewares/upload");

// auth middlewares
const auth_manager = require("../middlewares/auth_manager");
const auth_user = require("../middlewares/auth_user");
const auth_admin = require("../middlewares/auth_admin");
const { addAdminForAdmins } = require("../controllers/admins_controller");

// functions from managers controllers
const {
  loginManager,
  logoutManager,
  authManager,
  addManagerForAdmins,
  getAllManagers,
  deleteManagerByIdForAdmin,
  updateManagerByIdForAdmin,
  updateById,
} = require("../controllers/managers_controller");

// function from users controller
const {
  getAllCustomersForManager,
  getCustomerByIdForManager,
  deleteUserByIdForManager,
  updateUserByIdForManager,
  addUserForManager,
  getAll,
  logout,
} = require("../controllers/users_controller");

const {
  addCustomer,
  loginCustomer,
  authCustomer,
  getAllCustomers,
  getById,
  deleteCustomerByIdForManager,
  updateCustomerById,
} = require("../controllers/customers_controller");

// admins request
router.post("/admins/add-manager", auth_admin, addManagerForAdmins);
router.get("/all-managers-for-admin", getAllManagers);
router.delete(
  "/delete-manager-for-admins/:manager_id",
  deleteManagerByIdForAdmin
);
router.put("/update-manager-for-admin/:manager_id", updateManagerByIdForAdmin);

// managers requests
router.post("/managers/login", loginManager);
router.get("/managers/logout", auth_manager, logoutManager);
router.get("/managers/auth", authManager);
router.post("/add-user-for-managers", addUserForManager);
router.get("/all-users-for-managers", getAll);
router.get("/customers-for-managers", getAllCustomersForManager);
router.get("/customer-by-id-for-manager/:user_id", getCustomerByIdForManager);
router.delete("/delete-user-for-managers/:user_id", deleteUserByIdForManager);
router.put("/update-user-for-managers/:user_id", updateUserByIdForManager);
router.put("/update-customer-for-managers/:customer_id", updateCustomerById);
router.put("/update-account/:user_id", upload.single("avatar"), updateById);
router.delete(
  "/delete-customer-for-manager/:customer_id",
  deleteCustomerByIdForManager
);
router.get("/all-customers", getAllCustomers);
router.get("/customer/:id", getById);

// customer requests__________________

router.post("/login", loginCustomer);
router.post("/signup", addCustomer);
router.get("/auth", authCustomer);
router.get("/logout", auth_user, logout);

module.exports = router;
