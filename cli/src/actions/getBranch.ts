import { getBranch } from "../utils/git";
import { logger } from "../utils/logger";

export default async (path?: string): Promise<void> => {
  if (!path) {
    path = '.';
  }
  const branchName = await getBranch(path);
  logger.info(`got branch  "${branchName}"`);
  console.log(`branch ${branchName}`);
};
