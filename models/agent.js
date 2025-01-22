const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const Agent = sequelize.define(
  "Agent",
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
          msg: 'Phone number must be a valid 10-digit number.',
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
