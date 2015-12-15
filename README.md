# grunt-cloudfront-invalidate

> A simple plugin to trigger a cloudfront invalidation

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-cloudfront-invalidate --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-cloudfront-invalidate');
```

## The "cloudfront_invalidate" task

### Overview
In your project's Gruntfile, add a section named `cloudfront_invalidate` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  cloudfront_invalidate: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.accessKeyId
Type: `String`

Your aws cloudfront access key. Required.

#### options.secretAccessKey
Type: `String`

Your aws cloudfront secret key. Required.

#### options.distributionId
Type: `String`

Your aws cloudfront distribution id. Required.

#### options.debug
Type: `Boolean`

If <code>true</code>, the plugin will dump the generated invalidation options that will be sent to amazon
 
#### options.path
Type: `String|Array`

The path(s) to add to the invalidation batch. Can set to /* to invalidate all files in the dist.
 
#### options.files
Type: `Object`

The [grunt files config](http://gruntjs.com/configuring-tasks#files) for the files you would like to invalidate.

### Usage Examples

#### Invalidate all files
```
{
    config: {
        options: {
            accessKeyId: <YOUR_ACCESS_KEY>,
            secretAccessKey: <YOUR_SECRET_KEY>,
            distributionId: <YOUR_DISTRIBUTION_ID>,
            path: '/*'
        },
    }
}
```

#### Invalidate only JS files
```
{
    config: {
        options: {
            accessKeyId: <YOUR_ACCESS_KEY>,
            secretAccessKey: <YOUR_SECRET_KEY>,
            distributionId: <YOUR_DISTRIBUTION_ID>,
        },
        files: {
            expand: true,
            src: ['**/*.js'],
            dest: '/'
        }
    }
}
```

## Contributing
Feel free to report bugs, suggest features and submit pull requests on GitHub!

## Release History
v 1.0.0 - Initial Commit