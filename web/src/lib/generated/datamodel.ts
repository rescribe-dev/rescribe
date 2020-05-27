import gql from 'graphql-tag';
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  ObjectId: any;
  Upload: any;
};

export type Access = {
   __typename?: 'Access';
  _id: Scalars['ObjectId'];
  level: Scalars['String'];
  type: Scalars['String'];
};

export type AntlrFile = {
   __typename?: 'AntlrFile';
  _id: Scalars['ObjectId'];
  name: Scalars['String'];
  importPath: Scalars['String'];
  path: Scalars['String'];
  classes: Array<Class>;
  functions: Array<Function>;
  variables: Array<Variable>;
  imports: Array<Import>;
  comments: Array<Comment>;
  language: Array<Language>;
};

export type AuthNotification = {
   __typename?: 'AuthNotification';
  id: Scalars['String'];
  token: Scalars['String'];
};

export type BaseBranch = {
   __typename?: 'BaseBranch';
  name: Scalars['String'];
  repository: Scalars['ObjectId'];
  project: Scalars['ObjectId'];
  files: Array<Scalars['ObjectId']>;
};

export type BaseProject = {
   __typename?: 'BaseProject';
  name: Scalars['String'];
  repositories: Array<Scalars['ObjectId']>;
  access: Array<Access>;
};

export type BaseRepository = {
   __typename?: 'BaseRepository';
  name: Scalars['String'];
  branches: Array<Scalars['ObjectId']>;
  project: Scalars['ObjectId'];
  access: Array<Access>;
};

export type Branch = {
   __typename?: 'Branch';
  name: Scalars['String'];
  repository: Scalars['ObjectId'];
  project: Scalars['ObjectId'];
  files: Array<Scalars['ObjectId']>;
  _id: Scalars['ObjectId'];
  created: Scalars['Float'];
  updated: Scalars['Float'];
};

export type BranchDb = {
   __typename?: 'BranchDB';
  name: Scalars['String'];
  repository: Scalars['ObjectId'];
  project: Scalars['ObjectId'];
  files: Array<Scalars['ObjectId']>;
  _id: Scalars['ObjectId'];
};

export type Class = {
   __typename?: 'Class';
  _id: Scalars['ObjectId'];
  parent: Parent;
  location: Location;
  name: Scalars['String'];
};

export type Comment = {
   __typename?: 'Comment';
  _id: Scalars['ObjectId'];
  parent: Parent;
  location: Location;
  data: Scalars['String'];
  type: CommentType;
};

export enum CommentType {
  MultilineComment = 'multilineComment',
  SingleLineComment = 'singleLineComment'
}

export type File = {
   __typename?: 'File';
  _id: Scalars['ObjectId'];
  name: Scalars['String'];
  importPath: Scalars['String'];
  path: Scalars['String'];
  classes: Array<Class>;
  functions: Array<Function>;
  variables: Array<Variable>;
  imports: Array<Import>;
  comments: Array<Comment>;
  language: Array<Language>;
  fileLength: Scalars['Int'];
  project: Scalars['String'];
  repository: Scalars['String'];
  branch: Scalars['String'];
  location: Scalars['String'];
  created: Scalars['Float'];
  updated: Scalars['Float'];
};

export type FileLocation = {
   __typename?: 'FileLocation';
  repository: Scalars['String'];
  owner: Scalars['String'];
  image: Scalars['String'];
};

export type FileResult = {
   __typename?: 'FileResult';
  _id: Scalars['ObjectId'];
  name: Scalars['String'];
  path: Scalars['String'];
  results: Array<SearchResult>;
  language: LanguageData;
  location: FileLocation;
  lines: Location;
};

export type Function = {
   __typename?: 'Function';
  _id: Scalars['ObjectId'];
  parent: Parent;
  location: Location;
  name: Scalars['String'];
  returnType: Scalars['String'];
  isConstructor: Scalars['Boolean'];
};

export type Import = {
   __typename?: 'Import';
  _id: Scalars['ObjectId'];
  parent: Parent;
  location: Location;
  path: Scalars['String'];
  selection: Scalars['String'];
};

export enum Language {
  Java = 'java',
  Javascript = 'javascript'
}

export type LanguageData = {
   __typename?: 'LanguageData';
  name: Language;
  color: Scalars['Int'];
};

export type Location = {
   __typename?: 'Location';
  start: Scalars['Float'];
  end: Scalars['Float'];
};

export type Mutation = {
   __typename?: 'Mutation';
  deleteAccount: Scalars['String'];
  login: Scalars['String'];
  loginGuest: Scalars['String'];
  logout: Scalars['String'];
  revokeRefresh: Scalars['String'];
  register: Scalars['String'];
  updateAccount: Scalars['String'];
  addBranch: Scalars['String'];
  deleteFile: Scalars['String'];
  deleteBranch: Scalars['String'];
  indexFiles: Scalars['String'];
  indexGithub: Scalars['String'];
  addProject: Scalars['String'];
  deleteRepository: Scalars['String'];
  deleteProject: Scalars['String'];
  addRepository: Scalars['String'];
};


