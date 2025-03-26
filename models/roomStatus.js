const { DataTypes } = require("sequelize");
const sequelize = require("../connection"); // Adjust the path as needed
const Rooms = require("./rooms");

const RoomStatus = sequelize.define(
  "RoomStatus",
  {
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
        model: Rooms,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
  },
  {
    timestamps: true,
  }
);

Rooms.hasMany(RoomStatus, { foreignKey: "room_id", onDelete: "CASCADE" });
RoomStatus.belongsTo(Rooms, { foreignKey: "room_id" });

(async () => {
  try {
    await RoomStatus.sync({ force: false });
    console.log("The table for the RoomStatus model was just (re)created!");
  } catch (error) {
    console.error("Error syncing the Rooms model:", error);
  }
})();

module.exports = RoomStatus ;
