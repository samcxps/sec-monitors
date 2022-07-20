import { ObjectId } from 'mongodb';

import { MonitorConfig } from './monitors';

/**
 * Config model in DB for company monitor
 */
export type CompanyMonitorConfig = MonitorConfig & {
  readonly ticker: string;
  readonly cik: string;
};

/**
 * Company form model in DB for company monitor
 */
export type CompanyForm = {
  readonly _id?: ObjectId;

  readonly accessionNumber: string;
  readonly filingDate: string;
  readonly form: string;
  readonly primaryDocument: string;
};

/**
 * JSON response from data.sec.gov/submissions/.......
 *
 * The types name is the API's endpoint
 *
 * There is a lot more attributes/values in the responses
 *  but these are the only ones we use
 */
export type Submissions = {
  readonly filings: Submissions_Filings;
};

export type Submissions_Filings = {
  readonly files: readonly unknown[];
  readonly recent: Submissions_RecentFilings;
};

export type Submissions_RecentFilings = {
  readonly accessionNumber: readonly string[];
  readonly filingDate: readonly string[];
  readonly form: readonly string[];
  readonly primaryDocument: readonly string[];
};
