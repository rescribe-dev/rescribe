import { getBranch } from "../utils/git";
import { logger } from "../utils/logger";
import { beforeAction } from "../utils/cli";

export default async (path?: string): Promise<void> => {
  if (!path) {
    path = '.';
  }
  beforeAction();
  const branchName = await getBranch(path);
  logger.info(`got branch  "${branchName}"`);
  console.log(`branch ${branchName}`);
};
