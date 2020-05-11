import { Model, Document } from 'mongoose';
import { getClassForDocument } from '@typegoose/typegoose';
import { MiddlewareFn } from 'type-graphql';

const convertDocument = (doc: Document): any => {
  const convertedDocument = doc.toObject();
  const documentClass = getClassForDocument(doc);
  if (!documentClass) {
    throw new Error('no document class found');
  }
  Object.setPrototypeOf(convertedDocument, documentClass.prototype);
  return convertedDocument;
};

export const TypegooseMiddleware: MiddlewareFn = async (_, next): Promise<any> => {
  const result = await next();
  if (Array.isArray(result)) {
    return result.map(item => (item instanceof Model ? convertDocument(item) : item));
  }
  if (result instanceof Model) {
    return convertDocument(result);
  }
  return result;
};
