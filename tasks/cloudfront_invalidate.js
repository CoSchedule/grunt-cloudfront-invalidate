/*
 * grunt-cloudfront-invalidate
 * https://github.com/CoSchedule/grunt-cloudfront-invalidate
 *
 * Copyright (c) 2015 cosrnos
 * Licensed under the MIT license.
 */

'use strict';

// Dependencies
var AWS = require('aws-sdk');

module.exports = function (grunt) {
    grunt.registerMultiTask('cloudfront_invalidate', 'A simple plugin to trigger a cloudfront invalidation', function () {
        var invalidateParams;
        var done = this.async();
        var options = this.options({
            args: this.args,
            reference: this.nameArgs
        });

        if (options.debug) {
            grunt.log.ok(options.reference + ' options:', options);
        }

        if (!validateOptions(options, grunt)) {
            return done(false);
        }

        var Config = new AWS.Config({
            accessKeyId: options.accessKeyId,
            secretAccessKey: options.secretAccessKey
        });
        var CloudFront = new AWS.CloudFront(Config);

        invalidateParams = buildInvalidation(options, this.files);

        if (!invalidateParams) {
            grunt.log.error("Unable to build invalidation from given input.");
            return done(false);
        }

        if (options.debug) {
            grunt.log.ok(options.reference + ' invalidation:');
            grunt.log.ok(invalidateParams);
            return;
        }

        CloudFront.createInvalidation(invalidateParams, function (err/**, data **/) {
            if (err) {
                grunt.log.error("Error from AWS: ", (err && err.stack) || err);
                return done(false);
            }

            grunt.log.ok(options.reference + " invalidation finished.");
            return done();
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
                Items: []
            }
        }
    };
}

function generateCallerReference(config) {
    var ref = 'grunt_cloudfront_invalidate';

    // Setup Reference
    if (config.args && config.args.length) {
        ref += '_' + config.args.join('_');
    }

    return ref + '_' + (+new Date());
}

function addPathsFromConfig(invalidation, config) {
    if (!config.path) {
        return invalidation;
    }

    if (Array.isArray(config.path)) {
        invalidation.InvalidationBatch.Paths.Items = invalidation.InvalidationBatch.Paths.Items.concat(config.path);
        invalidation.InvalidationBatch.Paths.Quantity += config.path.length;
    } else if (typeof config.path === 'string') {
        addToBatch(invalidation, config.path);
    }

    return invalidation;
}

function addToBatch(invalidation, path) {
    invalidation.InvalidationBatch.Paths.Items.push(path);
    invalidation.InvalidationBatch.Paths.Quantity += 1;
    return invalidation
}

function addPathsFromFiles(invalidation, files) {
    files.forEach(function (path) {
        addToBatch(invalidation, path.dest);
    });
}

function buildInvalidation(config, files) {
    var invalidationConfig = getBasicInvalidation(config);

    addPathsFromConfig(invalidationConfig, config);

    addPathsFromFiles(invalidationConfig, files);

    return invalidationConfig;
}

function validateOptions(options, grunt) {
    var options_valid = true;
    if (!options.accessKeyId) {
        grunt.log.error('Please provide an accessKeyId');
        options_valid = false;
    }
    if (!options.secretAccessKey) {
        grunt.log.error('Please provide a secretAccessKey');
        options_valid = false;
    }
    if (!options.distributionId) {
        grunt.log.error('Please provide a distributionId');
        options_valid = false;
    }

    return options_valid;
}