const { buildLogger } = require('jege/server');
const chalk = require('chalk');
const del = require('del');
const gulp = require('gulp');
const path = require('path');
const ts = require('gulp-typescript');

const buildLog = buildLogger('[randgen]');
const tsProject = ts.createProject('tsconfig.json');

const paths = {
  build: process.env.RANDGEN_BUILD_PATH,
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

gulp.task('ts-buildgen', () => {
  buildLog('ts-buildgen', 'start compiling, buildPath: %s', paths.build);

return tsProject.src()
  .pipe(tsProject())
  .js.pipe(gulp.dest(paths.build));
});

gulp.task('build', gulp.series('clean', 'ts-buildgen'));

if (require.main === module) {
  const build = gulp.task('build');
  build();
}

module.exports = {
  gulp,
};
