const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const generateUniqueId = () => {
  const getRandomSegment = () =>
    Math.floor(Math.random() * Math.pow(36, 4))
      .toString(36)
      .padStart(4, "0")
      .toLowerCase();
  return `${getRandomSegment()}-${getRandomSegment()}-${getRandomSegment()}`;
};

const Agent = sequelize.define(
  "Agent",
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
          console.log("Validating u_id:", value); // Debugging
          const regex = /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/; // Adjust as per the format
          if (!regex.test(value)) {
            throw new Error(
              'u_id must be a 12-character alphanumeric string (e.g., "ABCD1234EFGH").'
            );
          }
        },
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // You can add a custom validation to ensure it's a valid phone number format if necessary.
        is: {
          args: /^[0-9]{10}$/, // Example: Ensures the phone number is exactly 10 digits long
          msg: "Phone number must be a valid 10-digit number.",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password cannot be empty",
        },
        len: {
          args: [8, 100],
          msg: "Password must be between 8 and 100 characters.",
        },
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    idProof: {
      type: DataTypes.JSON,
      allowNull: false,
      field: "id_proof", // Maps the column name in the database
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
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
      defaultValue: "Inactive",
    },
    offers: {
      type: DataTypes.STRING, // For storing structured data like lists or objects
      allowNull: true,
    },
  },
  { timestamps: true }
);

Agent.beforeCreate((agent) => {
  agent.name = agent.name.trim();
  agent.email = agent.email.toLowerCase();
});

Agent.beforeUpdate((agent) => {
  if (agent.name) agent.name = agent.name.trim();
  if (agent.email) agent.email = agent.email.toLowerCase();
});

// Sync with error handling
(async () => {
  try {
    await Agent.sync({ force: false });
    console.log("The table for the Agent model was just (re)created!");
  } catch (error) {
    console.error("Error syncing the Agent model:", error);
  }
})();

module.exports = Agent;
