const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // Adjust the path as needed
const BookingDetails = require('./booking-details'); // Assuming a BookingDetails model exists

const PaymentDetails = sequelize.define(
  'PaymentDetails',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: BookingDetails, // Foreign key reference to BookingDetails
        key: 'id',
      },
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, for methods that generate transaction IDs
      unique: true, // Ensures transaction ID uniqueness
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0, // Ensures non-negative payment amount
      },
    },
    status: {
      type: DataTypes.ENUM('success', 'failed', 'pending'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    remarks: {
      type: DataTypes.TEXT, // Optional remarks or additional notes
      allowNull: true,
    },
  },
  {
    tableName: 'payment_details',
    timestamps: true, // Adds createdAt and updatedAt columns
  }
);

// Define relationships
BookingDetails.hasOne(PaymentDetails, { foreignKey: 'bookingId' });
PaymentDetails.belongsTo(BookingDetails, { foreignKey: 'bookingId' });

(async () => {
    try {
      await PaymentDetails.sync({ force: false});
      console.log("The table for the PaymentDetails model was just (re)created!");
    } catch (error) {
      console.error("Error syncing the PaymentDetails model:", error);
    }
  })();

module.exports = PaymentDetails;
