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

	// 	api.extendPackage(pkg => {
	// 		delete pkg.postcss
	// 		delete pkg.browserslist
	// 		return {
	// 			scripts: {
	// 				'serve': 'npm run dev:h5',
	// 				'build': 'npm run build:h5',
	// 				'dev:h5': 'cross-env NODE_ENV=development UNI_PLATFORM=h5 vue-cli-service uni-serve',
	// 				'build:h5': 'cross-env NODE_ENV=production UNI_PLATFORM=h5 vue-cli-service uni-build',
	// 				'dev:mp-weixin': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-weixin vue-cli-service uni-build --watch',
	// 				'dev:mp-baidu': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-baidu vue-cli-service uni-build --watch',
	// 				'dev:mp-alipay': 'cross-env NODE_ENV=development UNI_PLATFORM=mp-alipay vue-cli-service uni-build --watch',
	// 				'build:mp-weixin': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-weixin vue-cli-service uni-build',
	// 				'build:mp-baidu': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-baidu vue-cli-service uni-build',
	// 				'build:mp-alipay': 'cross-env NODE_ENV=production UNI_PLATFORM=mp-alipay vue-cli-service uni-build'
	// 			},
	// 			dependencies: {
	// 				'flyio': '^0.6.2',
	// 				'vuex': '^3.0.1',
	// 				'@dcloudio/uni-h5': '*',
	// 				'@dcloudio/uni-mp-weixin': '*',
	// 				'@dcloudio/uni-mp-baidu': '*',
	// 				'@dcloudio/uni-mp-alipay': '*'
	// 			},
	// 			devDependencies: {
	// 				'@dcloudio/vue-cli-plugin-uni': '*'
	// 			},
	// 			browserslist: [
	// 				'last 3 versions',
	// 				'Android >= 4.4',
	// 				'ios >= 8'
	// 			]
	// 		}
	// 	})

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
