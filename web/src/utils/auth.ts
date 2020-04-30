export let authToken = "";

export const setToken = (newToken: string): void => {
  authToken = newToken;
};
