const {
  uniPostcssPlugin,
  parseRpx2UnitOnce
} = require('@dcloudio/uni-cli-shared')
module.exports = {
  plugins: [
    uniPostcssPlugin(),
    require('autoprefixer')()
  ]
}
