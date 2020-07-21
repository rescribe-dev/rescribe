import { ObjectId } from 'mongodb';
import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'sitemaps' } })
export class Sitemap {
  readonly _id: ObjectId;

  @Property({ required: true })
  name: string;

  @Property({ required: true })
  hash: string;

  @Property({ required: true, type: Number })
  lastmod: number;
}

export const SitemapModel = getModelForClass(Sitemap);
