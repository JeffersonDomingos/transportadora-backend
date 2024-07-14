'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Deliveries', 'truckId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Trucks',
        key: 'id'
      },
      allowNull: false
    });

    
    await queryInterface.sequelize.query(`
      UPDATE "Deliveries"
      SET "truckId" = (SELECT "id" FROM "Trucks" LIMIT 1)
      WHERE "truckId" IS NULL;
    `);

   
    await queryInterface.changeColumn('Deliveries', 'truckId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Deliveries', 'truckId');
  }
};
