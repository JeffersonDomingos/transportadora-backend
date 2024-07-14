module.exports = (sequelize, DataTypes) => {
  const Truck = sequelize.define('Truck', {
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    plateNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    maxDeliveriesPerMonth: {
      type: DataTypes.INTEGER,
      defaultValue: 4
    },
    deliveriesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });


  Truck.associate = models => {
    Truck.hasOne(models.Delivery);
    Truck.belongsToMany(models.Driver, { through: 'TruckDriver' });
  };

  return Truck;
};
