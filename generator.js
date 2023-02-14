const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')

const isBinary = require('isbinaryfile')

async function generate(dir, files, base = '', rootOptions = {}) {
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
      let content = fs.readFileSync(sourcePath, 'utf-8')
      if (path.basename(filename) === 'manifest.json') {
        content = content.replace('{{name}}', rootOptions.projectName || '')
      }
      if (filename.charAt(0) === '_' && filename.charAt(1) !== '_') {
        files[`.${filename.slice(1)}`] = content
      } else if (filename.charAt(0) === '_' && filename.charAt(1) === '_') {
        files[`${filename.slice(1)}`] = content
      } else {
        files[filename] = content
      }
    }
  })
}

module.exports = (api, options, rootOptions) => {
  const templateWithSass = [
    'dcloudio/hello-uniapp',
    'dcloudio/uni-template-news'
  ]
  api.extendPackage(pkg => {
    return {
      devDependencies: {
        '@dcloudio/uni-helper-json': '*',
        '@dcloudio/types': '^3.3.2',
        'miniprogram-api-typings': '*',
        'mini-types': '*',
        'postcss-comment': '^2.0.0'
      }
    }
  })
  api.extendPackage(pkg => {
    return {
      dependencies: {
        'vue': '>= 2.6.14 < 2.7'
      },
      devDependencies: {
        'vue-template-compiler': '>= 2.6.14 < 2.7',
      }
    }
  }, { forceOverwrite: true })
  if (options.template === 'default-ts') { // 启用 typescript
    api.extendPackage(pkg => {
      const isV4 = api.cliVersion.split('.')[0] === '4'
      return {
        dependencies: {
          'vue-class-component': '^6.3.2',
          'vue-property-decorator': '^8.0.0'
        },
        devDependencies: {
          '@babel/plugin-syntax-typescript': '^7.2.0',
          '@vue/cli-plugin-typescript': '~' + api.cliServiceVersion,
          'typescript': isV4 ? '~4.1.5' : '~4.5.5'
        }
      }
    })
  } else if (templateWithSass.includes(options.template)) {
    api.extendPackage(pkg => {
      return {
        devDependencies: {
          'sass': '^1.49.8',
          'sass-loader': '^8.0.2'
        }
      }
    })
  }

  api.render(async function (files) {
    Object.keys(files).forEach(name => {
      delete files[name]
    })

    const template = options.repo || options.template

    const base = 'src'
    await generate(path.resolve(__dirname, './template/common'), files)
    if (template === 'default') {
      await generate(path.resolve(__dirname, './template/default'), files, base, rootOptions)
    } else if (template === 'default-ts') {
      await generate(path.resolve(__dirname, './template/common-ts'), files)
      await generate(path.resolve(__dirname, './template/default-ts'), files, base, rootOptions)

      // default-ts 模板删除 jsconfig.json
      process.nextTick(() => {
        const folderPath = path.resolve(process.cwd(), rootOptions.projectName)
        const jsconfigPath = path.resolve(folderPath, './jsconfig.json')
        const tsconfigPath = path.resolve(folderPath, './tsconfig.json')

        if (fs.existsSync(jsconfigPath) && fs.existsSync(tsconfigPath)) {
          fs.unlinkSync(jsconfigPath)
        }
      })
    } else {
      const ora = require('ora')
      const home = require('user-home')
      const download = require('download-git-repo')

      const spinner = ora('模板下载中...')
      spinner.start()

      const tmp = path.join(home, '.uni-app/templates', template.replace(/[/:]/g, '-'), 'src')

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

      // 合并模板依赖
      const jsonPath = path.join(tmp, './package.json')
      if (fs.existsSync(jsonPath)) {
        try {
          const json = fs.readFileSync(jsonPath, { encoding: 'utf-8' })
          content = JSON.parse(json)
          api.extendPackage(pkg => {
            return {
              dependencies: Object.assign({}, content.dependencies),
              devDependencies: Object.assign({}, content.devDependencies)
            }
          })
        } catch (error) {
          console.warn('package.json merge failed')
        }
      }

      const dirNames = ['cloudfunctions-aliyun', 'cloudfunctions-tcb']
      dirNames.forEach(dirName => {
        const dirPath = path.join(tmp, './', dirName)
        if (fs.existsSync(dirPath)) {
          fse.moveSync(dirPath, path.join(tmp, '../', dirName), {
            overwrite: true
          })
        }
      })

      await generate(path.join(tmp, '../'), files, path.join(base, '../'))
    }
  })
}
