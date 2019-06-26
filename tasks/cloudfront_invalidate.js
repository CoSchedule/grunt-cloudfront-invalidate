/*
 * grunt-cloudfront-invalidate
 * https://github.com/CoSchedule/grunt-cloudfront-invalidate
 *
 * Copyright (c) 2015 cosrnos
 * Licensed under the MIT license.
 */
const AWS = require('aws-sdk');

const description = 'A simple plugin to trigger a cloudfront invalidation';

module.exports = function CloudFrontInvalidate(grunt) {
  grunt.registerMultiTask('cloudfront_invalidate', description, function CloudFrontInvalidateTask() {
    const done = this.async();
    const options = this.options({
      args: this.args,
      reference: this.nameArgs,
    });

    if (options.debug) {
      grunt.log.ok(`${options.reference} options:`, options);
    }

    if (!validateOptions(options, grunt)) {
      done(false);
      return;
    }

    const Config = new AWS.Config({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
    });
    const CloudFront = new AWS.CloudFront(Config);

    const invalidation = buildInvalidation(options, this.files);

    if (!invalidation) {
      grunt.log.error('Unable to build invalidation from given input.');
      done(false);
      return;
    }

    if (options.debug) {
      grunt.log.ok(`${options.reference} invalidation:`);
      grunt.log.ok(invalidation);
    }

    CloudFront.createInvalidation(invalidation, (err/** , data * */) => {
      if (err) {
        grunt.log.error('Error from AWS: ', (err && err.stack) || err);
        done(false);
        return;
      }

      grunt.log.ok(`${options.reference} invalidation finished.`);
      done();
    });
  });
};

function getBasicInvalidation(config) {
  return {
    DistributionId: config.distributionId,
    InvalidationBatch: {
      CallerReference: generateCallerReference(config),
      Paths: {
        Quantity: 0,
        Items: [],
      },
    },
  };
}

function generateCallerReference(config) {
  let ref = 'grunt_cloudfront_invalidate';

  // Setup Reference
  if (config.args && config.args.length) {
    ref += `_${config.args.join('_')}`;
  }

  return `${ref}_${+new Date()}`;
}

function addPathsFromConfig(invalidation, config) {
  if (!config.path) {
    return invalidation;
  }

  if (Array.isArray(config.path)) {
    // eslint-disable-next-line no-param-reassign
    invalidation.InvalidationBatch.Paths.Items = invalidation.InvalidationBatch.Paths.Items.concat(config.path);
    // eslint-disable-next-line no-param-reassign
    invalidation.InvalidationBatch.Paths.Quantity += config.path.length;
  } else if (typeof config.path === 'string') {
    addToBatch(invalidation, config.path);
  }

  return invalidation;
}

function addToBatch(invalidation, path) {
  invalidation.InvalidationBatch.Paths.Items.push(path);
  // eslint-disable-next-line no-param-reassign
  invalidation.InvalidationBatch.Paths.Quantity += 1;
  return invalidation;
}

function addPathsFromFiles(invalidation, files) {
  files.forEach((path) => {
    addToBatch(invalidation, path.dest);
  });
}

function buildInvalidation(config, files) {
  const invalidation = getBasicInvalidation(config);

  addPathsFromConfig(invalidation, config);

  addPathsFromFiles(invalidation, files);

  return invalidation;
}

function validateOptions(options, grunt) {
  if (!options.accessKeyId) {
    grunt.log.error('Please provide an accessKeyId');
    return false;
  }
  if (!options.secretAccessKey) {
    grunt.log.error('Please provide a secretAccessKey');
    return false;
  }
  if (!options.distributionId) {
    grunt.log.error('Please provide a distributionId');
    return false;
  }

  return true;
}
