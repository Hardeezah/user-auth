module.exports = (sequelize, DataTypes) => {
  const UserOrganisation = sequelize.define('UserOrganisation', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orgId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return UserOrganisation;
};
