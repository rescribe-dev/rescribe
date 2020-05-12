import { ObjectId } from 'mongodb';

export interface ProcessFileInput {
  id: ObjectId,
  path: string;
  fileName: string;
  content: string;
}
