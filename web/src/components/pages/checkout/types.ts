import ObjectId from 'bson-objectid';

export type SetFieldValue = (
  field: string,
  value: any,
  shouldValidate?: boolean | undefined
) => void;

export type UpdateMethod = (args?: {
  id?: ObjectId;
  init?: boolean;
}) => Promise<void>;
