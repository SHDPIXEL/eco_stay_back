const Package = require("../models/package");

const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.findAll();
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPackageById = async (req, res) => {
    try {
      const packageId = req.params.id;
      const packageDetails = await Package.findByPk(packageId);
  
      if (packageDetails) {
        res.status(200).json(packageDetails);
      } else {
        res.status(404).json({ message: "Package not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

module.exports = {
  getAllPackages,
  getPackageById,
};
