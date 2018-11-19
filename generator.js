const fs = require('fs')
const path = require('path')

const isBinary = require('isbinaryfile')
const stripJsonComments = require('strip-json-comments')


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
			const content = fs.readFileSync(sourcePath, 'utf-8')
			if (sourcePath.indexOf('manifest.json') !== -1 || sourcePath.indexOf('pages.json') !== -1) {
				files[path.join(base, rawPath)] = JSON.stringify(JSON.parse(stripJsonComments(content)), null, 2)
			} else {
				files[path.join(base, rawPath)] = content
			}
		}
	})

}

module.exports = (api, options, rootOptions) => {

	api.render(async function(files) {

		api.extendPackage({
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
