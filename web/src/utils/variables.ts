export const perpageOptions: number[] = [5, 10, 15];

export const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
export const passwordMinLen = 6;
export const nameMinLen = 3;
export const validProjectName = /^[A-z0-9-_]+$/;
export const validRepositoryName = /^[A-z0-9-_]+$/;
export const blacklistedRepositoryNames = ['projects'];
export const queryMinLength = 3;

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
