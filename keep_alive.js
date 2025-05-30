const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WhatsApp Bot is running!\n');
});

server.listen(3000, () => {
  console.log('Keep-alive server running on port 3000');
});

module.exports = server;