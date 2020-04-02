import { config } from 'dotenv';

const runAPI = () => {
  config();
  console.log(`Hello world 🚀`)
};

if (!module.parent) {
  runAPI();
}

export default runAPI;
