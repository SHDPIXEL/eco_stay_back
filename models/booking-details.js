const { DataTypes } = require("sequelize");
const sequelize = require("../connection"); // Adjust the path as needed
const Agent = require("./agent"); // Assuming the Agent model is in models/agent.js
const User = require('./user');

const generateUniqueId = () => {
  const getRandomSegment = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;  
  };

  return `${getRandomSegment()}-${getRandomSegment()}-${getRandomSegment()}`;
};

const BookingDetails = sequelize.define(
  "BookingDetails",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    booking_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      defaultValue: () => generateUniqueId(),
      validate: {
        isValidUId(value) {
          console.log("Validating u_id:", value); // Debugging
          const regex =
            /^[a-z0-9A-Z]{4}-[a-z0-9A-Z]{4}-[a-z0-9A-Z]{4}$/;
          if (!regex.test(value)) {
            throw new Error(
              'u_id must be a 12-character string with alphanumeric characters and symbols (e.g., "ABCD1234!@#").'
            );
          }
        },
      },
    },
    user_Id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User, // Foreign key reference
        key: "id",
      },
    },
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Agent, // Foreign key reference
        key: "id",
      },
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^[0-9]{10}$/, // Example: Ensures the phone number is exactly 10 digits long
          msg: 'Phone number must be a valid 10-digit number.',
        },
      },
    },
    checkInDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    checkOutDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    roomType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    number_of_cottages: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    selected_packages: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    selected_occupancy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("confirmed", "canceled", "pending"),
      allowNull: false,
      defaultValue: "pending",
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0,
      },
    },
    paymentStatus: {
      type: DataTypes.ENUM("paid", "pending"),
      allowNull: false,
      defaultValue: "pending",
    },
    // New parameters
    idProof: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "id_proof", // Maps the column name in the database
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    state: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    country: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

Agent.hasMany(BookingDetails, { foreignKey: "agentId" });
BookingDetails.belongsTo(Agent, { foreignKey: "agentId" });

(async () => {
  try {
    await BookingDetails.sync({ force: false });
    console.log("The table for the Booking model was just (re)created!");
  } catch (error) {
    console.error("Error syncing the Booking model:", error);
  }
})();

module.exports = BookingDetails;
