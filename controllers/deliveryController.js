const { Delivery, Truck, Cargo, Driver } = require('../models');
const { Op } = require('sequelize');
const isDestinationInNordeste = require('./utils/validateDestination');

exports.createDelivery = async (req, res) => {
  try {
    const { startTime, endTime, destination, value, truckId, cargoId, driverId } = req.body;

    if (!truckId || !cargoId || !driverId) {
      return res.status(400).json({ error: 'TruckId, CargoId, and DriverId are required' });
    }

    if (isDestinationInNordeste(destination)) {
      const existingDelivery = await Delivery.findOne({
        where: { driverId, destination: { [Op.like]: '%Nordeste%' } }
      });
      if (existingDelivery) {
        return res.status(400).json({ error: 'O motorista já possui uma entrega para o Nordeste.' });
      }
    }

    const cargo = await Cargo.findByPk(cargoId);
    if (!cargo) {
      return res.status(400).json({ error: 'Cargo not found' });
    }

    let isInsuranceValue = false;
    if (cargo.type.toLowerCase() === 'eletrônicos') {
      isInsuranceValue = true;
    }

    let isDangerousValue = false;
    if (cargo.type.toLowerCase() === 'combustível') {
      isDangerousValue = true;
    }

    const isValuable = value >= 30000;

    const startOfMonth = new Date(startTime);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(startOfMonth.getMonth() + 1);

    const truckDeliveries = await Delivery.count({
      where: {
        truckId,
        startTime: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    if (truckDeliveries >= 4) {
      return res.status(400).json({ error: 'O caminhão já atingiu o limite de 4 entregas no mês' });
    }

    const driverDeliveries = await Delivery.count({
      where: {
        driverId,
        startTime: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    if (driverDeliveries >= 2) {
      return res.status(400).json({ error: 'O motorista já atingiu o limite de 2 entregas no mês' });
    }

    const newDelivery = await Delivery.create({
      startTime,
      endTime,
      destination,
      value,
      isValuable,
      isInsurance: isInsuranceValue,
      isDangerous: isDangerousValue,
      truckId,
      cargoId,
      driverId
    });

    const truck = await Truck.findByPk(truckId);
    if (truck) {
      truck.deliveriesCount += 1;
      await truck.save();
    }

    const driver = await Driver.findByPk(driverId);
    if (driver) {
      driver.deliveriesCount += 1;
      await driver.save();
    }

    res.status(201).json(newDelivery);
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, destination, value, truckId, cargoId, driverId } = req.body;

    const delivery = await Delivery.findByPk(id);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const cargo = await Cargo.findByPk(cargoId);
    if (!cargo) {
      return res.status(400).json({ error: 'Cargo not found' });
    }

    if (isDestinationInNordeste(destination)) {
      const existingDelivery = await Delivery.findOne({
        where: { driverId, destination: { [Op.like]: '%Nordeste%' } }
      });
      if (existingDelivery && existingDelivery.id !== id) {
        return res.status(400).json({ error: 'O motorista já possui uma entrega para o Nordeste.' });
      }
    }

    let isInsuranceValue = false;
    if (cargo.type.toLowerCase() === 'eletrônicos') {
      isInsuranceValue = true;
    }

    let isDangerousValue = false;
    if (cargo.type.toLowerCase() === 'combustível') {
      isDangerousValue = true;
    }

    const isValuable = value >= 30000;

    await delivery.update({
      startTime,
      endTime,
      destination,
      value,
      isValuable,
      isInsurance: isInsuranceValue,
      isDangerous: isDangerousValue,
      truckId,
      cargoId,
      driverId
    });

    res.status(200).json(delivery);
  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(400).json({ error: error.message });
  }
};
