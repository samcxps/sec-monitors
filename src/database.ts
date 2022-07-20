import { MongoClient } from 'mongodb';

import { container } from './utils/log';

/**
 * MongoDB URI from env variables
 */
const MONGO_URI = process.env.MONGO_URI;

/**
 * Database logger
 */
const logger = container.get('database');

/**
 * Mongo client
 */
export const mongoClient = new MongoClient(MONGO_URI);

/**
 * Gets configs for a given monitor type
 */
export const getConfigs = async (monitorType: string) => {
  logger.info(`getConfigs(): loading ${monitorType} monitor configs`);

  try {
    const db = mongoClient.db(monitorType);
    const configs = await db.collection('config').find().toArray();

    return configs;
  } catch (err) {
    logger.error(`getConfigs(): ${err}`);
    return null;
  }
};
