import childProcess from 'child_process';
import { logger } from 'jege/server';

const log = logger('[integration-test]');

function checkRandgenBin()
{
  if (process.env.RANDGEN_BIN === undefined) {
    throw new Error('RANDGEN_BIN is not defined');
  }

  if (process.env.RANDGEN_BIN_PATH === undefined) {
    throw new Error('RANDGEN_BIN_PATH is not defined');
  }

  log('checkRandgenBin(): randgen bin: %s, randgen bin path: %s',
      process.env.RANDGEN_BIN, process.env.RANDGEN_BIN_PATH);
}

export default function pretest() {
  checkRandgenBin();
}
