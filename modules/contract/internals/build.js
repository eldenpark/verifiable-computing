const { buildLogger } = require('jege/server');
// const chalk = require('chalk');
const del = require('del');
const gulp = require('gulp');

const { compile } = require('./ethdev');

const buildLog = buildLogger('[contract]');

const paths = {
  build: process.env.CONTRACT_BUILD_PATH,
};

gulp.task('clean', () => {
  const cleanPaths = [
    `${paths.build}/**/*`,
    `!${paths.build}/.gitkeep`,
  ];

  buildLog('clean', 'cleanPaths: %j', cleanPaths);

  return del(cleanPaths, {
    force: true,
  });
});

gulp.task('build-contract', (done) => {
  const buildPath = process.env.CONTRACT_BUILD_PATH;
  const contractsPath = process.env.CONTRACTS_PATH;

  buildLog('build-contract', 'buildPath: %s, contractsPath: %s',
           buildPath, contractsPath);

  try {
    compile(buildPath, contractsPath);
  } catch (err) {
    buildLog('build-contract', 'error: %s', err);
  }

  done();
});

gulp.task('build', gulp.series('clean', 'build-contract'));

if (require.main === module) {
  const build = gulp.task('build');
  build();
}

module.exports = {
  gulp,
};
