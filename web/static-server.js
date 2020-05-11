const connect = require('connect');
const serveStatic = require('serve-static');
require('dotenv').config();

const PORT = process.env.PORT || 8000;

connect()
  .use(serveStatic('dist'))
  .listen(PORT, () => {
    console.log(`app is listening on http://localhost:${PORT} 🚀`);
  });
