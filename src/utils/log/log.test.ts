import test from 'ava';

import { container, logTypes } from './log';

test('Winston Container', (t) => {
  t.truthy(container.loggers.size === logTypes.length);
});
