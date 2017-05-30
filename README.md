# SLMS geoportal

> Satellite Landcover Monitoring System geoportal

User documentation: https://slms4redd.github.io/slms-geo-portal/

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

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
As reported [here](https://cjibo.com/2016/10/11/bash-on-windows-is-beta/) there are some problems running node.js on win10
bash shell.

As suggested workaround run `npm run dev` or `npm run build` from the windows terminal.

For example if you are logged-in on winows with the user **slmsuser** and the git repo is cloned in `/home/slmsuser/work/code/portal-vue` you can reach that location in the Ubuntu filesystem from windows at the path `C:\Users\slmsuser\AppData\Local\lxss\home\slmsuser\work\code\portal-vue` and run from there **npm**





