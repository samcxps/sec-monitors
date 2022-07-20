import { ObjectId } from 'mongodb';

export type MonitorConfig = {
  readonly _id?: ObjectId;
  readonly webhook: string;
};
