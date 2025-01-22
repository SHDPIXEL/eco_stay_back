const express = require("express");
const router = express.Router();
const {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
} = require("../controllers/enquiryController");

router.post("/enquiry", createEnquiry);
router.get("/enquiry", getAllEnquiries);
router.get("/enquiry/:id", getEnquiryById);
router.put("/enquiry/:id", updateEnquiry);
router.delete("/enquiry/:id", deleteEnquiry);

module.exports = router;