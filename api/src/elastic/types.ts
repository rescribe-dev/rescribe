export interface ElasticProject {
  repositories: string[];
  name: string;
  created: number;
  updated: number;
}

export interface TermQuery {
  term: object
}