export type MutationDeleteAccountArgs = {
  email?: Maybe<Scalars['String']>;
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationRevokeRefreshArgs = {
  email?: Maybe<Scalars['String']>;
};


export type MutationRegisterArgs = {
  name: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationUpdateAccountArgs = {
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
};


export type MutationAddBranchArgs = {
  name: Scalars['String'];
  repository: Scalars['ObjectId'];
};


export type MutationDeleteFileArgs = {
  id: Scalars['ObjectId'];
};


export type MutationDeleteBranchArgs = {
  id: Scalars['ObjectId'];
};


export type MutationIndexFilesArgs = {
  paths: Array<Scalars['String']>;
  files: Array<Scalars['Upload']>;
  project: Scalars['ObjectId'];
  repository: Scalars['ObjectId'];
  branch: Scalars['ObjectId'];
  saveContent?: Maybe<Scalars['Boolean']>;
};


export type MutationIndexGithubArgs = {
  githubRepositoryID: Scalars['Int'];
  added: Array<Scalars['String']>;
  modified: Array<Scalars['String']>;
  removed: Array<Scalars['String']>;
  ref: Scalars['String'];
  repositoryName: Scalars['String'];
  repositoryOwner: Scalars['String'];
  installationID: Scalars['Int'];
};


export type MutationAddProjectArgs = {
  name: Scalars['String'];
};


export type MutationDeleteRepositoryArgs = {
  id: Scalars['ObjectId'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ObjectId'];
};


export type MutationAddRepositoryArgs = {
  name: Scalars['String'];
  project: Scalars['ObjectId'];
};

export type NestedObject = {
   __typename?: 'NestedObject';
  _id: Scalars['ObjectId'];
  parent: Parent;
  location: Location;
};


export type Parent = {
   __typename?: 'Parent';
  _id: Scalars['ObjectId'];
  type: ParentType;
};

export type ParentElement = {
   __typename?: 'ParentElement';
  name: Scalars['String'];
  type: Scalars['String'];
};

export enum ParentType {
  File = 'File',
  Class = 'Class',
  Function = 'Function',
  Variable = 'Variable'
}

export type Project = {
   __typename?: 'Project';
  name: Scalars['String'];
  repositories: Array<Scalars['ObjectId']>;
  access: Array<Access>;
  _id: Scalars['ObjectId'];
  created: Scalars['Float'];
  updated: Scalars['Float'];
};

export type ProjectDb = {
   __typename?: 'ProjectDB';
  name: Scalars['String'];
  repositories: Array<Scalars['ObjectId']>;
  access: Array<Access>;
  _id: Scalars['ObjectId'];
};

export type Query = {
   __typename?: 'Query';
  user: User;
  branch: Branch;
  branches: Array<Branch>;
  file: File;
  files: Array<File>;
  fileText: Array<Scalars['String']>;
  search: Array<FileResult>;
  hello: Scalars['String'];
  project: Project;
  projects: Array<Project>;
  repositories: Array<Repository>;
  repository: Repository;
};


export type QueryBranchArgs = {
  id?: Maybe<Scalars['ObjectId']>;
  name?: Maybe<Scalars['String']>;
  repository?: Maybe<Scalars['ObjectId']>;
};


export type QueryBranchesArgs = {
  repository: Scalars['ObjectId'];
  project: Scalars['ObjectId'];
};


export type QueryFileArgs = {
  id: Scalars['ObjectId'];
};


export type QueryFilesArgs = {
  query?: Maybe<Scalars['String']>;
  project?: Maybe<Scalars['ObjectId']>;
  repository?: Maybe<Scalars['ObjectId']>;
  branch?: Maybe<Scalars['ObjectId']>;
};


export type QueryFileTextArgs = {
  id: Scalars['ObjectId'];
  start: Scalars['Int'];
  end: Scalars['Int'];
};


export type QuerySearchArgs = {
  query?: Maybe<Scalars['String']>;
  project?: Maybe<Scalars['ObjectId']>;
  repository?: Maybe<Scalars['ObjectId']>;
  branch?: Maybe<Scalars['ObjectId']>;
};


export type QueryProjectArgs = {
  id?: Maybe<Scalars['ObjectId']>;
  name?: Maybe<Scalars['String']>;
};


export type QueryRepositoriesArgs = {
  project?: Maybe<Scalars['ObjectId']>;
};


export type QueryRepositoryArgs = {
  id?: Maybe<Scalars['ObjectId']>;
  project?: Maybe<Scalars['ObjectId']>;
  name?: Maybe<Scalars['String']>;
};

export type Repository = {
   __typename?: 'Repository';
  name: Scalars['String'];
  branches: Array<Scalars['ObjectId']>;
  project: Scalars['ObjectId'];
  access: Array<Access>;
  _id: Scalars['ObjectId'];
  created: Scalars['Float'];
  updated: Scalars['Float'];
};

export type RepositoryDb = {
   __typename?: 'RepositoryDB';
  name: Scalars['String'];
  branches: Array<Scalars['ObjectId']>;
  project: Scalars['ObjectId'];
  access: Array<Access>;
  _id: Scalars['ObjectId'];
  image: Scalars['String'];
};

export type SearchResult = {
   __typename?: 'SearchResult';
  name: Scalars['String'];
  type: Scalars['String'];
  parents: Array<ParentElement>;
  startPreviewLineNumber: Scalars['Int'];
  startPreviewContent: Array<Scalars['String']>;
  endPreviewLineNumber: Scalars['Int'];
  endPreviewContent: Array<Scalars['String']>;
};

export type Subscription = {
   __typename?: 'Subscription';
  authNotifications: AuthNotification;
};


export type User = {
   __typename?: 'User';
  _id: Scalars['ObjectId'];
  name: Scalars['String'];
  email: Scalars['String'];
  plan: Scalars['String'];
  type: Scalars['String'];
  githubInstallationID: Scalars['Float'];
  githubUsername: Scalars['String'];
  emailVerified: Scalars['Boolean'];
  tokenVersion: Scalars['Float'];
  repositories: Array<Access>;
  projects: Array<Access>;
};

export type Variable = {
   __typename?: 'Variable';
  _id: Scalars['ObjectId'];
  parent: Parent;
  location: Location;
  name: Scalars['String'];
  type: Scalars['String'];
  isArgument: Scalars['Boolean'];
};

export type BranchesQueryVariables = {
  repository: Scalars['ObjectId'];
  project: Scalars['ObjectId'];
};


export type BranchesQuery = (
  { __typename?: 'Query' }
  & { branches: Array<(
    { __typename?: 'Branch' }
    & Pick<Branch, '_id' | 'name'>
  )> }
);

export type FilesQueryVariables = {
  query: Scalars['String'];
  project: Scalars['ObjectId'];
};


export type FilesQuery = (
  { __typename?: 'Query' }
  & { files: Array<(
    { __typename?: 'File' }
    & Pick<File, '_id' | 'name'>
    & { classes: Array<(
      { __typename?: 'Class' }
      & Pick<Class, 'name'>
    )>, functions: Array<(
      { __typename?: 'Function' }
      & Pick<Function, 'name'>
    )>, variables: Array<(
      { __typename?: 'Variable' }
      & Pick<Variable, 'name'>
    )> }
  )> }
);

export type HelloQueryVariables = {};


export type HelloQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'hello'>
);

export type LoginMutationVariables = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'login'>
);

export type LogoutMutationVariables = {};


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
);

