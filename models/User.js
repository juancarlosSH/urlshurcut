const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    lowercase: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    index: { unique: true },
  },
  password: {
    type: String,
    required: true,
  },
  confirmationToken: {
    type: String,
    default: null,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: null,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
      next();
    } catch (error) {
      console.log(error);
      throw new Error("Error hashing password... ❌");
    }
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  const user = this;
  try {
    return await bcrypt.compare(password, user.password);
  } catch (error) {
    console.log(error);
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
