var connect = require('connect');
var serveStatic = require('serve-static');
console.log('Server running on port 5000');
connect().use(serveStatic(__dirname)).listen(5000);