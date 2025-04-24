const {Sequelize} = require('sequelize');

// const sequelize = new Sequelize('vrukksh','root','',{
//     host: 'localhost',
//     dialect: 'mysql'
// });

const sequelize = new Sequelize('eco_stay_db','eco_db_user','Eco_Starng!PS009',{
    host: 'localhost',
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
