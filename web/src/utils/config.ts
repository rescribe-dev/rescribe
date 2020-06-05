export const perpageOptions: number[] = [5, 10, 15];

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
}

export const searchParamKeys: SearchParamKeysType = {
  query: 'q',
};
