export const perpageOptions: number[] = [5, 10, 15];

export const capitalLetterRegex = /[A-Z]/;
export const lowercaseLetterRegex = /[a-z]/;
export const numberRegex = /[0-9]/;
export const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
export const passwordMinLen = 6;
export const validProjectName = /^[A-z0-9-_]+$/;
export const validRepositoryName = /^[A-z0-9-_]+$/;
export const blacklistedRepositoryNames = ['projects'];
export const minJWTLen = 30;
export const queryMinLength = 3;

export const githubOauthURL = 'https://github.com/login/oauth/authorize';

interface PerpageFiletersTypes {
  projects: number;
  repositories: number;
}

export const perpageFilters: PerpageFiletersTypes = {
  projects: 10,
  repositories: 10,
};

interface SearchParamKeysType {
  query: string;
  language: string;
}

export const searchParamKeys: SearchParamKeysType = {
  query: 'q',
  language: 'l',
};
