import { config } from 'dotenv';
import cpp from './cpp';
import java from './java';
import python from './python';

const runAPI = () => {
  config();
  console.log('python:\n');
  python();
  console.log('\njava:\n');
  java();
  console.log('\ncpp:\n');
  cpp();
  // console.log(`Hello world 🚀`);
};

if (!module.parent) {
  runAPI();
}

export default runAPI;
