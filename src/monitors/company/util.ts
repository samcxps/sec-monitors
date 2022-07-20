import axios from 'axios';

import { CompanyForm, CompanyMonitorConfig } from '../../models/company';

/**
 * Axios instance for data.sec.gov
 *
 * Headers set as per docs in:
 *  https://www.sec.gov/os/webmaster-faq#developers
 *
 * User agent in env variable because it should be custom per company/user/etc.
 *
 */
export const axiosInstance = axios.create({
  baseURL: 'https://data.sec.gov/',
  headers: {
    'User-Agent': process.env.USER_AGENT,
    'Accept-Encoding': 'gzip, deflate',
  },
});

/**
 * Craft webhook data to send
 */
export const makeWebhookData = (
  config: CompanyMonitorConfig,
  form: CompanyForm
) => {
  const { cik, ticker } = config;

  const cleanAccessNumber = form.accessionNumber.replaceAll('-', '');

  const url = `https://www.sec.gov/Archives/edgar/data/${cik}/${cleanAccessNumber}/${form.primaryDocument}`;

  return {
    embeds: [
      {
        title: `New $${ticker.toUpperCase()} Filing`,
        color: 5174599,
        url,
        footer: {
          text: 'https://github.com/samcxps',
          icon_url: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
        },
        fields: [
          { name: 'Accession Number', value: form.accessionNumber },
          { name: 'Filing Date', value: form.filingDate },
          { name: 'Form', value: form.form },
        ],
      },
    ],
  };
};
