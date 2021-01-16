module.exports = [{
  type: 'list',
  name: 'template',
  message: '请选择 uni-app 模板',
  choices: [{
    name: '默认模板',
    value: 'default'
  },
  {
    name: '默认模板(TypeScript)',
    value: 'default-ts'
  },
  {
    name: 'Hello uni-app',
    value: 'dcloudio/hello-uniapp'
  },
  {
    name: '前后一体登录模板',
    value: 'dcloudio/uni-template-login'
  },
  {
    name: '看图模板',
    value: 'dcloudio/uni-template-picture'
  },
  {
    name: '新闻/资讯类模板',
    value: 'dcloudio/uni-template-news'
  },
  {
    name: '自定义模板',
    value: 'custom'
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
