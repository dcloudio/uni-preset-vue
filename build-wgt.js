/**
 * @author LinTx
 * @description
 * uni-app 打包wgt包
 * 适用于uni cli，vue3项目
 * 打包目录为appDir(./dist/build/app)
 * 输出目录为outputDir(./dist/build/wgt)
 * 打包时会自动读取manifest.json中的id和version.name生成wgt文件名(id-version.name.wgt)
 * 文件已存在时不会覆盖旧的打包文件，需要删除旧的wgt文件后重新打包，或者修改版本号后重新打包（有提示）
 * 需要先执行build命令（uni build -p app）
 * 可以在package.json中的script块添加以下脚本：
 * "build:wgt": "uni build -p app && node build-wgt.js"
 * 然后执行npm run build:wgt即可生成wgt包
 * @example node build-wgt.js
 * @example npm run build:wgt
 * @version 20241213 1.0.0
 */
const fs = require('fs');
const archiver = require('archiver');

//需要打包的文件目录
const appDir = './dist/build/app'
//输出的wgt文件目录
const outputDir = './dist/build/wgt';
//自动创建输出目录
fs.mkdirSync(outputDir, { recursive: true });

//读取配置信息
const manifest = require(`${appDir}/manifest.json`);
//构建输出文件名
const outputFile = `${outputDir}/${manifest.id}-${manifest.version.name}.wgt`;
if (fs.existsSync(outputFile)) {
    console.error("\x1b[31m%s\x1b[0m",`目标文件${outputFile}已存在，请删除旧版本或者修改版本号后重新生成！`);
    process.exit(1);
}

const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', {
    zlib: { level: 9 } // 设置压缩级别
});

archive.on('error', function (err) {
    throw err;
});

output.on('close', function () {
    console.log(`wgt包生成完毕
文件路径： ${outputFile}
文件大小： ${(archive.pointer() / 1024 / 1024).toFixed(1)}MB`);
});

archive.pipe(output);
archive.directory(appDir, '')
archive.finalize();