const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(
  config.DB.name,
  config.DB.user,
  config.DB.password,
  {
    host: config.DB.host,
    port: config.DB.port,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 3600000, // 3600s / 1 hour recycle equivalent to pool_recycle=3600
    },
    define: {
      timestamps: false,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    dialectOptions: {
      charset: 'utf8mb4',
      connectTimeout: 20000,
    },
  }
);

module.exports = sequelize;
