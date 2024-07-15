const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/auth");

const router = express.Router();

router.put(
  "/signup",
  [
    body("username").trim().escape().not().isEmpty(),
    body("email").trim().escape().not().isEmpty().isEmail(),
    body("password").trim().escape().not().isEmpty(),
    body("confirmPassword")
      .trim()
      .escape()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error();
        }
        return true;
      }),
  ],
  authController.signup
);

router.post(
  "/login",
  [body("password").trim().escape(), body("email").trim().escape()],
  authController.login
);

module.exports = router;
