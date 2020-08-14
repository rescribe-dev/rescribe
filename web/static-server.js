const finalhandler = require('finalhandler');
const createServer = require('http').createServer;
const serveIndex = require('serve-index');
const serveStatic = require('serve-static');
require('dotenv').config();

let directory = 'dist';

if (process.argv.length > 2) {
  directory = process.argv[2];
}

let PORT = 8001;

if (process.env.PORT) {
  const givenPort = new Number(process.env.PORT);
  if (givenPort) {
    PORT = givenPort.valueOf();
  }
}

if (process.argv.length > 3) {
  const givenPort = new Number(process.argv[3]);
  if (givenPort) {
    PORT = givenPort.valueOf();
  }
}

const index = serveIndex(directory, {
  icons: true,
});

const serve = serveStatic(directory, {
  extensions: ['html'],
});

const server = createServer((req, res) => {
  const done = finalhandler(req, res);
  serve(req, res, (err) => {
    if (err) return done(err);
    index(req, res, done);
  });
});

server.listen(PORT, () => {
  console.log(`app is listening on http://localhost:${PORT} 🚀`);
});
