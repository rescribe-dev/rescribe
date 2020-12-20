import { run } from 'probot';
import probotApp from '.';
import { initializeConfig } from './config';

const main = (): void => {
  initializeConfig();

  run(probotApp);
};

if (require.main === module) {
  main();
}
