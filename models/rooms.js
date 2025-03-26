const { DataTypes } = require("sequelize");
const sequelize = require("../connection"); // Adjust the path as needed

const Rooms = sequelize.define(
  "Rooms",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    package_ids: {
      type: DataTypes.JSON, // Stores multiple package IDs as an array
      allowNull: true,
      validate: {
        isArrayOfIntegers(value) {
          if (!Array.isArray(value)) {
            throw new Error("package_ids must be an array.");
          }
          for (const id of value) {
            if (!Number.isInteger(id)) {
              throw new Error("Each package_id must be an integer.");
            }
          }
        },
      },
    },
    room_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensures each room has a unique identifier
      validate: {
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Ensures at least one person can stay
      },
    },
    single_base_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0, // Ensures price is non-negative
      },
    },
    double_base_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0, // Ensures price is non-negative
      },
    },
    triple_base_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0, // Ensures price is non-negative
      },
    },
    single_new_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: true,
        min: 0, // Ensures price is non-negative
      },
    },
    double_new_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: true,
        min: 0, // Ensures price is non-negative
      },
    },
    triple_new_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: true,
        min: 0, // Ensures price is non-negative
      },
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
      defaultValue: "Inactive",
    },
    room_images: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isArray(value) {
          if (Array.isArray(value) && value.length > 4) {
            throw new Error("You can only upload a maximum of 4 images.");
          }
        },
      },
    },
    amenities: {
      type: DataTypes.JSON, // Stores additional details like amenities as a JSON object
      allowNull: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt columns
  }
);

// Define associations

// Sync model
(async () => {
  try {
    await Rooms.sync({ force: false });
    console.log("The table for the Rooms model was just (re)created!");
  } catch (error) {
    console.error("Error syncing the Rooms model:", error);
  }
})();

module.exports = Rooms;
