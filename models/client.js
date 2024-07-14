module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
      nome: {
        type: DataTypes.STRING,
        allowNull: false
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      senha: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });
  
    return Client;
  };
  