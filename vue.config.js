const path = require('path')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  configureWebpack: {
    externals: {
      config: 'globalConf'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [resolve('node_modules/vue-awesome')]
        }
      ]
    }
    // plugins: [
    //   new MyAwesomeWebpackPlugin()
    // ]
  }
}
