const finalhandler = require('finalhandler');
const createServer = require('http').createServer;
const serveIndex = require('serve-index');
const serveStatic = require('serve-static');
require('dotenv').config();

let PORT = process.env.PORT || 3001;

let directory = 'dist';

if (process.argv.length > 2) {
  directory = process.argv[2];
  if (!process.env.PORT) {
    PORT = 3002;
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
