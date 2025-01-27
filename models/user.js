const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // Adjust the path as needed
const BookingDetails = require('./booking-details'); // Assuming the BookingDetails model exists

const generateUniqueId = () => {
    const getRandomSegment = () =>
        Math.floor(Math.random() * Math.pow(36, 4))
            .toString(36)
            .padStart(4, '0')
            .toLowerCase();
    return `${getRandomSegment()}-${getRandomSegment()}-${getRandomSegment()}`;
};

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    u_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        defaultValue: () => generateUniqueId(), // Call the function using an anonymous function
        validate: {
            isValidUId(value) {
                console.log('Validating u_id:', value); // Debugging
                const regex = /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/; // Adjust as per the format
                if (!regex.test(value)) {
                    throw new Error('u_id must be a 12-character alphanumeric string (e.g., "ABCD1234EFGH").');
                }
            },
        },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // Ensures the email is unique
      validate: {
        isEmail: true, // Validates that the email is in the correct format
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // You can add a custom validation to ensure it's a valid phone number format if necessary.
        is: {
          args: /^[0-9]{10}$/, // Example: Ensures the phone number is exactly 10 digits long
          msg: 'Phone number must be a valid 10-digit number.',
        },
      },
    },
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
    otp_verified_at: { 
      type: DataTypes.DATE,
      allowNull: true, 
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Inactive',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt columns
  }
);  

// Define association with BookingDetails (User can have many bookings)
User.associate = () => {
User.hasMany(BookingDetails, { foreignKey: 'userId' });
BookingDetails.belongsTo(User, { foreignKey: 'userId' });
};

// Sync the model with the database
(async () => {
  try {
    await User.sync({ force: false});
    console.log('The table for the User model was just (re)created!');
  } catch (error) {
    console.error('Error syncing the User model:', error);
  }
})();

module.exports = User;
