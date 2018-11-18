const fs = require('fs')
const path = require('path')

const isBinary = require('isbinaryfile')


async function generate(dir, files, base = '') {

	const glob = require('glob')

	glob.sync('**/*', {
		cwd: dir,
		nodir: true
	}).forEach(rawPath => {
		const sourcePath = path.resolve(dir, rawPath)
		if (isBinary.sync(sourcePath)) {
			files[path.join(base, rawPath)] = fs.readFileSync(sourcePath) // return buffer
		} else {
			files[path.join(base, rawPath)] = fs.readFileSync(sourcePath, 'utf-8')
		}
	})

}

module.exports = (api, options, rootOptions) => {

	api.render(async function(files) {

		api.extendPackage({
			dependencies: {
				'vuex': '^3.0.1',
				'@dcloudio/uni-h5': '*',
				'@vue/cli-service': '^3.1.4'
			},
			devDependencies: {
				'@dcloudio/vue-cli-plugin-uni': '*'
			},
			babel: {
				presets: [
					['@vue/app', {
						useBuiltIns: 'entry'
					}]
				]
			},
			browserslist: [
				'last 3 versions',
				'Android >= 4.4',
				'ios >= 8'
			],
			postcss: {
				plugins: {
					autoprefixer: {},
					'@dcloudio/vue-cli-plugin-uni/packages/postcss': {}
				}
			},
			vue: {
				baseUrl: '/',
				assetsDir: 'static',
				css: {
					extract: false
				}
			}
		})

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
					require('rimraf/rimraf').sync.rm(tmp)
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
