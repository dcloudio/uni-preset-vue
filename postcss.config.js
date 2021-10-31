const {
  uniPostcssPlugin,
  parseRpx2UnitOnce
} = require('@dcloudio/uni-cli-shared')
module.exports = {
  plugins: [
    uniPostcssPlugin(
      Object.assign(
        {
          page:
            process.env.UNI_PLATFORM === 'h5'
              ? 'uni-page-body'
              : process.env.UNI_PLATFORM === 'app'
              ? 'body'
              : ''
        },
        parseRpx2UnitOnce(process.env.UNI_INPUT_DIR, process.env.UNI_PLATFORM)
      )
    ),
    require('autoprefixer')()
  ]
}
