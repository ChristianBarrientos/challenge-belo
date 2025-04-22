const http = require('http');
const server = http.createServer((req, res) => {

  console.log('Solicitud recibida en GREEN'); // Log a stdout

  res.end('¡Hola desde la Versión GREEN!');
});
server.listen(3000);
