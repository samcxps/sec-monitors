import { Container, format, transports } from 'winston';

/**
 * Container for all logger types
 */
export const container = new Container();

/**
 * Create winston format based on label
 */
const getFormat = (label: string) =>
  format.combine(
    format.timestamp({
      format: 'MM-DD-YYYY HH:mm:ss',
    }),
    format.label({
      label,
    }),
    format.printf(
      (info) =>
        `[${info.timestamp}] [${info.level}] [${info.label}]: ${info.message}`
    ),
    format.colorize({
      all: true,
    })
  );

container.add('general', {
  level: 'debug',
  transports: [
    new transports.Console({
      format: getFormat('general'),
    }),
  ],
});

container.add('main', {
  level: 'debug',
  transports: [
    new transports.Console({
      format: getFormat('main'),
    }),
  ],
});

container.add('database', {
  level: 'debug',
  transports: [
    new transports.Console({
      format: getFormat('database'),
    }),
  ],
});

container.add('company-monitor', {
  level: 'debug',
  transports: [
    new transports.Console({
      format: getFormat('company-monitor'),
    }),
  ],
});
