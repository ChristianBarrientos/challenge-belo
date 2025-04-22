const http = require('http');
const server = http.createServer((req, res) => {
  console.log('Solicitud recibida en BLUE'); // Log a stdout
  res.end('¡Hola desde la Versión BLUE!');
});
server.listen(3000);
