const formidable = require("formidable");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");

module.exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.render("profile", { user: req.user, image: user.image });
  } catch (error) {
    req.flash("message", [{ msg: "User not exist... ❌" }]);
    res.redirect("/profile");
  }
};

module.exports.updateProfile = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.maxFieldsSize = 1024 * 1024 * 5; // 5MB
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        throw new Error("Error parsing form... ❌");
      }

      const image = files.myFile;
      if (!image.originalFilename) {
        throw new Error("No image provided... ❌");
      }

      if (image.mimetype !== "image/png" && image.mimetype !== "image/jpeg") {
        throw new Error("Invalid image type... ❌");
      }

      if (image.size > 1024 * 1024 * 5) {
        throw new Error("Image too large... ❌");
      }

      const extension = image.mimetype === "image/png" ? "png" : "jpeg";
      const dirFile = path.join(
        __dirname,
        `../public/img/profile/${req.user.id}.${extension}`
      );
      fs.renameSync(image.filepath, dirFile);

      const finalImage = await Jimp.read(dirFile);
      finalImage.resize(200, 200).quality(80).writeAsync(dirFile);

      const user = await User.findById(req.user.id);
      user.image = `${req.user.id}.${extension}`;
      await user.save();
      req.flash("message", [{ msg: "Profile updated successfully! ✅" }]);
    } catch (error) {
      req.flash("message", [{ msg: error.message }]);
    } finally {
      res.redirect("/profile");
    }
  });
};
