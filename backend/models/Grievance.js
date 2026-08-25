const { createModel } = require('./jsonDb');

const Grievance = createModel('grievances');

module.exports = Grievance;