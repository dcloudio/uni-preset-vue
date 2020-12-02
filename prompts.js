module.exports = [{
  type: 'list',
  name: 'template',
  message: '请选择 uni-app 模板',
  choices: [{
    name: '默认模板',
    value: 'default'
  },{
    name: '默认模板(TypeScript)',
    value: 'default-ts'
  }
  ],
  default: 'None'
},
{
  when: answers => answers.template === 'custom',
  type: 'input',
  name: 'repo',
  message: '请输入自定义 uni-app 模板地址',
  filter (input) {
    return new Promise(function (resolve, reject) {
      if (input) {
        resolve(input)
      } else {
        reject(new Error('uni-app 模板地址不能为空'))
      }
    })
  }
}
]
