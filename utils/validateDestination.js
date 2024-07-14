const regioesNordeste = [
  'Alagoas',
  'Bahia',
  'Ceará',
  'Maranhão',
  'Paraíba',
  'Pernambuco',
  'Piauí',
  'Rio Grande do Norte',
  'Sergipe'
];

const isDestinationInNordeste = (destination) => {
  return regioesNordeste.some((regiao) => destination.includes(regiao));
};

const getNordesteState = (destination) => {
  return regioesNordeste.find((regiao) => destination.includes(regiao)) || null;
};

module.exports = { isDestinationInNordeste, getNordesteState, regioesNordeste };
