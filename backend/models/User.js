const { createModel } = require('./jsonDb');

const User = createModel('users');

module.exports = User;