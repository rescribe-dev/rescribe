import axios from 'axios';
import fs from 'fs';
import path from 'path';
import ObjectId from 'bson-objectid';

axios.defaults.baseURL = "http://localhost:8081";

if (process.argv.length < 3)
  throw new Error('no arguments provided');

const filePath = process.argv[2];

const absolutePath = path.resolve(filePath);

if (!fs.existsSync(absolutePath))
  throw new Error(`cannot find file at path ${absolutePath}`);

console.log(absolutePath);

const input = fs.readFileSync(absolutePath);

const fileName = path.basename(filePath);

axios.post('/processFile', {
  id: new ObjectId().toHexString(),
  path: filePath,
  fileName,
  content: input.toString()
}).then(() => {
  console.log("posted");
}).catch((err: any) => {
  if (err.response) {
    console.log(err.response.data);
  } else {
    console.log(err);
  }
});
