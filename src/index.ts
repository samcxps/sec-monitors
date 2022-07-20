/**
 * Load env files first
 */
import * as dotenv from 'dotenv';
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: envFile });

import { getConfigs } from './database';
import type { CompanyMonitorConfig } from './models/company';
import { company } from './monitors';
import { container } from './utils/log';

/**
 * Main logger
 */
const logger = container.get('main');

/**
 * List of monitor types to load
 */
const MONITORS = ['company'];

/**
 * Main method to init everything
 */
const main = async () => {
  try {
    /**
     * Iterate monitor types and load configs for each
     */
    MONITORS.forEach(async (monitorType) => {
      const configs = await getConfigs(monitorType);

      configs.forEach((config) => {
        switch (monitorType) {
          case 'company':
            company(config as CompanyMonitorConfig);
            break;

          default:
            return;
        }
      });
    });
  } catch (err) {
    logger.error(`error in main: ${err}`);
  }
};

main();
