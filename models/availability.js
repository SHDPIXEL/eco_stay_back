const { DataTypes } = require("sequelize");
const sequelize = require("../connection");
const Rooms = require('./rooms')

const Availability = sequelize.define("Availability", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Rooms, // Foreign key reference
      key: "id",
    },
  },
  date:{
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  count:{
    type: DataTypes.INTEGER,
    allowNull:false
  }
},
{timestamps:true}
);

(async () => {
    try {
      await Availability.sync({ force: false });
      console.log("The table for the Availability model was just (re)created!");
    } catch (error) {
      console.error("Error syncing the Availability model:", error);
    }
  })();

Rooms.hasMany(Availability, { foreignKey: 'room_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Availability.belongsTo(Rooms, { foreignKey: 'room_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

(async () => {
    try {
      await Availability.sync({ force: false });
      console.log("The table for the Availability model was just (re)created!");
    } catch (error) {
      console.error("Error syncing the Availability model:", error);
    }
  })();

module.exports = Availability;
