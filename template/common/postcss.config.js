const pkg = require('./package.json')
module.exports = {
	plugins: [
		require("autoprefixer")({
			browsers: pkg.browserslist
		}),
		// require("./packages/@uni-app/postcss")
	]
}
