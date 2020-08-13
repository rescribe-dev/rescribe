export const perpageOptions: number[] = [5, 10, 15];

export const githubOauthURL = 'https://github.com/login/oauth/authorize';

export const defaultCurrency = 'usd';

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
