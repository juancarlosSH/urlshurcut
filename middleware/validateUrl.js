const { URL } = require("url");

const validateUrl = (req, res, next) => {
  const { originalUrl } = req.body;
  try {
    const url = new URL(originalUrl);
    if (url.origin !== "null") {
      return next();
    } else {
      throw new Error("Invalid URL 😢");
    }
  } catch (error) {
    req.flash("message", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

module.exports = validateUrl;
