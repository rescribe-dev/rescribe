import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { getModelForClass, modelOptions, Prop } from '@typegoose/typegoose';
import { BaseFileObject } from './baseFile';
import { AccessLevel } from '../users/access';

@ObjectType({ description: 'user media objects' })
class MediaDB extends BaseFileObject {
  @Prop()
  readonly _id: ObjectId;
}

export const MediaModel = getModelForClass(MediaDB);

@ObjectType({ description: 'user account' })
@modelOptions({ schemaOptions: { collection: 'users' } })
export default class Media implements MediaDB {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'download file link' })
  downloadLink?: string;

  @Field({ description: 'mime type of file' })
  mime: string;

  @Field({ description: 'file size' })
  fileSize: number;

  @Field({ description: 'file name' })
  name: string;

  @Field(_type => AccessLevel, { description: 'public access level' })
  public: AccessLevel;

  @Field({ description: 'date created' })
  created: number;

  @Field({ description: 'date updated' })
  updated: number;
}
