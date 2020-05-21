import axios from 'axios';
import fs from 'fs';

axios.defaults.baseURL = "http://localhost:8081";

const output = fs.readFileSync(__dirname + '/../demoCode/java/SpellCheck.java');

axios.post('/processFile', {
  name: "SpellCheck.java",
  contents: output.toString()
}).then(() => {
  console.log("posted");
}).catch((err: any) => {
  if (err.response) {
    console.log(err.response.data);
  } else {
    console.log(err);
  }
});
