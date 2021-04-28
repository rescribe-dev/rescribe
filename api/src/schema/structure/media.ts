import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { getModelForClass, modelOptions, Prop } from '@typegoose/typegoose';
import { BaseFileObject } from './baseFile';
import { AccessLevel } from '../users/access';

export enum MediaParentType {
  repository = 'repository',
  user = 'user'
}

registerEnumType(MediaParentType, {
  name: 'MediaParentType',
  description: 'media parent type',
});

export class BaseMedia extends BaseFileObject {
  @Prop({ required: true })
  parentType: MediaParentType;

  @Prop({ required: true })
  parent: ObjectId;
}

@modelOptions({ schemaOptions: { collection: 'media' } })
class MediaDB extends BaseMedia {
  @Prop()
  readonly _id: ObjectId;
}

export const MediaModel = getModelForClass(MediaDB);

@ObjectType({ description: 'media object' })
export default class Media implements BaseMedia {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'mime type of file' })
  mime: string;

  @Field({ description: 'file size' })
  fileSize: number;

  @Field({ description: 'file name' })
  name: string;

  @Field(_type => AccessLevel, { description: 'public access level' })
  public: AccessLevel;

  @Field(_type => MediaParentType, { description: 'parent type' })
  parentType: MediaParentType;

  @Field({ description: 'parent id' })
  parent: ObjectId;

  @Field({ description: 'date created' })
  created: number;

  @Field({ description: 'date updated' })
  updated: number;
}
