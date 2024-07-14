module.exports = (sequelize, DataTypes) => {
  const Cargo = sequelize.define('Cargo', {
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  return Cargo;
};
