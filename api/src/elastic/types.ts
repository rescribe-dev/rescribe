export interface IElasticFile {
  _id: string;
  project: string;
  repository: string;
  path: string;
  content: string;
  name: string;
  created: number;
  updated: number;
}
