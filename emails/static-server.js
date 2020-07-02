import finalhandler from 'finalhandler';
import { createServer } from 'http';
import serveIndex from 'serve-index';
import serveStatic from 'serve-static';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8001;

const directory = 'dist';

const index = serveIndex(directory, {
  'icons': true
});

const serve = serveStatic(directory, {
  extensions: ['html']
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
