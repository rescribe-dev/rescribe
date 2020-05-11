import { FileOutput } from '../utils/antlrTypes';

export interface ElasticFile extends FileOutput {
  projectID: string;
  repositoryID: string;
  branchID: string;
  created: number;
  updated: number;
}

export interface ElasticProject {
  repositories: string[];
  name: string;
  created: number;
  updated: number;
}
