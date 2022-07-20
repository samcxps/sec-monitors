import { scheduleJob } from 'node-schedule';

import { CompanyMonitorConfig } from '../../models/company';
import { container } from '../../utils/log';

import { init, run } from './company';

/**
 * Document URL Schema
 *
 * https://www.sec.gov/Archives/edgar/data/ CIK / ACCESSION NUMBER / PRIMARY DOCUMENT
 *
 */

/**
 * Company monitor logger
 */
const logger = container.get('company-monitor');

/**
 * Main method takes ONE config...
 *  - Inits monitor
 *  - Schedules job to re-run and check for new forms
 */
const main = async (config: CompanyMonitorConfig) => {
  const { ticker } = config;

  // Get cron job from env so we can set diff timing across environments
  const cronjob = process.env.CRON_JOB;

  try {
    await init(config);

    // Run at 5pm
    scheduleJob(cronjob, async () => {
      await run(config);
    });
  } catch (err) {
    logger.error(`${ticker}: main(): ${err}`);
  }
};

export default main;
