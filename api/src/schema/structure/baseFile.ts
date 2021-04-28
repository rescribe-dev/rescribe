import { prop as Property } from '@typegoose/typegoose';
import { AccessLevel } from '../users/access';

export class BaseFileObject {
  @Property({ required: true })
  name: string;

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
