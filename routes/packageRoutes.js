const express = require("express");
const router = express.Router();
const {
  getAllPackages,
  getPackageById,
} = require("../controllers/packageController");

router.get("/package", getAllPackages);
router.get("/package/:id", getPackageById);

module.exports = router
