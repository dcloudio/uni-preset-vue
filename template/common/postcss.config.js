const pkg = require('./package.json')
module.exports = {
  parser: require('postcss-comment'),
  plugins: [
    require('postcss-import'),
    require('autoprefixer')({
      browsers: pkg.browserslist,
      remove: process.env.UNI_PLATFORM !== 'h5'
    }),
    require('@dcloudio/vue-cli-plugin-uni/packages/postcss')
  ]
}
