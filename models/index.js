const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  dialectModule: require('pg'),
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Truck = require('./truck')(sequelize, Sequelize);
db.Delivery = require('./delivery')(sequelize, Sequelize);
db.Cargo = require('./cargo')(sequelize, Sequelize);
db.Driver = require('./driver')(sequelize, Sequelize);
db.Client = require('./client')(sequelize, Sequelize);


module.exports = db;
