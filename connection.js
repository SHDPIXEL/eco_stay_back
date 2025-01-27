const {Sequelize} = require('sequelize');

// const sequelize = new Sequelize('vrukksh','root','',{
//     host: 'localhost',
//     dialect: 'mysql'
// });

const sequelize = new Sequelize('vrukksh','admin_ecostay','dMIlXvL^Y$Znts_eco',{
    host: 'eco-stay-database.ch26co64cgxa.ap-south-1.rds.amazonaws.com',
    dialect: 'mysql'
});


sequelize.authenticate()
try{
    console.log('Database Connected Succesfully');
}catch(error){
    console.log('Unable to connect to the database:', error);
}

sequelize.authenticate().then(()=>console.log("Database Connected"))

module.exports = sequelize; 