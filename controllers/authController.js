const User = require("../models/User");
const { validationResult } = require("express-validator");
const { nanoid } = require("nanoid");
const nodemailer = require("nodemailer");
require("dotenv").config();

const getSingUp = (req, res) => {
  res.render("signUp");
};

const singUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("message", errors.array());
    return res.redirect("/auth/signUp");
  }

  const { username, email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      throw new Error("User already exists... ❌");
    }

    const newUser = new User({
      username,
      email,
      password,
      confirmationToken: nanoid(),
    });

    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transport.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>',
      to: newUser.email,
      subject: "Verify your account ✔",
      html: `<a href="${process.env.URL}auth/confirmAccount/${newUser.confirmationToken}">Verify your account here</a>`,
    });

    await newUser.save();
    req.flash("message", [{ msg: "Check your email and activate your account" }]);
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("message", [{ msg: error.message }]);
    return res.redirect("/auth/signUp");
  }
};

const confirmAccount = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ confirmationToken: token });
    if (!user) {
      throw new Error("User not found... ❌");
    }

    user.confirmed = true;
    user.confirmationToken = null;
    await user.save();
    req.flash("message", [{ msg: "Your account has been verified" }]);
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("message", [{ msg: error.message }]);
    return res.redirect("/auth/login");
  }
};

const getLogin = (req, res) => {
  res.render("login");
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("message", errors.array());
    return res.redirect("/auth/login");
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found... ❌");
    }

    if (!user.confirmed) {
      throw new Error("User not confirmed... ❌");
    }

    if (!(await user.comparePassword(password))) {
      throw new Error("Wrong password... ❌");
    }

    req.login(user, (err) => {
      if (err) {
        throw new Error(err);
      }
      return res.redirect("/");
    });
  } catch (error) {
    req.flash("message", [{ msg: error.message }]);
    return res.redirect("/auth/login");
  }
};

const logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      throw new Error(err);
    }
    return res.redirect("/auth/login");
  });
};

module.exports = {
  getLogin,
  getSingUp,
  singUp,
  confirmAccount,
  login,
  logout,
};
