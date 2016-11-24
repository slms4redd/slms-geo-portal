# SLMS portal refactoring

> Refactoring of the SLMS portal using vue.js

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# run unit tests
npm run unit

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Notes about node.js version

### Upgrade node.js
A recent node.js version is required, preferable > 6.
Use **nvm** to upgrade the node.js version.

Install **nvm** running:

`$# curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash`

and cross your fingers. for any problem check [this page](https://github.com/creationix/nvm/blob/master/README.markdown#installation)

Then in order to upload the node version run:

`$# nvm install 6.9.1`

### Debian derivates
Seems that the **node** binary is called **node.js** on Debian distros. This is due to namespace conflicts with other sw.

[Check out this page](http://stackoverflow.com/questions/21168141/cannot-install-packages-using-node-package-manager-in-ubuntu) for a workaround if you are experiencing an issue apparently related to this.

### Win10's Linux subsystems
Some issue have been reported trying to run the dev server on on Win10 Linux Subsystem so use a VM if you are working on windows. More info will be reported here.




