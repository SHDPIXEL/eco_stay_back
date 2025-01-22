const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // Adjust the path as needed

const Enquiry = sequelize.define(
  'Enquiry',
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
      validate: {
        notEmpty: true,
        len: [2, 50], // Ensures name length is between 2 and 50 characters
      },
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[0-9]{10}$/, // Ensures a 10-digit phone number format
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    checkInDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    checkOutDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isAfterCheckIn(value) {
          if (value <= this.checkInDate) {
            throw new Error('Check-out date must be after check-in date.');
          }
        },
      },
    },
    adults: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Ensures at least one adult
      },
    },
    children: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0, // Ensures non-negative number
      },
    },
    rooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // At least one room must be selected
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt columns
  }
);

(async () => {
    try {
      await Enquiry.sync({ force: false });
      console.log("The table for the Enquiry model was just (re)created!");
    } catch (error) {
      console.error("Error syncing the Enquiry model:", error);
    }
  })();

module.exports = Enquiry;
