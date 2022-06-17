const express = require("express");
const { body } = require("express-validator");
const {
  getLogin,
  getSingUp,
  singUp,
  confirmAccount,
  login,
  logout,
} = require("../controllers/authController");

const router = express.Router();

router.get("/signUp", getSingUp);
router.post(
  "/signUp",
  [
    body("username", "Username is required").trim().not().isEmpty().escape(),
    body("email", "Email is required").trim().isEmail().normalizeEmail().escape(),
    body("password", "Password is required")
      .trim()
      .isLength({ min: 6 })
      .escape()
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        return value;
      }),
  ],
  singUp
);
router.get("/confirmAccount/:token", confirmAccount);
router.get("/login", getLogin);
router.post(
  "/login",
  [
    body("email", "Email is required").trim().isEmail().normalizeEmail().escape(),
    body("password", "Password is required").trim().isLength({ min: 6 }).escape(),
  ],
  login
);
router.get("/logout", logout);

module.exports = router;
