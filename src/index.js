const inquirer = require('inquirer');
const fs = require('fs');
const program = require('commander');
const chalk = require('chalk');
const download = require('download-git-repo');
const ora = require('ora');
const symbols = require('log-symbols');
const handlebars = require('handlebars');
const config = require('../src/config');

try {
  program
    .version('0.0.1', '-v, --version')
    .command('init [name]')
    .description('init project')
    .action((name) => {
      if(!fs.existsSync(name)) {
        inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Project name',
            default: name
          },
          {
            type: 'input',
            name: 'description',
            message: 'Project description',
            default: 'A miniprogram project',
          },
          {
            type: 'input',
            name: 'author',
            message: 'Author',
            default: 'modojs'
          },
          {
            type: 'list',
            name: 'language',
            message: 'Select compiler language',
            default: 'ts',
            choices: ['ts', 'js']
          },
        ]).then(answer => {
          const spinner = ora('Template Downloading...').start();
          download(`direct:${config.git.url}#${answer.language}`, name, {clone: true}, (err) => {
            if(err) {
              spinner.fail();
              console.log(symbols.error, chalk.red(err));
            } else {
              spinner.succeed();
              const fileName = `${name}/package.json`;
              if(fs.existsSync(fileName)){
                const content = fs.readFileSync(fileName).toString();
                const temp = handlebars.compile(content);
                const meta = {
                  name: answer.name || name,
                  description: answer.description,
                  author: answer.author
                };
                const result = temp(meta);
                fs.writeFileSync(fileName, result);
              }
              console.log(symbols.success, chalk.green('project init successd!\n'));
              console.log('  ' + symbols.info, chalk.green('$ cd ' + answer.name || name));
              console.log('  ' + symbols.info, chalk.green('$ npm install'));
              console.log('  ' + symbols.info, chalk.green('$ npm run dev\n'));
              console.log(symbols.success, chalk.green('Happy Hacking!'));
            }
          });
        });
      } else {
        console.log(symbols.error, chalk.red(name + 'aleady exists'));
      }
    })
    program.on('-h, --help', function(){
      console.log('\nSet up a miniprogram (wechat app) by running one command.');
      console.log('Examples:');
      console.log('  $ create-wxapp-cli init myProject');
    });
    program
    .command('*')
    .action(function() {
      console.log('\nSet up a miniprogram (wechat app) by running one command.');
      console.log('\nExamples:');
      console.log('  $ create-wxapp-cli init myProject');
    })
  program.parse(process.argv);
} catch (error) {
  console.error(error)
}
