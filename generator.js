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
		const filename = path.join(base, rawPath)

		if (isBinary.sync(sourcePath)) {
			files[filename] = fs.readFileSync(sourcePath) // return buffer
		} else {
			const content = fs.readFileSync(sourcePath, 'utf-8')
			if (sourcePath.indexOf('manifest.json') !== -1 || sourcePath.indexOf('pages.json') !== -1) {
				files[filename] = JSON.stringify(JSON.parse(stripJsonComments(content)), null, 2)
			} else if (filename.charAt(0) === '_' && filename.charAt(1) !== '_') {
				files[`.${filename.slice(1)}`] = content
			} else {
				files[filename] = content
			}
		}
	})

}

module.exports = (api, options, rootOptions) => {

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
