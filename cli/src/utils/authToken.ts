import { configData, cacheData, writeCache } from "./config";

export const setAuthToken = async (token: string): Promise<void> => {
  configData.authToken = token;
  cacheData.authToken = token;
  await writeCache();
};