export type ProjectsQueryVariables = {};


export type ProjectsQuery = (
  { __typename?: 'Query' }
  & { projects: Array<(
    { __typename?: 'Project' }
    & Pick<Project, '_id' | 'name'>
  )> }
);

export type RegisterMutationVariables = {
  name: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
};


export type RegisterMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'register'>
);

export type RepositoriesQueryVariables = {
  project: Scalars['ObjectId'];
};


export type RepositoriesQuery = (
  { __typename?: 'Query' }
  & { repositories: Array<(
    { __typename?: 'Repository' }
    & Pick<Repository, '_id' | 'name'>
  )> }
);

export type UserQueryVariables = {};


export type UserQuery = (
  { __typename?: 'Query' }
  & { user: (
    { __typename?: 'User' }
    & Pick<User, 'name' | 'email' | 'plan' | '_id' | 'type'>
  ) }
);


export const Branches = gql`
    query branches($repository: ObjectId!, $project: ObjectId!) {
  branches(repository: $repository, project: $project) {
    _id
    name
  }
}
    `;
export const Files = gql`
    query files($query: String!, $project: ObjectId!) {
  files(query: $query, project: $project) {
    _id
    name
    classes {
      name
    }
    functions {
      name
    }
    variables {
      name
    }
  }
}
    `;
export const Hello = gql`
    query hello {
  hello
}
    `;
export const Login = gql`
    mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password)
}
    `;
export const Logout = gql`
    mutation logout {
  logout
}
    `;
export const Projects = gql`
    query projects {
  projects {
    _id
    name
  }
}
    `;
export const Register = gql`
    mutation register($name: String!, $email: String!, $password: String!) {
  register(name: $name, email: $email, password: $password)
}
    `;
export const Repositories = gql`
    query repositories($project: ObjectId!) {
  repositories(project: $project) {
    _id
    name
  }
}
    `;
export const User = gql`
    query user {
  user {
    name
    email
    plan
    _id
    type
  }
}
    `;

      export interface IntrospectionResultData {
        __schema: {
          types: {
            kind: string;
            name: string;
            possibleTypes: {
              name: string;
            }[];
          }[];
        };
      }
      const result: IntrospectionResultData = {
  "__schema": {
    "types": []
  }
};
      export default result;
    