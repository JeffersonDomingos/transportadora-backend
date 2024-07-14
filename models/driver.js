module.exports = (sequelize, DataTypes) => {
    const Driver = sequelize.define('Driver', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      deliveriesPerMonth: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      deliveriesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    });
    

    Driver.associate = models => {
        Driver.belongsToMany(models.Truck, { through: 'TruckDriver' });
        Driver.belongsToMany(models.Delivery, { through: 'DriverDelivery' }); 
      };
    
    return Driver;
  };
  