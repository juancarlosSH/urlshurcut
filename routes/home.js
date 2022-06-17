const express = require("express");
const {
  readUrls,
  createUrl,
  deleteUrl,
  openUpdate,
  updateUrl,
  redirectUrl,
} = require("../controllers/homeController");
const { getProfile, updateProfile } = require("../controllers/profileController");
const validateUrl = require("../middleware/validateUrl");
const verifyUsers = require("../middleware/verifyUsers");
const router = express.Router(); // create a router

router.get("/", verifyUsers, readUrls);
router.post("/", verifyUsers, validateUrl, createUrl);
router.get("/deleteUrl/:id", verifyUsers, deleteUrl);
router.get("/updateUrl/:id", verifyUsers, openUpdate);
router.post("/updateUrl/:id", verifyUsers, validateUrl, updateUrl);

router.get("/profile", verifyUsers, getProfile);
router.post("/profile", verifyUsers, updateProfile);

router.get("/:url", redirectUrl);

module.exports = router; // export the router
