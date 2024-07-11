const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false, // Disable logging; default: console.log
});

const User = require('./User')(sequelize, DataTypes);
const Organisation = require('./Organisation')(sequelize, DataTypes);
const UserOrganisation = require('./UserOrganisation')(sequelize, DataTypes);

User.belongsToMany(Organisation, { through: UserOrganisation });
Organisation.belongsToMany(User, { through: UserOrganisation });

module.exports = { sequelize, User, Organisation, UserOrganisation };