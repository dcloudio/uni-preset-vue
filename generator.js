const fs = require('fs')
const path = require('path')


async function generate(dir, files, base = '') {

	const globby = require('globby')

	const _files = await globby(['**/*'], {
		cwd: dir
	})

	for (const rawPath of _files) {
		files[path.join(base, rawPath)] = fs.readFileSync(path.resolve(dir, rawPath), 'utf-8')
	}
}

module.exports = (api, options, rootOptions) => {

	api.render(async function(files) {

		api.extendPackage({
			dependencies: {
				'@dcloudio/uni-h5': '^0.0.1'
			},
			devDependencies: {
				'@dcloudio/vue-cli-plugin-uni': '^0.0.1',
				'download-git-repo': '^1.1.0',
				'globby': '^8.0.1',
				'ora': '^3.0.0',
				'rimraf': '^2.6.2',
				'user-home': '^2.0.0'
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
			vue: {
				baseUrl: '/',
				assetsDir: 'static'
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
				require('rimraf').sync.rm(tmp)
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
