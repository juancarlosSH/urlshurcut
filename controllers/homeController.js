const Url = require("../models/url");
const { nanoid } = require("nanoid");

const readUrls = async (req, res) => {
  const { id } = req.user;
  try {
    const urls = await Url.find({ user: id }).lean(); // find all the urls in the database
    res.render("home", { urls }); // render the home page with the urls
  } catch (error) {
    req.flash("message", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

const createUrl = async (req, res) => {
  const { originalUrl } = req.body;
  const { id } = req.user;
  try {
    const url = new Url({ originalUrl, shortURL: nanoid(7), user: id });
    await url.save(); // save the url to the database
    req.flash("message", [{ msg: "URL created ❤" }]);
    res.redirect("/");
  } catch (error) {
    req.flash("message", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

const deleteUrl = async (req, res) => {
  const { id } = req.params;
  try {
    const url = await Url.findById(id); // find the url by id
    if (!url.user.equals(req.user.id)) {
      throw new Error("You can't delete this url... ❌");
    }

    await url.remove(); // delete the url from the database
    req.flash("message", [{ msg: "URL deleted ❌" }]);
    res.redirect("/");
  } catch (error) {
    req.flash("message", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

const openUpdate = async (req, res) => {
  const { id } = req.params;
  try {
    const url = await Url.findById(id).lean();
    if (!url.user.equals(req.user.id)) {
      throw new Error("You can't update this url... ❌");
    }

    res.render("home", { url });
  } catch (error) {
    req.flash("message", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

const updateUrl = async (req, res) => {
  const { id } = req.params;
  const { originalUrl } = req.body;
  try {
    const url = await Url.findById(id);
    if (!url.user.equals(req.user.id)) {
      throw new Error("You can't update this url... ❌");
    }

    await url.updateOne({ originalUrl });
    req.flash("message", [{ msg: "URL updated ✔" }]);
    res.redirect("/");
  } catch (error) {
    req.flash("message", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

const redirectUrl = async (req, res) => {
  const { url } = req.params;
  try {
    const urlData = await Url.findOne({ shortURL: url }).lean(); // find the shortURL
    res.redirect(urlData.originalUrl);
  } catch (error) {
    req.flash("message", [{ msg: "URL not found... ❌" }]);
    return res.redirect("/auth/login");
  }
};

module.exports = {
  readUrls,
  createUrl,
  deleteUrl,
  openUpdate,
  updateUrl,
  redirectUrl,
};
