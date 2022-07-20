import { Container, format, transports } from 'winston';

export const logTypes = ['general', 'main', 'database', 'company-monitor'];

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

/**
 * Create log types
 */
logTypes.forEach((type) =>
  container.add(type, {
    level: 'debug',
    transports: [
      new transports.Console({
        format: getFormat(type),
      }),
    ],
  })
);
