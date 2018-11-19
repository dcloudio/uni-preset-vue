const fs = require('fs')
const path = require('path')

const isBinary = require('isbinaryfile')
const stripJsonComments = require('strip-json-comments')



module.exports = (api, options, rootOptions) => {

	api.extendPackage(pkg => {
		delete pkg.postcss
		delete pkg.browserslist
		return {
			dependencies: {
				'flyio': '^0.6.2',
				'vuex': '^3.0.1',
				'@dcloudio/uni-h5': '*'
			},
			devDependencies: {
				'@dcloudio/vue-cli-plugin-uni': '*'
			},
			browserslist: [
				'last 3 versions',
				'Android >= 4.4',
				'ios >= 8'
			]
		}
	})

	api.render(async function(files) {

		Object.keys(files).forEach(name => {
			delete files[name]
		})

		const template = options.repo || options.template

		const base = 'src'

		if (template === 'default') {
			await generate(path.resolve(__dirname, './template/default'), files, base)
		} else {
			const ora = require('ora')
			const home = require('user-home')
			const download = require('download-git-repo')

			const spinner = ora('模板下载中...')
			spinner.start()

			const tmp = path.join(home, '.uni-app/templates', template.replace(/[\/:]/g, '-'), 'src')

			if (fs.existsSync(tmp)) {
				try {
					require('rimraf').sync(tmp)
				} catch (e) {
					console.error(e)
				}
			}

			await new Promise((resolve, reject) => {
				download(template, tmp, err => {
					spinner.stop()
					if (err) {
						return reject(err)
					}
					resolve()
				})
			})

			await generate(tmp, files, base)
		}

		await generate(path.resolve(__dirname, './template/common'), files)

	})
}
