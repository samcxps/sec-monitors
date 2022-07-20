import axios from 'axios';

import { container } from '../log';

export type WebhookData = {
  readonly embeds: readonly unknown[];
};

const logger = container.get('general');

export const notify = async (webhook: string, data: WebhookData) => {
  try {
    axios.post(webhook, JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    logger.error(`utils: notify(): ${err}`);
  }
};
