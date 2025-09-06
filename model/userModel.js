const bcrypt = require('bcryptjs');

// In-memory user database
const users = [
  {
    username: 'Rogerio', 
    password: bcrypt.hashSync('123456', 8), 
    favorecidos: [ 'Lais' ], 
    saldo: 100
  },
  {
    username: 'Lais', 
    password: bcrypt.hashSync('123456', 8), 
    favorecidos: [ 'Rogerio' ], 
    saldo: 100
  }
];

module.exports = {
  users
};
