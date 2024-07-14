module.exports = (sequelize, DataTypes) => {
  const Delivery = sequelize.define('Delivery', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    isValuable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isInsurance: {
      type: DataTypes.BOOLEAN
    },
    isDangerous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    truckId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Trucks',
        key: 'id'
      }
    },
    cargoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cargos',
        key: 'id'
      }
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Drivers',
        key: 'id'
      }
    }
  });

  Delivery.associate = models => {
    Delivery.belongsTo(models.Truck, { foreignKey: 'truckId' });
    Delivery.belongsTo(models.Cargo, { foreignKey: 'cargoId' });
    Delivery.belongsTo(models.Driver, { foreignKey: 'driverId' });
  };

  return Delivery;
};
