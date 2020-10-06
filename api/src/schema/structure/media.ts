import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { getModelForClass, modelOptions, Prop } from '@typegoose/typegoose';
import { BaseFileObject, DownloadLinks, ViewportSizes } from './baseFile';
import { AccessLevel } from '../users/access';

@modelOptions({ schemaOptions: { collection: 'media' } })
class MediaDB extends BaseFileObject {
  @Prop()
  readonly _id: ObjectId;
}

export const MediaModel = getModelForClass(MediaDB);

@ObjectType({ description: 'media object' })
export default class Media implements MediaDB {
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

  @Field({ description: 'date created' })
  created: number;

  @Field({ description: 'date updated' })
  updated: number;
}
