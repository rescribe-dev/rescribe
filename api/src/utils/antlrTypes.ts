export interface ClassOutput {
  name: string;
  variables: VariableOutput[];
  constructorFunction: FunctionOutput;
  functions: FunctionOutput[];
  location: LocationOutput;
  comments: CommentOutput[];
}

export interface FunctionOutput {
  name: string;
  arguments: VariableOutput[];
  returnType: string;
  variables: VariableOutput[];
  comments: CommentOutput[];
  location: LocationOutput;
}

export interface VariableOutput {
  name: string;
  type: string;
  location: LocationOutput;
  comments: CommentOutput[];
}

export interface LocationOutput {
  start: number;
  end: number;
}

export interface ImportOutput {
  path: string;
  selection: string;
  location: LocationOutput;
}

export enum CommentType {
  multilineComment,
  singleLineComment
}

export interface CommentOutput {
  data: string;
  type: CommentType;
}

export interface FileOutput {
  name: string;
  classes: ClassOutput[];
  functions: FunctionOutput[];
  variables: VariableOutput[];
  imports: ImportOutput[];
  comments: CommentOutput[];
  importPath: string;
  path: string;
}

export interface ProcessFileInput {
  project: string;
  repository: string;
  branch: string;
  path: string;
  fileName: string;
  content: string;
}
