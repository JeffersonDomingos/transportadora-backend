const { Delivery, Truck, Cargo, Driver } = require('./models');
const { Op } = require('sequelize');
const { isDestinationInNordeste, getNordesteState, regioesNordeste } = require('./utils/validateDestination');

require('dotenv').config();
const express = require('express');
const db = require('./models');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/trucks', async (req, res) => {
  try {
    const { model, plateNumber, maxDeliveriesPerMonth } = req.body;
    const newTruck = await db.Truck.create({
      model,
      plateNumber,
      maxDeliveriesPerMonth,
      deliveriesCount: 0
    });
    res.status(201).json(newTruck);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/trucks', async (req, res) => {
  try {
    const trucks = await db.Truck.findAll({
      attributes: ['id', 'model', 'plateNumber', 'maxDeliveriesPerMonth', 'deliveriesCount']
    });
    res.status(200).json(trucks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/trucks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { model, plateNumber, maxDeliveriesPerMonth } = req.body;

    const truck = await db.Truck.findByPk(id);
    if (!truck) {
      return res.status(404).json({ error: 'Caminhão não encontrado' });
    }

    truck.model = model || truck.model;
    truck.plateNumber = plateNumber || truck.plateNumber;
    truck.maxDeliveriesPerMonth = maxDeliveriesPerMonth || truck.maxDeliveriesPerMonth;

    await truck.save();
    res.status(200).json(truck);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/trucks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const truck = await db.Truck.findByPk(id);
    if (!truck) {
      return res.status(404).json({ error: 'Caminhão não encontrado' });
    }

    await truck.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/deliveries', async (req, res) => {
  try {
    const { startTime, endTime, destination, value, isValuable, isInsurance, isDangerous, truckId, cargoId, driverId } = req.body;

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

    if (isDestinationInNordeste(destination)) {
      const existingDelivery = await Delivery.findOne({
        where: {
          driverId,
          destination: {
            [Op.in]: regioesNordeste
          }
        }
      });
      if (existingDelivery) {
        return res.status(400).json({ error: 'O motorista já possui uma entrega para um estado do Nordeste.' });
      }
    }

    if (!truckId) {
      return res.status(400).json({ error: 'TruckId is required' });
    }

    const existingDelivery = await db.Delivery.findOne({ where: { truckId } });
    if (existingDelivery) {
      return res.status(400).json({ error: 'O caminhão já está associado a uma entrega.' });
    }

    const newDelivery = await db.Delivery.create({
      startTime,
      endTime,
      destination,
      value,
      isValuable,
      isInsurance,
      isDangerous,
      truckId,
      cargoId,
      driverId,
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
    res.status(400).json({ error: error.message });
  }
});

app.get('/deliveries', async (req, res) => {
  try {
    const deliveries = await db.Delivery.findAll();
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/deliveries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, destination, value, isValuable, isInsurance, isDangerous } = req.body;

    const delivery = await db.Delivery.findByPk(id);
    if (!delivery) {
      return res.status(404).json({ error: 'Entrega não encontrada' });
    }

    delivery.startTime = startTime || delivery.startTime;
    delivery.endTime = endTime || delivery.endTime;
    delivery.destination = destination || delivery.destination;
    delivery.value = value || delivery.value;
    delivery.isValuable = isValuable || delivery.isValuable;
    delivery.isInsurance = isInsurance || delivery.isInsurance;
    delivery.isDangerous = isDangerous || delivery.isDangerous;

    await delivery.save();
    res.status(200).json(delivery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/deliveries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await db.Delivery.findByPk(id);
    if (!delivery) {
      return res.status(404).json({ error: 'Entrega não encontrada' });
    }

    await delivery.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/cargos', async (req, res) => {
  try {
    const { description, type } = req.body;
    const newCargo = await db.Cargo.create({
      description,
      type
    });
    res.status(201).json(newCargo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/cargos', async (req, res) => {
  try {
    const cargos = await db.Cargo.findAll();
    res.status(200).json(cargos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/cargos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, type } = req.body;

    const cargo = await db.Cargo.findByPk(id);
    if (!cargo) {
      return res.status(404).json({ error: 'Tipo de carga não encontrado' });
    }

    cargo.description = description || cargo.description;
    cargo.type = type || cargo.type;

    await cargo.save();
    res.status(200).json(cargo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/cargos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cargo = await db.Cargo.findByPk(id);
    if (!cargo) {
      return res.status(404).json({ error: 'Tipo de carga não encontrado' });
    }

    await cargo.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/drivers', async (req, res) => {
  try {
    const { name, deliveriesPerMonth } = req.body;
    const newDriver = await db.Driver.create({
      name,
      deliveriesPerMonth,
      deliveriesCount: 0
    });
    res.status(201).json(newDriver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/drivers', async (req, res) => {
  try {
    const drivers = await db.Driver.findAll({
      attributes: ['id', 'name', 'deliveriesPerMonth', 'deliveriesCount']
    });
    res.status(200).json(drivers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, deliveriesPerMonth } = req.body;

    const driver = await db.Driver.findByPk(id);
    if (!driver) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }

    driver.name = name || driver.name;
    driver.deliveriesPerMonth = deliveriesPerMonth || driver.deliveriesPerMonth;

    await driver.save();
    res.status(200).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await db.Driver.findByPk(id);
    if (!driver) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }

    await driver.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/deliveries/count', async (req, res) => {
  try {
    const count = await Delivery.count();
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/drivers/count', async (req, res) => {
  try {
    const count = await Driver.count();
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/trucks/count', async (req, res) => {
  try {
    const count = await Truck.count();
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/deliveries/total-value', async (req, res) => {
  try {
    const totalValue = await Delivery.sum('value');
    res.status(200).json({ totalValue });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, async () => {
  try {
    await db.sequelize.sync();
    console.log('Tabelas sincronizadas com sucesso.');
    console.log(`Servidor rodando na porta ${port}`);
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
});
