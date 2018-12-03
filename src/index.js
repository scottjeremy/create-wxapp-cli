const inquirer = require('inquirer');
const fs = require('fs');
const program = require('commander');
const chalk = require('chalk');
const download = require('download-git-repo');
const ora = require('ora');
const symbols = require('log-symbols');
const handlebars = require('handlebars');

try {
  program
    .command('init [name]')
    .description('init project')
    .action((name) => {
      if(!fs.existsSync(name)) {
        // 列出项目名称
        inquirer.prompt([
          {
            type: 'list',
            name: 'language',
            message: '请选择编译语言\n',
            choices: ['ts', 'js']
          },
          {
            type: 'list',
            name: 'style',
            message: '请选择预编译样式\n',
            choices: ['scss', 'less']
          },
        ]).then(answer => {
          console.log(name, answer);
          const spinner = ora('正在下载模板...').start();
          download('direct:https://github.com/scottjeremy/create-wxapp-cli#master', name, {clone: true}, (err) => {
            if(err) {
              spinner.fail();
              console.log(symbols.error, chalk.red(err));
            } else {
              spinner.succeed();
              const fileName = `${name}/package.json`;
              if(fs.existsSync(fileName)){
                const content = fs.readFileSync(fileName).toString();
                const result = handlebars.compile(content);
                const meta = {
                  name,
                  language: answer.language,
                  style: answer.style
                }
                // fs.writeFileSync(fileName, result);
              }
              console.log(symbols.success, chalk.green('项目初始化完成'));
            }
          });
        });
      } else {
        // 错误提示项目已存在，避免覆盖原有项目
        console.log(symbols.error, chalk.red('项目已存在'));
      }
    });
  program.parse(process.argv);
} catch (error) {
  console.error(error)
}