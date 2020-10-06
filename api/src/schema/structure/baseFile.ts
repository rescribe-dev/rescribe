import { prop as Property } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { AccessLevel } from '../users/access';

@ObjectType({ description: 'file viewport info' })
export class ViewportSizes {
  @Field()
  @Property({ required: true })
  width: number;

  @Field()
  @Property({ required: true })
  height: number;
}

@ObjectType({ description: 'download link data' })
export class DownloadLinks {
  @Field()
  original: string;

  @Field()
  blurred: string;
}

export class BaseFileObject {
  @Property({ required: true })
  name: string;

  downloadLinks?: DownloadLinks;

  @Property({ required: false, type: ViewportSizes })
  viewportSizes?: ViewportSizes;

  @Property({ required: true })
  mime: string;

  @Property({ required: true })
  fileSize: number;

  @Property({ required: true })
  public: AccessLevel;

  @Property({ required: true })
  created: number;

  @Property({ required: true })
  updated: number;
}
