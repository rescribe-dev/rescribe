import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { getModelForClass, modelOptions, Prop } from '@typegoose/typegoose';
import { BaseFileObject, DownloadLinks, ViewportSizes } from './baseFile';
import { AccessLevel } from '../users/access';

export enum MediaParentType {
  Repository,
  User,
}

registerEnumType(MediaParentType, {
  name: 'MediaParentType',
  description: 'media parent type',
});

class BaseMedia extends BaseFileObject {
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

  @Field(_type => ViewportSizes, { description: 'viewport sizes for media object', nullable: true })
  viewportSizes?: ViewportSizes;

  @Field(_type => DownloadLinks, { description: 'download file links', nullable: true })
  downloadLinks?: DownloadLinks;

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
