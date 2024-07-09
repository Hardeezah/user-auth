module.exports = (sequelize, DataTypes) => {
  const Organisation = sequelize.define('Organisation', {
    orgId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  });

  return Organisation;
};
