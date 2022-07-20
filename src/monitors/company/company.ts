import { mongoClient } from '../../database';
import type {
  CompanyForm,
  CompanyMonitorConfig,
  Submissions,
} from '../../models/company';
import { container } from '../../utils/log';
import { notify } from '../../utils/notify';

import { axiosInstance, makeWebhookData } from './util';

const logger = container.get('company-monitor');

/**
 * Gets filings
 */
const getFilings = async (config: CompanyMonitorConfig) => {
  const { cik, ticker } = config;

  try {
    /**
     * sec.gov call
     */
    const url = `/submissions/CIK${cik}.json`;
    const { data } = await axiosInstance.get<Submissions>(url);
    const { filings } = data;
    const { recent } = filings;

    return recent;
  } catch (err) {
    logger.error(`$${ticker}: getFilings(): ${err}`);
    return null;
  }
};

/**
 * Send webhook after building webhook data
 */
const sendWebhook = async (
  config: CompanyMonitorConfig,
  newForms: readonly CompanyForm[]
) => {
  const { ticker, webhook } = config;

  logger.info(`$${ticker}: sendWebhook(): ${newForms.length} new forms`);

  newForms.forEach((form) => {
    const webhookData = makeWebhookData(config, form);
    notify(webhook, webhookData);
  });
};

/**
 * Run monitor
 *
 * This is the method that gets scheduled
 */
export const run = async (config: CompanyMonitorConfig) => {
  const { ticker } = config;

  logger.info(`$${ticker}: runMonitor()`);

  /**
   * Get the db/collection
   */
  const db = mongoClient.db('company');
  const forms = db.collection(ticker);

  try {
    /**
     * Get filings from data.sec.gov
     */
    const filings = await getFilings(config);

    /**
     * Pull data from filings
     */
    const { accessionNumber, filingDate, form, primaryDocument } = filings;

    /**
     * Get array of current forms accessionNumbers in db
     */
    const currForms: readonly string[] = await forms.distinct(
      'accessionNumber'
    );

    /**
     * Gets new form entries to push to DB and send notifications
     */
    const newForms = accessionNumber
      .filter((num) => {
        return currForms.indexOf(num) === -1;
      })
      .map((newAccessionNumber) => {
        // Get index of new form in accessionNumber[] from data.sec.gov
        const idx = accessionNumber.indexOf(newAccessionNumber);

        return {
          accessionNumber: accessionNumber[idx],
          filingDate: filingDate[idx],
          form: form[idx],
          primaryDocument: primaryDocument[idx],
        };
      });

    /**
     * Insert new entries if they exist
     */
    if (newForms && newForms.length) {
      forms.insertMany(newForms);
      sendWebhook(config, newForms as readonly CompanyForm[]);
    }
  } catch (err) {
    logger.error(`$${ticker}: runMonitor(): ${err}`);
  }
};

/**
 * Init monitor
 *
 * Only does stuff on first run
 */
export const init = async (config: CompanyMonitorConfig) => {
  const { ticker, webhook } = config;

  logger.info(`$${ticker}: init()`);

  try {
    /**
     * Get filings
     */
    const filings = await getFilings(config);

    if (!filings) {
      logger.info(`$${ticker}: init(): error retrieving filings`);
      return;
    }

    /**
     * Get data from filings
     */
    const { accessionNumber, filingDate, form, primaryDocument } = filings;

    /**
     * Get the db/collection
     */
    const db = mongoClient.db('company');
    const forms = db.collection(ticker);

    /**
     * Get count of collection and quit init if collection is not empty
     */
    const count = await forms.estimatedDocumentCount();

    if (count > 0) {
      logger.info(`$${ticker}: init(): not the first run... aborting init`);
      return;
    }

    /**
     * Create array of forms to put in collection
     */
    const docs = accessionNumber.map((_, idx: number) => ({
      accessionNumber: accessionNumber[idx],
      filingDate: filingDate[idx],
      form: form[idx],
      primaryDocument: primaryDocument[idx],
    }));

    /**
     * Insert
     */
    forms.insertMany(docs);

    /**
     * Webhook init message
     */
    const webhook_data = {
      embeds: [
        {
          title: `$${ticker} Monitor Initialized`,
          color: 1752220,
          footer: {
            text: 'https://github.com/samcxps',
            icon_url: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
          },
        },
      ],
    };

    notify(webhook, webhook_data);
  } catch (err) {
    logger.error(`$${ticker}: init(): ${err}`);
  }
};
