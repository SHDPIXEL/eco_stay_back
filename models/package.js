const { DataTypes } = require("sequelize");
const sequelize = require("../connection"); // Adjust the path as needed

const Package = sequelize.define(
  "Package",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensures each package has a unique name
      validate: {
        notEmpty: true,
      },
    },
    long_description: {
      type: DataTypes.TEXT,
      allowNull: true, // Optional description for the package
    },
    short_description: {
      type: DataTypes.TEXT,
      allowNull: true, // Optional description for the package
    },
    package_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0, // Ensures price is non-negative
      },
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt columns
  }
);


// Syncing the model with the database
(async () => {
  try {
    await Package.sync({ force: false });
    console.log("The table for the Package model was just (re)created!");
  } catch (error) {
    console.error("Error syncing the Package model:", error);
  }
})();

module.exports = Package;
