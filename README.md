[![Mac build](https://img.shields.io/travis/dainst/idai-field-client/master.svg?label=mac%20build)](https://travis-ci.org/dainst/idai-field-client)
[![Windows build](https://img.shields.io/appveyor/ci/dainst/idai-field-client/master.svg?label=windows%20build)](https://ci.appveyor.com/project/dainst/idai-field-client)

# iDAI.field 2 Client

## Documentation

A **user manual** with documented workflows and usage is available 
[here](https://github.com/dainst/idai-field-documentation).

Admin documentation is can be found [here](docs/README.md).
   
## Prerequisites

The iDAI.field2 development stack runs under MacOS, Windows, Linux. 
To set it up, you need to install

* [NodeJS](https://nodejs.org/en/) > 7.0.0
* Node Package Manager ([NPM](https://www.npmjs.com/)) 

## Quickstart

Clone this repository locally and run

```
$ npm install
$ npm run build
$ npm start
```

`npm run build` compiles the typescript files, creates [configuration](config/README.md) files and 
converts scss files. `npm start` starts the electron app. For a fast development workflow it is 
recommended to set up your IDE to compile the typescript files continuously while you are working 
on the sources. That way you can just hit reload to see changes made to the *.ts* or *.html* files.

## Testing

The app must have been build (`npm run build`) before running the tests.

To execute the **unit tests**, run 

```
$ npm test   
```

For troubleshooting information see [here](docs/unit-test-troubleshooting.md).

To execute **e2e tests**, run 

```
$ npm run e2e [noff|ff] [default|flaky]
```

The optional fail fast parameter specifies if test execution stops on the first error (`ff`) or continues until all tests are finished (`noff`). If not specified, the default mode is `noff`. The parameter is non optional, if the test suite parameter is used.

There is are two test suites, called `default` and `flaky`. Unless specified explicitely with `flaky`, the `default` suite gets executed. 

## Packaging

To create binaries run 

```
$ npm run package[-mac|-win]
```

Without using one of the specified suffixed, this will create packages for both MacOs and Windows 32/64 bit.
If used with one of the suffixed, only packages for the selected target platform get created. When the command has finished execution, you find packages of the application for different operating systems in the `release`-directory.

Please note that when using **Windows**, that due to nested node_modules and the 
windows default maximum path length you might be running into errors while attempting
to extract the package. In that case, please use a different archiver, for example [7-Zip](http://www.7-zip.org/download.html).

When using **MacOS**, you need [Wine](http://www.davidbaumgold.com/tutorials/wine-mac/) to build windows [packages](https://github.com/dainst/idai-field-client/blob/master/README.md#packacking).

Not that creating Linux packages should be possible with electron, but here this is yet untested and not enabled.


